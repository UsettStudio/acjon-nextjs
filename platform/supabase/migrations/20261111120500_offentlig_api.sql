-- =============================================================================
-- 0006 Offentlig lese-API
-- =============================================================================
--
-- Publiserte sider, boligvelgere, innbygging og det offentlige API-et henter data
-- bare gjennom disse funksjonene. De kan kalles med anon-nøkkelen og sørger selv for at
--   * bare publiserte data kommer ut (publisert boligvelger, prosjektside eller side),
--   * skjulte enheter aldri kommer ut,
--   * prisen skjules på solgte enheter når prosjektet er satt opp slik,
--   * interne felt aldri kommer ut: notater, logg, leads, external_id, source,
--     interne egne felt, kontaktpersoners bruker-id og lead-innstillinger.
-- Filstier returneres som stier i bucketen «media». Appen lager URL-er av dem.

-- -----------------------------------------------------------------------------
-- Byggeklosser
-- -----------------------------------------------------------------------------

create function app.public_asset(p_organization_id uuid, p_asset_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', a.id, 'path', a.storage_path, 'mime', a.mime, 'width', a.width, 'height', a.height,
    'alt', a.alt_text, 'filename', a.filename, 'bytes', a.bytes, 'variants', a.variants
  )
  from public.assets a
  where a.id = p_asset_id and a.organization_id = p_organization_id;
$$;

create function app.public_assets(p_organization_id uuid, p_asset_ids uuid[])
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', a.id, 'path', a.storage_path, 'mime', a.mime, 'width', a.width, 'height', a.height,
        'alt', a.alt_text, 'filename', a.filename, 'bytes', a.bytes, 'variants', a.variants
      )
      order by ids.ord
    ),
    '[]'::jsonb
  )
  from unnest(p_asset_ids) with ordinality as ids(id, ord)
  join public.assets a on a.id = ids.id and a.organization_id = p_organization_id;
$$;

create function app.public_project(p_project public.projects)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', p_project.id,
    'name', p_project.name,
    'slug', p_project.slug,
    'phase', p_project.phase,
    'address', p_project.address,
    'postal_code', p_project.postal_code,
    'city', p_project.city,
    'municipality', p_project.municipality,
    'lat', p_project.lat,
    'lng', p_project.lng,
    'description', p_project.description,
    'milestones', p_project.milestones,
    'show_price_on_sold', coalesce((p_project.settings ->> 'show_price_on_sold')::boolean, false)
  );
$$;

create function app.public_contacts(p_project public.projects)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'name', c.contact ->> 'name',
        'title', c.contact ->> 'title',
        'email', c.contact ->> 'email',
        'phone', c.contact ->> 'phone',
        'image', app.public_asset(p_project.organization_id, app.try_uuid(c.contact ->> 'image_asset_id'))
      )
      order by c.ord
    ),
    '[]'::jsonb
  )
  from jsonb_array_elements(p_project.contacts) with ordinality as c(contact, ord)
  where jsonb_typeof(c.contact) = 'object'
    and coalesce((c.contact ->> 'is_public')::boolean, true);
$$;

-- Statusfarger: organisasjonens og prosjektets overstyringer. Appen fyller inn standardfargene.
create function app.public_status_colors(p_project public.projects)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'organization', o.status_colors,
    'project', case
      when jsonb_typeof(p_project.settings -> 'status_colors') = 'object' then p_project.settings -> 'status_colors'
      else '{}'::jsonb
    end
  )
  from public.organizations o
  where o.id = p_project.organization_id;
$$;

