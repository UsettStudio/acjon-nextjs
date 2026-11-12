-- =============================================================================
-- 0010 Fase 2: boligvelger
-- =============================================================================
--
-- Editoren lagrer automatisk. Hver lagring sender alle markeringene i visningen,
-- og databasen erstatter dem i én transaksjon. Da kan angre og gjør om i
-- nettleseren aldri gi en halvlagret visning.

-- -----------------------------------------------------------------------------
-- Lagre markeringene i en visning
-- -----------------------------------------------------------------------------
-- p_hotspots: [{ id, shape, points, target_type, target_unit_id, target_view_id,
--               target_project_id, target_url, label }, ...] i tegnerekkefølge.
-- Markeringer i visningen som ikke er med i listen, slettes. Id-ene lages i
-- nettleseren, så samme markering beholder id-en mellom lagringer.

create function public.save_view_hotspots(p_view_id uuid, p_hotspots jsonb)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_view public.selector_views;
  v_item jsonb;
  v_index integer := 0;
  v_rows integer;
begin
  select * into v_view from public.selector_views v where v.id = p_view_id;
  if not found or not app.has_project_role(v_view.project_id, app.roles_content(), true) then
    raise exception 'Mangler tilgang til å endre visningen' using errcode = '42501';
  end if;
  if p_hotspots is null or jsonb_typeof(p_hotspots) <> 'array' or jsonb_array_length(p_hotspots) > 2000 then
    raise exception 'Ugyldige markeringer' using errcode = '22023';
  end if;

  delete from public.hotspots h
   where h.view_id = p_view_id
     and not exists (
       select 1 from jsonb_array_elements(p_hotspots) as e(value)
       where app.try_uuid(e.value ->> 'id') = h.id
     );

  for v_item in select value from jsonb_array_elements(p_hotspots) loop
    v_index := v_index + 1;
    if jsonb_typeof(v_item) <> 'object' or app.try_uuid(v_item ->> 'id') is null then
      raise exception 'Markering % mangler gyldig id', v_index using errcode = '22023';
    end if;

    insert into public.hotspots (
      id, organization_id, project_id, view_id, shape, points, target_type, target_unit_id,
      target_view_id, target_project_id, target_url, label, sort_order
    )
    values (
      (v_item ->> 'id')::uuid,
      v_view.organization_id,
      v_view.project_id,
      p_view_id,
      (v_item ->> 'shape')::public.hotspot_shape,
      v_item -> 'points',
      nullif(v_item ->> 'target_type', '')::public.hotspot_target_type,
      app.try_uuid(v_item ->> 'target_unit_id'),
      app.try_uuid(v_item ->> 'target_view_id'),
      app.try_uuid(v_item ->> 'target_project_id'),
      nullif(btrim(v_item ->> 'target_url'), ''),
      nullif(btrim(v_item ->> 'label'), ''),
      v_index
    )
    on conflict (id) do update
       set shape = excluded.shape,
           points = excluded.points,
           target_type = excluded.target_type,
           target_unit_id = excluded.target_unit_id,
           target_view_id = excluded.target_view_id,
           target_project_id = excluded.target_project_id,
           target_url = excluded.target_url,
           label = excluded.label,
           sort_order = excluded.sort_order
     where public.hotspots.view_id = p_view_id;

    get diagnostics v_rows = row_count;
    if v_rows = 0 then
      raise exception 'Markering % hører til en annen visning', v_index using errcode = '23505';
    end if;
  end loop;

  return v_index;
end;
$$;

-- -----------------------------------------------------------------------------
-- Rekkefølge på visninger (dra og slipp i visningstreet)
-- -----------------------------------------------------------------------------

create function public.reorder_selector_views(p_selector_id uuid, p_view_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_selector public.selectors;
begin
  select * into v_selector from public.selectors s where s.id = p_selector_id;
  if not found or not app.has_project_role(v_selector.project_id, app.roles_content(), true) then
    raise exception 'Mangler tilgang til å endre boligvelgeren' using errcode = '42501';
  end if;
  if p_view_ids is null or cardinality(p_view_ids) = 0 or exists (
    select 1 from unnest(p_view_ids) as ids(id)
    where not exists (
      select 1 from public.selector_views v where v.id = ids.id and v.selector_id = p_selector_id
    )
  ) then
    raise exception 'Visningene må tilhøre boligvelgeren' using errcode = '22023';
  end if;

  update public.selector_views v
     set sort_order = ids.position
    from unnest(p_view_ids) with ordinality as ids(id, position)
   where v.id = ids.id
     and v.sort_order is distinct from ids.position;
end;
$$;

-- -----------------------------------------------------------------------------
-- Er det endringer som ikke er publisert?
-- -----------------------------------------------------------------------------
-- Sammenligner øyeblikksbildet som er publisert, med det som ville blitt publisert nå.

create function public.get_selector_publish_state(p_selector_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_selector public.selectors;
begin
  select * into v_selector from public.selectors s where s.id = p_selector_id;
  if not found or not (
    app.has_project_role(v_selector.project_id, app.roles_all(), false) or app.is_platform_admin()
  ) then
    raise exception 'Mangler tilgang til boligvelgeren' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'published_at', v_selector.published_at,
    'has_changes', v_selector.published_snapshot is distinct from app.build_selector_snapshot(v_selector.id)
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- Prosjektet til en publisert boligvelger (enhetssiden i den publiserte velgeren)
-- -----------------------------------------------------------------------------

create function public.get_published_selector_project(p_selector_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select s.project_id from public.selectors s where s.id = p_selector_id and s.published_at is not null;
$$;

-- -----------------------------------------------------------------------------
-- Visning på publiserte sider: statusfarger og pris på solgte enheter
-- -----------------------------------------------------------------------------
-- Endrer bare disse to nøklene i projects.settings, så andre innstillinger
-- (for eksempel offentlige egne felt) ikke overskrives. Tomt fargeobjekt betyr
-- at organisasjonens farger gjelder.

create function public.set_project_display_settings(
  p_project_id uuid,
  p_status_colors jsonb,
  p_show_price_on_sold boolean
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not app.has_project_role(p_project_id, app.roles_content(), true) then
    raise exception 'Mangler tilgang til prosjektet' using errcode = '42501';
  end if;
  if p_status_colors is null or jsonb_typeof(p_status_colors) <> 'object' or exists (
    select 1 from jsonb_each(p_status_colors) as c(key, value)
    where c.key not in ('available', 'reserved', 'sold', 'upcoming')
       or jsonb_typeof(c.value) <> 'string'
       or (c.value #>> '{}') !~ '^#[0-9a-fA-F]{6}$'
  ) then
    raise exception 'Ugyldige statusfarger' using errcode = '22023';
  end if;

  update public.projects p
     set settings = p.settings || jsonb_build_object(
       'status_colors', p_status_colors,
       'show_price_on_sold', coalesce(p_show_price_on_sold, false)
     )
   where p.id = p_project_id;
end;
$$;

grant execute on function
  public.save_view_hotspots(uuid, jsonb),
  public.set_project_display_settings(uuid, jsonb, boolean),
  public.reorder_selector_views(uuid, uuid[]),
  public.get_selector_publish_state(uuid)
to authenticated;

grant execute on function public.get_published_selector_project(uuid) to anon, authenticated, service_role;
