-- =============================================================================
-- 0009 Fase 1: prosjekter, enheter, import og mediebibliotek
-- =============================================================================
--
-- Alle funksjonene her kjører med innlogget brukers rettigheter (security invoker),
-- så RLS gjelder for hver rad de skriver. Tilgangssjekken først gir bare en
-- tydeligere feilmelding og stopper hele operasjonen før noe er skrevet.

-- -----------------------------------------------------------------------------
-- Statusloggen viser navnet på den som endret status
-- -----------------------------------------------------------------------------

alter table public.unit_status_events
  add constraint unit_status_events_changed_by_profile_fkey
  foreign key (changed_by) references public.profiles (id) on delete set null;

-- -----------------------------------------------------------------------------
-- Mediebibliotek: hver fil har sin egen mappe {organization_id}/{asset_id}/
-- -----------------------------------------------------------------------------
-- Originalen og WebP-variantene ligger i samme mappe, slik at alt kan slettes
-- samlet. Sjekkene er CHECK-regler (ikke triggere), så RLS vurderes først.

create function app.valid_asset_variants(p_variants jsonb, p_prefix text)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_variant jsonb;
begin
  if p_variants is null or jsonb_typeof(p_variants) <> 'array' or jsonb_array_length(p_variants) > 10 then
    return false;
  end if;
  for v_variant in select value from jsonb_array_elements(p_variants) loop
    if jsonb_typeof(v_variant) <> 'object'
       or jsonb_typeof(v_variant -> 'path') <> 'string'
       or not starts_with(v_variant ->> 'path', p_prefix)
       or (v_variant ->> 'path') ~ '\.\.'
       or jsonb_typeof(v_variant -> 'width') <> 'number'
       or jsonb_typeof(v_variant -> 'height') <> 'number'
       or (v_variant ->> 'width')::numeric <= 0
       or (v_variant ->> 'height')::numeric <= 0 then
      return false;
    end if;
  end loop;
  return true;
end;
$$;

grant execute on function app.valid_asset_variants(jsonb, text) to authenticated, service_role;

alter table public.assets
  add constraint assets_storage_path_in_asset_folder
    check (starts_with(storage_path, organization_id::text || '/' || id::text || '/') and storage_path !~ '\.\.'),
  add constraint assets_variants_valid
    check (app.valid_asset_variants(variants, organization_id::text || '/' || id::text || '/'));

-- Redaktører kan slette egne filer i Storage (originalen og variantene de selv har
-- lastet opp), på samme måte som de kan slette egne rader i assets. Da trengs ikke
-- service-nøkkelen for å rydde opp. Eier og administrator kan slette alt (migrasjon 0007).
create policy "media: opplaster sletter egne filer" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'media'
    and owner_id = (select auth.uid())::text
    and app.try_uuid((storage.foldername(name))[1]) in (select app.org_ids_with_role(app.roles_content(), true))
  );

-- -----------------------------------------------------------------------------
-- Enhetens adresse følger enhetsnummeret
-- -----------------------------------------------------------------------------
-- Uendret fra migrasjon 0005, bortsett fra én ting: får en enhet nytt nummer,
-- og adressen (slug) var laget automatisk fra det gamle nummeret, lages den
-- på nytt. En adresse som er satt for hånd beholdes.

create or replace function app.units_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  -- Feltene en megler kan endre.
  v_sales_columns constant text[] := array[
    'status', 'price', 'purchase_costs', 'shared_debt', 'monthly_fee', 'updated_at'
  ];
