-- =============================================================================
-- 0007 Fillagring, sanntid og planlagte jobber
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Storage: bucket «media»
-- -----------------------------------------------------------------------------
-- Stier: {organization_id}/{asset_id}/original.{ext} og {organization_id}/{asset_id}/w{800|1600|2400}.webp
--
-- Bucketen er offentlig for lesing, slik at bilder kan leveres fra CDN på
-- publiserte sider. Stiene inneholder to tilfeldige uuid-er og kan ikke gjettes.
-- Opplasting, overskriving og sletting styres av policyene under.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  52428800,  -- 50 MB (dokumenter). Bilder begrenses til 25 MB i appen og i assets-tabellen.
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "media: medlemmer ser organisasjonens filer" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'media'
    and app.try_uuid((storage.foldername(name))[1]) in (select app.org_ids_with_role())
  );

create policy "media: innholdsroller laster opp" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'media'
    and app.try_uuid((storage.foldername(name))[1]) in (select app.org_ids_with_role(app.roles_content(), true))
  );

create policy "media: innholdsroller erstatter" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'media'
    and app.try_uuid((storage.foldername(name))[1]) in (select app.org_ids_with_role(app.roles_content(), true))
  )
  with check (
    bucket_id = 'media'
    and app.try_uuid((storage.foldername(name))[1]) in (select app.org_ids_with_role(app.roles_content(), true))
  );

-- Redaktører sletter egne opplastinger via serveren etter at assets-raden er slettet.
create policy "media: eier og admin sletter" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'media'
    and app.try_uuid((storage.foldername(name))[1]) in (select app.org_ids_with_role(app.roles_admin(), true))
  );

-- -----------------------------------------------------------------------------
-- Realtime
-- -----------------------------------------------------------------------------
-- Admin (Status-modus og enhetstabellen) lytter på endringer i units via
-- Postgres Changes. RLS gjelder, så brukere får bare hendelser fra egne prosjekter.
-- Publiserte velgere bruker i stedet den offentlige broadcast-kanalen fra
-- app.broadcast_unit_status(), som bare inneholder enhets-id og status.

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.units;
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Planlagte jobber (pg_cron, kjører i databasen i EU)
-- -----------------------------------------------------------------------------

create extension if not exists pg_cron with schema pg_catalog;

-- Hver natt kl. 02:17 UTC: slett leads eldre enn organisasjonens lagringstid,
-- gamle webhook-leveranser og utløpte rate limit-vinduer.
select cron.schedule('daglig-vedlikehold', '17 2 * * *', 'select app.run_daily_maintenance()');
