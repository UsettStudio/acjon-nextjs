-- =============================================================================
-- 0016 Fase 7: lansering etter avtale fra plattformadmin
-- =============================================================================
--
-- Prosjekter med mer enn 199 enheter, eller med en annen avtale, lanseres uten
-- oppstartsavgift i appen (avsnitt 23 i docs/arkitektur.md). Til nå krevde det
-- SQL med service-rollen. Nå kan plattformadmin gjøre det i Plattformadmin.
-- Avtalen må beskrives i et notat, og lanseringen logges med plattformadmin
-- som aktør.

create function public.platform_launch_project(
  p_project_id uuid,
  p_unit_limit integer default null,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not app.is_platform_admin() then
    raise exception 'Bare plattformadmin kan lansere prosjekter etter avtale' using errcode = '42501';
  end if;
  if nullif(btrim(p_note), '') is null then
    raise exception 'Beskriv avtalen i notatet' using errcode = '22023';
  end if;
  perform public.waive_project_launch(p_project_id, p_unit_limit, p_note);
end;
$$;

comment on function public.platform_launch_project(uuid, integer, text) is
  'Plattformadmin lanserer et prosjekt uten oppstartsavgift etter avtale. Notatet er påkrevd og står i revisjonsloggen.';

grant execute on function public.platform_launch_project(uuid, integer, text) to authenticated;