begin
  if new.slug is null or new.slug = '' then
    new.slug := coalesce(app.slugify(new.unit_number), 'enhet');
  elsif tg_op = 'UPDATE'
        and new.unit_number is distinct from old.unit_number
        and new.slug = old.slug
        and old.slug = coalesce(app.slugify(old.unit_number), 'enhet') then
    new.slug := coalesce(app.slugify(new.unit_number), 'enhet');
  end if;

  if (tg_op = 'INSERT'
      or new.floor_plan_asset_ids is distinct from old.floor_plan_asset_ids
      or new.gallery_asset_ids is distinct from old.gallery_asset_ids
      or new.document_asset_ids is distinct from old.document_asset_ids)
     and exists (
       select 1
       from unnest(new.floor_plan_asset_ids || new.gallery_asset_ids || new.document_asset_ids) as ids(id)
       where not exists (
         select 1 from public.assets a
         where a.id = ids.id and a.organization_id = new.organization_id
       )
     ) then
    raise exception 'Filer på en enhet må ligge i organisasjonens mediebibliotek'
      using errcode = '23503';
  end if;

  -- Megler uten innholdsrolle i prosjektet kan bare endre status og pris.
  -- Gjelder direkte endringer (trigger-dybde 1), ikke interne kaskader.
  if tg_op = 'UPDATE'
     and pg_trigger_depth() = 1
     and (select auth.uid()) is not null
     and (to_jsonb(new) - v_sales_columns) is distinct from (to_jsonb(old) - v_sales_columns)
     and not app.has_project_role(new.project_id, app.roles_content(), true) then
    raise exception 'Meglere kan bare endre status og pris' using errcode = '42501';
  end if;

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Opprette prosjekt med byggetrinn og bygg i én transaksjon
-- -----------------------------------------------------------------------------
-- p_project:   { name, phase, address, postal_code, city, municipality, lat, lng,
--                description, milestones, contacts }
-- p_stages:    [{ "name": "Trinn 1", "buildings": ["Hus A", "Hus B"] }, ...]
-- p_buildings: ["Bygg uten byggetrinn", ...]
-- Adressen (slug) lages fra navnet og får tall på slutten hvis den er i bruk.

