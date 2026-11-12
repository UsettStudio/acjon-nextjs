-- =============================================================================
-- 0013 Fase 5: kvalitet
-- =============================================================================
--
-- Prosjektoversikten (modul 5): antall og verdi per status, og fremdriften i
-- oppstarten som sjekkliste. Funksjonen kjører med rettighetene til den som
-- spør (security invoker), så RLS gjelder for alt den teller.

-- -----------------------------------------------------------------------------
-- Prosjektoversikt
-- -----------------------------------------------------------------------------
-- Verdi er summen av prisen (units.price). Omkostninger og fellesgjeld er ikke
-- med. Enheter uten pris telles i «unpriced», så oversikten kan si fra at
-- summen er ufullstendig. Summene regnes i databasen, så de er riktige også når
-- prosjektet har flere enheter enn ett API-svar kan gi.

create function public.project_overview(p_project_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'statuses', coalesce((
      select jsonb_agg(
        jsonb_build_object('status', s.status, 'units', s.units, 'value', s.value, 'unpriced', s.unpriced)
        order by s.status
      )
      from (
        select
          u.status,
          count(*) as units,
          coalesce(sum(u.price), 0) as value,
          count(*) filter (where u.price is null) as unpriced
        from public.units u
        where u.project_id = p_project_id
        group by u.status
      ) s
    ), '[]'::jsonb),
    'views_with_image', (
      select count(*) from public.selector_views v
      where v.project_id = p_project_id and v.asset_id is not null
    ),
    'marked_units', (
      select count(distinct h.target_unit_id) from public.hotspots h
      where h.project_id = p_project_id and h.target_type = 'unit'
    ),
    -- Den publiserte boligvelgeren hvis det finnes en, ellers den eldste.
    'selector', (
      select jsonb_build_object('id', s.id, 'published', s.published_at is not null)
      from public.selectors s
      where s.project_id = p_project_id
      order by s.published_at is null, s.created_at
      limit 1
    ),
    'site', (
      select jsonb_build_object('id', s.id, 'published', s.published_at is not null)
      from public.sites s
      where s.project_id = p_project_id
    )
  );
$$;

comment on function public.project_overview(uuid) is
  'Antall og verdi per status, og fremdriften i oppstarten (bilde, markeringer, mal og publisering). Følger RLS.';

grant execute on function public.project_overview(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- Revisjonslogg ved kaskader
-- -----------------------------------------------------------------------------
-- Rader som slettes i en kaskade (sletting av prosjekt eller organisasjon), skal
-- ikke logges rad for rad. Postgres kjører AFTER-triggerne for slike rader først
-- etter den ytre setningen, med pg_trigger_depth() = 1, så kontrollen av dybden
-- fanget dem ikke. Da ble det skrevet logg for et prosjekt eller en organisasjon
-- som var slettet, og slettingen stoppet på fremmednøkkelen i audit_log. Nå
-- kjennes kaskaden igjen på at organisasjonen eller prosjektet ikke finnes.

create or replace function app.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row jsonb := to_jsonb(case when tg_op = 'DELETE' then old else new end);
  v_old jsonb := case when tg_op = 'UPDATE' then to_jsonb(old) end;
  v_data jsonb := '{}'::jsonb;
  v_changed boolean := tg_op <> 'UPDATE';
  v_column text;
  v_reason text := nullif(current_setting('app.audit_reason', true), '');
begin
  -- Kaskader (sletting av organisasjon, prosjekt eller bruker) logges ikke rad for rad.
  if pg_trigger_depth() > 1 then
    return null;
  end if;
  if tg_op = 'DELETE' and (
    not exists (select 1 from public.organizations o where o.id = (v_row ->> 'organization_id')::uuid)
    or (
      v_row ->> 'project_id' is not null
      and not exists (select 1 from public.projects p where p.id = (v_row ->> 'project_id')::uuid)
    )
  ) then
    return null;
  end if;

  for i in 1 .. tg_nargs - 1 loop
    v_column := tg_argv[i];
    v_data := v_data || jsonb_build_object(v_column, v_row -> v_column);
    if tg_op = 'UPDATE' and (v_old -> v_column) is distinct from (v_row -> v_column) then
      v_changed := true;
      v_data := v_data || jsonb_build_object('previous_' || v_column, v_old -> v_column);
    end if;
  end loop;

  if not v_changed then
    return null;
  end if;

  if v_reason is not null then
    v_data := v_data || jsonb_build_object('reason', v_reason);
  end if;

  perform app.write_audit(
    (v_row ->> 'organization_id')::uuid,
    (v_row ->> 'project_id')::uuid,
    tg_argv[0] || '.' || case tg_op when 'INSERT' then 'created' when 'UPDATE' then 'updated' else 'deleted' end,
    tg_argv[0],
    (v_row ->> 'id')::uuid,
    v_data
  );
  return null;
end;
$$;
