-- =============================================================================
-- Skjemaregler som skal gjelde for alle tabeller og funksjoner, også nye
-- =============================================================================
begin;
create extension if not exists pgtap with schema extensions;

select plan(14);

select is_empty(
  $$ select c.relname::text
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity $$,
  'RLS er slått på for alle tabeller i public'
);

select is_empty(
  $$ select t.table_name::text
     from information_schema.tables t
     where t.table_schema = 'public' and t.table_type = 'BASE TABLE'
       and t.table_name not in ('profiles', 'platform_admins')
       and not exists (
         select 1 from information_schema.columns c
         where c.table_schema = 'public' and c.table_name = t.table_name
           and c.column_name = 'organization_id' and c.data_type = 'uuid'
       ) $$,
  'Alle tabeller har organization_id (unntatt brukertabellene profiles og platform_admins)'
);

select is_empty(
  $$ select t.table_name || '.' || required.column_name
     from information_schema.tables t
     cross join (values ('id'), ('created_at'), ('updated_at')) as required(column_name)
     where t.table_schema = 'public' and t.table_type = 'BASE TABLE'
       and not exists (
         select 1 from information_schema.columns c
         where c.table_schema = 'public' and c.table_name = t.table_name
           and c.column_name = required.column_name
       ) $$,
  'Alle tabeller har id, created_at og updated_at'
);

select is_empty(
  $$ select c.relname::text
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
     join pg_index i on i.indrelid = c.oid and i.indisprimary
     join pg_attribute a on a.attrelid = c.oid and a.attnum = i.indkey[0]
     where n.nspname = 'public' and c.relkind = 'r'
       and (cardinality(i.indkey::int2[]) <> 1 or a.attname <> 'id' or a.atttypid <> 'uuid'::regtype) $$,
  'Primærnøkkelen er id (uuid) i alle tabeller'
);

-- En fremmednøkkel regnes som indeksert når nøkkelkolonnene er de første kolonnene i en indeks.
select is_empty(
  $$ select con.conrelid::regclass::text || ' (' || con.conname || ')'
     from pg_constraint con
     join pg_namespace n on n.oid = con.connamespace
     where con.contype = 'f' and n.nspname = 'public'
       and not exists (
         select 1
         from pg_index i
         where i.indrelid = con.conrelid
           and (
             select array_agg(k.attnum order by k.attnum)
             from unnest(i.indkey::int2[]) with ordinality as k(attnum, ord)
             where k.ord <= cardinality(con.conkey)
           ) = (select array_agg(x order by x) from unnest(con.conkey) as x)
       ) $$,
  'Alle fremmednøkler har en indeks'
);

select is_empty(
  $$ select table_name::text || ': ' || privilege_type
     from information_schema.role_table_grants
     where grantee = 'anon' and table_schema = 'public' $$,
  'anon har ingen tabellrettigheter i public'
);

select is_empty(
  $$ select p.oid::regprocedure::text
     from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname in ('public', 'app')
       and (
         p.proacl is null
         or exists (select 1 from aclexplode(p.proacl) a where a.grantee = 0 and a.privilege_type = 'EXECUTE')
       ) $$,
  'Ingen funksjoner i public eller app kan kjøres av PUBLIC'
);

select set_eq(
  $$ select p.proname::text
     from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname in ('public', 'app')
       and has_function_privilege('anon', p.oid, 'execute') $$,
  array[
    'get_published_selector', 'get_public_units', 'get_public_unit',
    'resolve_site', 'get_published_page', 'get_public_assets', 'get_invitation',
    'get_published_selector_project'
  ],
  'anon kan bare kjøre de offentlige lesefunksjonene og invitasjonsoppslaget'
);

select is_empty(
  $$ select p.oid::regprocedure::text
     from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname in ('public', 'app')
       and not exists (select 1 from unnest(p.proconfig) as cfg where cfg = 'search_path=""') $$,
  'Alle funksjoner i public og app har search_path = '''''
);

select is_empty(
  $$ select tablename || ': ' || policyname
     from pg_policies
     where schemaname in ('public', 'storage') and 'public' = any (roles) $$,
  'Ingen policyer gjelder for alle roller (PUBLIC)'
);

select is_empty(
  $$ select tablename || ': ' || policyname
     from pg_policies
     where schemaname = 'public' and 'anon' = any (roles) $$,
  'Ingen tabellpolicyer slipper inn anon'
);

select results_eq(
  $$ select public, allowed_mime_types from storage.buckets where id = 'media' $$,
  $$ values (true, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']) $$,
  'Bucket «media» finnes, er offentlig for lesing og tar bare JPG, PNG, WebP og PDF'
);

select ok(
  exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'units'
  ),
  'units er med i Realtime-publikasjonen (Status-modus i admin)'
);

select ok(
  exists (select 1 from cron.job where jobname = 'daglig-vedlikehold' and command like '%run_daily_maintenance%'),
  'Daglig vedlikehold (lagringstid for leads) er planlagt med pg_cron'
);

select * from finish();
rollback;
