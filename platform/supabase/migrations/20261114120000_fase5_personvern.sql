-- =============================================================================
-- 0014 Fase 5: innsyn og sletting for én person
-- =============================================================================
--
-- Innsyn i og sletting av alt om én person (e-postadresse) i en organisasjon,
-- også kopiene i webhook-loggen. Se docs/arkitektur.md, avsnitt 21.

-- -----------------------------------------------------------------------------
-- Personvern: innsyn og sletting for én person
-- -----------------------------------------------------------------------------
-- Leveranser av lead.created i webhook-loggen har navn, e-post, telefon og
-- beskjed. Når et lead slettes, av en bruker, for én person eller etter
-- lagringstiden, slettes også kopiene i loggen. En leveranse som ikke er sendt
-- ennå, sendes da aldri.

create function app.forget_lead_deliveries()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.webhook_deliveries d
  where d.organization_id = old.organization_id
    and d.event = 'lead.created'
    and d.payload -> 'data' ->> 'lead_id' = old.id::text;
  return null;
end;
$$;

create trigger forget_deliveries after delete on public.leads
  for each row execute function app.forget_lead_deliveries();

create index webhook_deliveries_lead_idx
  on public.webhook_deliveries ((payload -> 'data' ->> 'lead_id'))
  where event = 'lead.created';

-- Sletter alt om én person (e-postadresse) i organisasjonen: leadene, kopiene i
-- webhook-loggen (triggeren over) og telleren for rate limit, som har adressen i
-- nøkkelen. Eier og administrator, også i lesemodus: retten til sletting gjelder
-- uansett abonnement. Hvert lead logges som slettet, uten personopplysninger.
create function public.erase_lead_person(p_organization_id uuid, p_email text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(p_email));
  v_leads integer;
begin
  if not app.has_org_role(p_organization_id, app.roles_admin(), false) then
    raise exception 'Mangler tilgang til å slette personopplysninger' using errcode = '42501';
  end if;
  if v_email is null or v_email = '' then
    raise exception 'E-postadressen mangler' using errcode = '22023';
  end if;
  delete from public.leads l
  where l.organization_id = p_organization_id and lower(l.email) = v_email;
  get diagnostics v_leads = row_count;
  delete from public.rate_limit_buckets b
  where b.organization_id = p_organization_id and b.key = 'lead:email:' || v_email;
  return v_leads;
end;
$$;

-- Logger at noen har hentet ut alt om én person (innsyn). Bare antallet leads
-- lagres, ikke hvem det gjaldt.
create function public.log_person_export(p_organization_id uuid, p_leads integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not app.has_org_role(p_organization_id, app.roles_admin(), false) then
    raise exception 'Mangler tilgang' using errcode = '42501';
  end if;
  perform app.write_audit(
    p_organization_id, null, 'privacy.person_exported', 'organization', p_organization_id,
    jsonb_build_object('leads', greatest(coalesce(p_leads, 0), 0))
  );
end;
$$;

grant execute on function
  public.erase_lead_person(uuid, text),
  public.log_person_export(uuid, integer)
to authenticated;