create function public.create_project(
  p_organization_id uuid,
  p_project jsonb,
  p_stages jsonb default '[]'::jsonb,
  p_buildings jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_input public.projects;
  -- Id-en lages her: RETURNING ville krevd at den nye raden allerede var synlig
  -- for lese-policyen, og det er den ikke i samme setning.
  v_project_id uuid := gen_random_uuid();
  v_phase public.project_phase;
  v_base text;
  v_slug text;
  v_suffix integer := 1;
  v_stage jsonb;
  v_stage_order integer := 0;
  v_stage_id uuid;
  v_building text;
  v_building_order integer := 0;
begin
  if not app.has_org_role(p_organization_id, app.roles_admin(), true) then
    raise exception 'Mangler tilgang til å opprette prosjekter' using errcode = '42501';
  end if;
  if p_project is null or jsonb_typeof(p_project) <> 'object'
     or jsonb_typeof(coalesce(p_stages, '[]'::jsonb)) <> 'array'
     or jsonb_typeof(coalesce(p_buildings, '[]'::jsonb)) <> 'array' then
    raise exception 'Ugyldig prosjekt' using errcode = '22023';
  end if;

  v_input := jsonb_populate_record(null::public.projects, p_project);

  v_base := trim(both '-' from left(coalesce(app.slugify(v_input.name), 'prosjekt'), 70));
  v_slug := v_base;
  while exists (
    select 1 from public.projects p where p.organization_id = p_organization_id and p.slug = v_slug
  ) loop
    v_suffix := v_suffix + 1;
    v_slug := v_base || '-' || v_suffix;
  end loop;

  v_phase := coalesce(v_input.phase, 'draft');
  insert into public.projects (
    id, organization_id, name, slug, phase, address, postal_code, city, municipality, lat, lng,
    description, milestones, contacts
  )
  values (
    v_project_id, p_organization_id, btrim(v_input.name), v_slug, v_phase,
    nullif(btrim(v_input.address), ''), nullif(btrim(v_input.postal_code), ''),
    nullif(btrim(v_input.city), ''), nullif(btrim(v_input.municipality), ''),
    v_input.lat, v_input.lng, nullif(btrim(v_input.description), ''),
    coalesce(v_input.milestones, '[]'::jsonb), coalesce(v_input.contacts, '[]'::jsonb)
  );

  for v_stage in select value from jsonb_array_elements(coalesce(p_stages, '[]'::jsonb)) loop
    v_stage_order := v_stage_order + 1;
    insert into public.stages (organization_id, project_id, name, sort_order, phase)
    values (p_organization_id, v_project_id, btrim(v_stage ->> 'name'), v_stage_order, v_phase)
    returning id into v_stage_id;

    for v_building in
      select value from jsonb_array_elements_text(coalesce(v_stage -> 'buildings', '[]'::jsonb))
    loop
      v_building_order := v_building_order + 1;
      insert into public.buildings (organization_id, project_id, stage_id, name, sort_order)
      values (p_organization_id, v_project_id, v_stage_id, btrim(v_building), v_building_order);
    end loop;
  end loop;

  for v_building in select value from jsonb_array_elements_text(coalesce(p_buildings, '[]'::jsonb)) loop
    v_building_order := v_building_order + 1;
    insert into public.buildings (organization_id, project_id, name, sort_order)
    values (p_organization_id, v_project_id, btrim(v_building), v_building_order);
  end loop;

  return jsonb_build_object('id', v_project_id, 'slug', v_slug);
end;
$$;

-- -----------------------------------------------------------------------------
-- Import av enheter
-- -----------------------------------------------------------------------------
-- Én rad per enhet. Finnes enhetsnummeret i prosjektet fra før, oppdateres
-- enheten; ellers opprettes den. Alt skjer i én transaksjon: feiler én rad,
-- lagres ingenting.
--
-- p_columns er kolonnene som er koblet i importen. Bare de endres på
-- eksisterende enheter. En tom verdi (null) tømmer feltet, unntatt for type,
-- status og «skjult», der tom verdi betyr «behold» (eller standardverdi for nye).
-- «stage» og «building» er navn. Byggetrinn og bygg som ikke finnes, opprettes.
-- Statusendringer logges med kilde «import».

create function app.audit_units_imported(p_project_id uuid, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_organization_id uuid;
begin
  if not app.has_project_role(p_project_id, app.roles_content(), true) then
    raise exception 'Mangler tilgang' using errcode = '42501';
  end if;
  select p.organization_id into v_organization_id from public.projects p where p.id = p_project_id;
  perform app.write_audit(v_organization_id, p_project_id, 'units.imported', 'project', p_project_id, p_data);
end;
$$;

grant execute on function app.audit_units_imported(uuid, jsonb) to authenticated;

create function public.import_units(p_project_id uuid, p_rows jsonb, p_columns text[])
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  c_allowed constant text[] := array[
    'unit_number', 'title', 'unit_type', 'status', 'floor', 'rooms', 'bedrooms', 'bathrooms',
    'bra_i', 'bra_e', 'bra_b', 'tba', 'plot_area', 'price', 'purchase_costs', 'shared_debt',
    'monthly_fee', 'ownership_type', 'orientation', 'parking', 'storage', 'description',
    'external_id', 'is_hidden', 'stage', 'building'
  ];
  -- Påkrevde felt der en tom celle betyr «behold eksisterende verdi».
  c_keep_when_empty constant text[] := array['unit_type', 'status', 'is_hidden'];
  v_organization_id uuid;
  v_item jsonb;
  v_index integer := 0;
  v_unit_number text;
  v_name text;
  v_patch jsonb;
  v_existing public.units;
  v_new public.units;
  v_stage_id uuid;
  v_building_id uuid;
  v_next_sort integer;
  v_inserted integer := 0;
  v_updated integer := 0;
  v_unchanged integer := 0;
  v_status_changed integer := 0;
  v_stages_created integer := 0;
  v_buildings_created integer := 0;
  v_constraint text;
  v_result jsonb;
begin
  if not app.has_project_role(p_project_id, app.roles_content(), true) then
    raise exception 'Mangler tilgang til å importere enheter i prosjektet' using errcode = '42501';
  end if;
  if p_rows is null or jsonb_typeof(p_rows) <> 'array'
     or jsonb_array_length(p_rows) not between 1 and 2000 then
    raise exception 'Importen må ha mellom 1 og 2000 rader' using errcode = '22023';
  end if;
  if p_columns is null or not ('unit_number' = any (p_columns)) or not (p_columns <@ c_allowed) then
    raise exception 'Ugyldige kolonner i importen' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_rows) as r(value)
    group by btrim(r.value ->> 'unit_number')
    having count(*) > 1
  ) then
    raise exception 'Samme enhetsnummer står flere ganger i importen' using errcode = '23505';
  end if;

  select p.organization_id into v_organization_id from public.projects p where p.id = p_project_id;
  select coalesce(max(u.sort_order), 0) into v_next_sort from public.units u where u.project_id = p_project_id;

  perform set_config('app.status_source', 'import', true);
  perform set_config('app.status_note', '', true);

  begin
    for v_item in select value from jsonb_array_elements(p_rows) loop
      v_index := v_index + 1;
      if jsonb_typeof(v_item) <> 'object' then
        raise exception 'Raden er ikke et objekt' using errcode = '22023';
      end if;
      v_unit_number := btrim(v_item ->> 'unit_number');
      if v_unit_number is null or v_unit_number = '' then
        raise exception 'Mangler enhetsnummer' using errcode = '23502';
      end if;

      -- Bare kolonnene som er koblet. Navn på byggetrinn og bygg behandles under.
      select coalesce(jsonb_object_agg(e.key, e.value), '{}'::jsonb) into v_patch
      from jsonb_each(v_item) as e
      where e.key = any (p_columns)
        and e.key not in ('unit_number', 'stage', 'building')
        and not (e.key = any (c_keep_when_empty) and jsonb_typeof(e.value) = 'null');

      v_stage_id := null;
      if 'stage' = any (p_columns) then
        v_name := nullif(btrim(v_item ->> 'stage'), '');
        if v_name is not null then
          select s.id into v_stage_id
          from public.stages s
          where s.project_id = p_project_id and lower(s.name) = lower(v_name)
          order by s.sort_order, s.created_at
          limit 1;
          if v_stage_id is null then
            insert into public.stages (organization_id, project_id, name, sort_order)
            select v_organization_id, p_project_id, v_name, coalesce(max(s.sort_order), 0) + 1
            from public.stages s where s.project_id = p_project_id
            returning id into v_stage_id;
            v_stages_created := v_stages_created + 1;
          end if;
        end if;
        v_patch := v_patch || jsonb_build_object('stage_id', v_stage_id);
      end if;

      if 'building' = any (p_columns) then
        v_building_id := null;
        v_name := nullif(btrim(v_item ->> 'building'), '');
        if v_name is not null then
          -- Samme navn i flere byggetrinn: velg bygget i enhetens byggetrinn.
          select b.id into v_building_id
          from public.buildings b
          where b.project_id = p_project_id and lower(b.name) = lower(v_name)
          order by (b.stage_id is not distinct from v_stage_id) desc, b.sort_order, b.created_at
          limit 1;
          if v_building_id is null then
            insert into public.buildings (organization_id, project_id, stage_id, name, sort_order)
            select v_organization_id, p_project_id, v_stage_id, v_name, coalesce(max(b.sort_order), 0) + 1
            from public.buildings b where b.project_id = p_project_id
            returning id into v_building_id;
            v_buildings_created := v_buildings_created + 1;
          end if;
        end if;
        v_patch := v_patch || jsonb_build_object('building_id', v_building_id);
      end if;

      select * into v_existing
      from public.units u
      where u.project_id = p_project_id and u.unit_number = v_unit_number
      for update;

      if found then
        v_new := jsonb_populate_record(v_existing, v_patch);
        if v_new is not distinct from v_existing then
          v_unchanged := v_unchanged + 1;
        else
          if v_new.status is distinct from v_existing.status then
            v_status_changed := v_status_changed + 1;
          end if;
          update public.units
             set title = v_new.title,
                 unit_type = v_new.unit_type,
                 status = v_new.status,
                 floor = v_new.floor,
                 rooms = v_new.rooms,
                 bedrooms = v_new.bedrooms,
                 bathrooms = v_new.bathrooms,
                 bra_i = v_new.bra_i,
                 bra_e = v_new.bra_e,
                 bra_b = v_new.bra_b,
                 tba = v_new.tba,
                 plot_area = v_new.plot_area,
                 price = v_new.price,
                 purchase_costs = v_new.purchase_costs,
                 shared_debt = v_new.shared_debt,
                 monthly_fee = v_new.monthly_fee,
                 ownership_type = v_new.ownership_type,
                 orientation = v_new.orientation,
                 parking = v_new.parking,
                 storage = v_new.storage,
                 description = v_new.description,
                 external_id = v_new.external_id,
                 is_hidden = v_new.is_hidden,
                 stage_id = v_new.stage_id,
                 building_id = v_new.building_id
           where id = v_existing.id;
          v_updated := v_updated + 1;
        end if;
      else
        v_new := jsonb_populate_record(null::public.units, v_patch);
        v_next_sort := v_next_sort + 1;
        insert into public.units (
          organization_id, project_id, unit_number, title, unit_type, status, floor, rooms, bedrooms,
          bathrooms, bra_i, bra_e, bra_b, tba, plot_area, price, purchase_costs, shared_debt,
          monthly_fee, ownership_type, orientation, parking, storage, description, external_id,
          is_hidden, stage_id, building_id, sort_order, source
        )
        values (
          v_organization_id, p_project_id, v_unit_number, v_new.title,
          coalesce(v_new.unit_type, 'apartment'), coalesce(v_new.status, 'available'),
          v_new.floor, v_new.rooms, v_new.bedrooms, v_new.bathrooms, v_new.bra_i, v_new.bra_e,
          v_new.bra_b, v_new.tba, v_new.plot_area, v_new.price, v_new.purchase_costs,
          v_new.shared_debt, v_new.monthly_fee, v_new.ownership_type, v_new.orientation,
          v_new.parking, v_new.storage, v_new.description, v_new.external_id,
          coalesce(v_new.is_hidden, false), v_new.stage_id, v_new.building_id, v_next_sort, 'import'
        );
        v_inserted := v_inserted + 1;
      end if;
    end loop;
  exception when others then
    -- Radnummeret (1 = første rad i importen) og regelen som stoppet raden
    -- sendes med, så appen kan vise en presis feilmelding.
    get stacked diagnostics v_constraint = constraint_name;
    raise exception using
      errcode = sqlstate,
      message = sqlerrm,
      detail = 'import_row=' || v_index,
      hint = coalesce(nullif(v_constraint, ''), '');
  end;

  perform set_config('app.status_source', '', true);

  v_result := jsonb_build_object(
    'inserted', v_inserted,
    'updated', v_updated,
    'unchanged', v_unchanged,
    'status_changed', v_status_changed,
    'stages_created', v_stages_created,
    'buildings_created', v_buildings_created
  );
  perform app.audit_units_imported(p_project_id, v_result);
  return v_result;