-- Én enhet slik kjøpere ser den.
create function app.public_unit(p_unit public.units, p_project public.projects)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', p_unit.id,
    'unit_number', p_unit.unit_number,
    'slug', p_unit.slug,
    'title', p_unit.title,
    'unit_type', p_unit.unit_type,
    'status', p_unit.status,
    'floor', p_unit.floor,
    'rooms', p_unit.rooms,
    'bedrooms', p_unit.bedrooms,
    'bathrooms', p_unit.bathrooms,
    'bra_i', p_unit.bra_i,
    'bra_e', p_unit.bra_e,
    'bra_b', p_unit.bra_b,
    'tba', p_unit.tba,
    'plot_area', p_unit.plot_area,
    'price_hidden', h.hide_price,
    'price', case when h.hide_price then null else p_unit.price end,
    'purchase_costs', case when h.hide_price then null else p_unit.purchase_costs end,
    'shared_debt', case when h.hide_price then null else p_unit.shared_debt end,
    'monthly_fee', p_unit.monthly_fee,
    'ownership_type', p_unit.ownership_type,
    'orientation', p_unit.orientation,
    'parking', p_unit.parking,
    'storage', p_unit.storage,
    'sort_order', p_unit.sort_order,
    'stage', (select jsonb_build_object('id', s.id, 'name', s.name) from public.stages s where s.id = p_unit.stage_id),
    'building', (select jsonb_build_object('id', b.id, 'name', b.name) from public.buildings b where b.id = p_unit.building_id),
    'floor_plan', app.public_asset(p_unit.organization_id, p_unit.floor_plan_asset_ids[1]),
    'custom_fields', coalesce((
      select jsonb_object_agg(f.key, p_unit.custom_fields -> f.key)
      from jsonb_array_elements_text(
        case when jsonb_typeof(p_project.settings -> 'public_custom_fields') = 'array'
             then p_project.settings -> 'public_custom_fields'
             else '[]'::jsonb end
      ) as f(key)
      where p_unit.custom_fields ? f.key
    ), '{}'::jsonb)
  )
  from (
    select p_unit.status = 'sold'
           and not coalesce((p_project.settings ->> 'show_price_on_sold')::boolean, false) as hide_price
  ) as h;
$$;

create function app.public_units(p_project_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(app.public_unit(u, p) order by u.sort_order, u.unit_number), '[]'::jsonb)
  from public.units u
  join public.projects p on p.id = u.project_id
  where u.project_id = p_project_id
    and not u.is_hidden;
$$;

-- Prosjekter som markeringer lenker til. Tas bare med når de har en publisert prosjektside.
create function app.public_linked_projects(p_organization_id uuid, p_snapshot jsonb)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(distinct jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'subdomain', s.subdomain,
    'hostname', d.hostname
  )), '[]'::jsonb)
  from jsonb_path_query(coalesce(p_snapshot, '{}'::jsonb), '$.views[*].hotspots[*].target_project_id') as t(value)
  join public.projects p
    on p.id = app.try_uuid(t.value #>> '{}') and p.organization_id = p_organization_id
  join public.sites s on s.project_id = p.id and s.published_at is not null
  left join public.domains d on d.site_id = s.id and d.is_primary and d.verified_at is not null;
$$;

-- Felles svarformat for publisert boligvelger og forhåndsvisning.
create function app.selector_payload(p_selector public.selectors, p_snapshot jsonb, p_published_at timestamptz)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'selector', p_snapshot,
    'published_at', p_published_at,
    'project', app.public_project(p),
    'status_colors', app.public_status_colors(p),
    'units', app.public_units(p.id),
    'linked_projects', app.public_linked_projects(p.organization_id, p_snapshot)
  )
  from public.projects p
  where p.id = p_selector.project_id;
$$;

-- -----------------------------------------------------------------------------
-- Offentlige funksjoner (anon og authenticated)
-- -----------------------------------------------------------------------------