end;
$$;

-- -----------------------------------------------------------------------------
-- Masseendring av pris i prosent
-- -----------------------------------------------------------------------------
-- Prisen avrundes til nærmeste p_round_to kroner. Enheter uten pris endres ikke.
-- Meglere kan bruke den (de kan endre pris). Alle enhetene må være tilgjengelige.

create function public.adjust_unit_prices(
  p_unit_ids uuid[],
  p_percent numeric,
  p_round_to integer default 1000
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_requested integer;
  v_allowed integer;
  v_changed integer;
begin
  if p_percent is null or p_percent = 0 or p_percent < -90 or p_percent > 1000 then
    raise exception 'Prosentendringen må være mellom -90 og 1000 og ikke 0' using errcode = '22023';
  end if;
  if p_round_to is null or p_round_to not in (1, 10, 100, 1000, 10000) then
    raise exception 'Ugyldig avrunding' using errcode = '22023';
  end if;

  select count(distinct ids.id) into v_requested from unnest(p_unit_ids) as ids(id);
  select count(*) into v_allowed
  from public.units u
  where u.id = any (p_unit_ids)
    and u.project_id in (select app.project_ids_with_role(app.roles_sales(), true));
  if v_requested = 0 or v_allowed <> v_requested then
    raise exception 'Mangler tilgang til å endre pris på en eller flere enheter' using errcode = '42501';
  end if;

  update public.units u
     set price = (round(u.price * (1 + p_percent / 100) / p_round_to) * p_round_to)::bigint
   where u.id = any (p_unit_ids)
     and u.price is not null;
  get diagnostics v_changed = row_count;
  return v_changed;
end;
$$;

-- -----------------------------------------------------------------------------
-- Antall enheter per status, for prosjektlisten
-- -----------------------------------------------------------------------------

create function public.unit_status_counts(p_project_ids uuid[])
returns table (project_id uuid, status public.unit_status, units bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select u.project_id, u.status, count(*)
  from public.units u
  where u.project_id = any (p_project_ids)
  group by u.project_id, u.status;
$$;

grant execute on function
  public.create_project(uuid, jsonb, jsonb, jsonb),
  public.import_units(uuid, jsonb, text[]),
  public.adjust_unit_prices(uuid[], numeric, integer),
  public.unit_status_counts(uuid[])
to authenticated;