-- Publisert boligvelger med enhetsdata og status. null hvis den ikke er publisert.
create function public.get_published_selector(p_selector_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select app.selector_payload(s, s.published_snapshot, s.published_at)
  from public.selectors s
  where s.id = p_selector_id
    and s.published_at is not null;
$$;

-- Enhetslisten for et offentlig prosjekt (Enhetsliste-blokken og API-et).
create function public.get_public_units(p_project_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'project', app.public_project(p),
    'status_colors', app.public_status_colors(p),
    'units', app.public_units(p.id)
  )
  from public.projects p
  where p.id = p_project_id
    and app.project_is_public(p.id);
$$;

-- Enhetssiden /bolig/{slug}.
create function public.get_public_unit(p_project_id uuid, p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select app.public_unit(u, p) || jsonb_build_object(
    'description', u.description,
    'floor_plans', app.public_assets(u.organization_id, u.floor_plan_asset_ids),
    'gallery', app.public_assets(u.organization_id, u.gallery_asset_ids),
    'documents', app.public_assets(u.organization_id, u.document_asset_ids),
    'project', app.public_project(p),
    'contacts', app.public_contacts(p),
    'status_colors', app.public_status_colors(p)
  )
  from public.units u
  join public.projects p on p.id = u.project_id
  where u.project_id = p_project_id
    and u.slug = p_slug
    and not u.is_hidden
    and app.project_is_public(p.id);
$$;

-- Finner publisert prosjektside fra vertsnavn: eget, bekreftet domene eller underdomene.
create function public.resolve_site(p_hostname text default null, p_subdomain text default null)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with site as (
    select s.*
    from public.sites s
    where s.published_at is not null
      and (
        (p_hostname is not null and s.id in (
          select d.site_id from public.domains d
          where d.hostname = lower(p_hostname) and d.verified_at is not null
        ))
        or (p_subdomain is not null and s.subdomain = lower(p_subdomain))
      )
    limit 1
  )
  select jsonb_build_object(
    'site', jsonb_build_object(
      'id', s.id,
      'subdomain', s.subdomain,
      'primary_hostname', (
        select d.hostname from public.domains d
        where d.site_id = s.id and d.is_primary and d.verified_at is not null
      ),
      'config', s.published_config,
      'published_at', s.published_at
    ),
    'project', app.public_project(p) || jsonb_build_object(
      'analytics_ids', p.analytics_ids,
      'contacts', app.public_contacts(p)
    ),
    'organization', jsonb_build_object(
      'name', o.name,
      'locale', o.locale,
      'brand', o.brand,
      'logo', app.public_asset(o.id, o.logo_asset_id)
    ),
    'pages', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', pg.id,
        'slug', pg.published_slug,
        'title', pg.published_meta ->> 'title',
        'is_home', pg.id::text = s.published_config ->> 'home_page_id'
      ) order by pg.sort_order, pg.created_at), '[]'::jsonb)
      from public.pages pg
      where pg.site_id = s.id and pg.published_at is not null
    )
  )
  from site s
  join public.projects p on p.id = s.project_id
  join public.organizations o on o.id = s.organization_id;
$$;

-- Publisert side. Tom eller manglende slug gir forsiden.
create function public.get_published_page(p_site_id uuid, p_slug text default null)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', pg.id,
    'slug', pg.published_slug,
    'is_home', pg.id::text = s.published_config ->> 'home_page_id',
    'meta', pg.published_meta,
    'blocks', pg.published_blocks,
    'published_at', pg.published_at
  )
  from public.sites s
  join public.pages pg on pg.site_id = s.id
  where s.id = p_site_id
    and s.published_at is not null
    and pg.published_at is not null
    and case
      when coalesce(p_slug, '') = '' then pg.id::text = s.published_config ->> 'home_page_id'
      else pg.published_slug = p_slug
    end;
$$;

-- Filer brukt i blokkene på en publisert prosjektside (bare organisasjonens egne filer).
create function public.get_public_assets(p_site_id uuid, p_asset_ids uuid[])
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select app.public_assets(s.organization_id, p_asset_ids[1:200])
  from public.sites s
  where s.id = p_site_id
    and s.published_at is not null;
$$;

-- -----------------------------------------------------------------------------
-- Forhåndsvisning (innlogget, lesetilgang til prosjektet)
-- -----------------------------------------------------------------------------

-- Boligvelgeren slik kjøpere vil se den, med upubliserte former og koblinger.
create function public.get_selector_preview(p_selector_id uuid)
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
  return app.selector_payload(v_selector, app.build_selector_snapshot(v_selector.id), null);
end;
$$;

grant execute on function
  public.get_published_selector(uuid),
  public.get_public_units(uuid),
  public.get_public_unit(uuid, text),
  public.resolve_site(text, text),
  public.get_published_page(uuid, text),
  public.get_public_assets(uuid, uuid[])
to anon, authenticated, service_role;

grant execute on function public.get_selector_preview(uuid) to authenticated;
