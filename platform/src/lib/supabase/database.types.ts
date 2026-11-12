
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "api_keys": {
                  Row: {
                    "created_at": string,"created_by": string | null,"expires_at": string | null,"id": string,"key_hash": string,"key_prefix": string,"last_used_at": string | null,"name": string,"organization_id": string,"revoked_at": string | null,"scopes": (string)[],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"expires_at"?: string | null,"id"?: string,"key_hash": string,"key_prefix": string,"last_used_at"?: string | null,"name": string,"organization_id": string,"revoked_at"?: string | null,"scopes"?: (string)[],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"expires_at"?: string | null,"id"?: string,"key_hash"?: string,"key_prefix"?: string,"last_used_at"?: string | null,"name"?: string,"organization_id"?: string,"revoked_at"?: string | null,"scopes"?: (string)[],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "api_keys_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"assets": {
                  Row: {
                    "alt_text": string | null,"bucket": string,"bytes": number,"created_at": string,"filename": string | null,"folder": string,"height": number | null,"id": string,"mime": string,"organization_id": string,"processing_status": string,"project_id": string | null,"storage_path": string,"updated_at": string,"uploaded_by": string | null,"variants": NonNullable<Json>,"width": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "alt_text"?: string | null,"bucket"?: string,"bytes": number,"created_at"?: string,"filename"?: string | null,"folder"?: string,"height"?: number | null,"id"?: string,"mime": string,"organization_id": string,"processing_status"?: string,"project_id"?: string | null,"storage_path": string,"updated_at"?: string,"uploaded_by"?: string | null,"variants"?: NonNullable<Json>,"width"?: number | null
                  }
                  Update: {
                    "alt_text"?: string | null,"bucket"?: string,"bytes"?: number,"created_at"?: string,"filename"?: string | null,"folder"?: string,"height"?: number | null,"id"?: string,"mime"?: string,"organization_id"?: string,"processing_status"?: string,"project_id"?: string | null,"storage_path"?: string,"updated_at"?: string,"uploaded_by"?: string | null,"variants"?: NonNullable<Json>,"width"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "assets_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "assets_project_id_organization_id_fkey"
      columns: ["project_id","organization_id"]
isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id","organization_id"]
    }
                  ]
                },"audit_log": {
                  Row: {
                    "action": string,"actor_email": string | null,"actor_id": string | null,"actor_type": string,"created_at": string,"data": NonNullable<Json>,"entity_id": string | null,"entity_type": string | null,"id": string,"organization_id": string,"project_id": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_email"?: string | null,"actor_id"?: string | null,"actor_type": string,"created_at"?: string,"data"?: NonNullable<Json>,"entity_id"?: string | null,"entity_type"?: string | null,"id"?: string,"organization_id": string,"project_id"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "action"?: string,"actor_email"?: string | null,"actor_id"?: string | null,"actor_type"?: string,"created_at"?: string,"data"?: NonNullable<Json>,"entity_id"?: string | null,"entity_type"?: string | null,"id"?: string,"organization_id"?: string,"project_id"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_log_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "audit_log_project_id_organization_id_fkey"
      columns: ["project_id","organization_id"]
isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id","organization_id"]
    }
                  ]
                },"buildings": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"organization_id": string,"project_id": string,"sort_order": number,"stage_id": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"organization_id": string,"project_id": string,"sort_order"?: number,"stage_id"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"organization_id"?: string,"project_id"?: string,"sort_order"?: number,"stage_id"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "buildings_project_id_organization_id_fkey"
      columns: ["project_id","organization_id"]
isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id","organization_id"]
    },{
      foreignKeyName: "buildings_stage_id_project_id_organization_id_fkey"
      columns: ["stage_id","project_id","organization_id"]
isOneToOne: false
      referencedRelation: "stages"
      referencedColumns: ["id","project_id","organization_id"]
    }
                  ]
                },"domains": {
                  Row: {
                    "created_at": string,"dns_records": NonNullable<Json>,"hostname": string,"id": string,"is_primary": boolean,"last_checked_at": string | null,"last_error": string | null,"organization_id": string,"project_id": string,"site_id": string,"status": string,"updated_at": string,"verification_token": string,"verified_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"dns_records"?: NonNullable<Json>,"hostname": string,"id"?: string,"is_primary"?: boolean,"last_checked_at"?: string | null,"last_error"?: string | null,"organization_id": string,"project_id": string,"site_id": string,"status"?: string,"updated_at"?: string,"verification_token"?: string,"verified_at"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"dns_records"?: NonNullable<Json>,"hostname"?: string,"id"?: string,"is_primary"?: boolean,"last_checked_at"?: string | null,"last_error"?: string | null,"organization_id"?: string,"project_id"?: string,"site_id"?: string,"status"?: string,"updated_at"?: string,"verification_token"?: string,"verified_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "domains_site_id_project_id_organization_id_fkey"
      columns: ["site_id","project_id","organization_id"]
isOneToOne: false
      referencedRelation: "sites"
      referencedColumns: ["id","project_id","organization_id"]
    }
                  ]
                },"hotspots": {
                  Row: {
                    "created_at": string,"id": string,"label": string | null,"organization_id": string,"points": NonNullable<Json>,"project_id": string,"shape": Database["public"]['Enums']["hotspot_shape"],"sort_order": number,"target_project_id": string | null,"target_type": Database["public"]['Enums']["hotspot_target_type"] | null,"target_unit_id": string | null,"target_url": string | null,"target_view_id": string | null,"updated_at": string,"view_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"label"?: string | null,"organization_id": string,"points": NonNullable<Json>,"project_id": string,"shape"?: Database["public"]['Enums']["hotspot_shape"],"sort_order"?: number,"target_project_id"?: string | null,"target_type"?: Database["public"]['Enums']["hotspot_target_type"] | null,"target_unit_id"?: string | null,"target_url"?: string | null,"target_view_id"?: string | null,"updated_at"?: string,"view_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"label"?: string | null,"organization_id"?: string,"points"?: NonNullable<Json>,"project_id"?: string,"shape"?: Database["public"]['Enums']["hotspot_shape"],"sort_order"?: number,"target_project_id"?: string | null,"target_type"?: Database["public"]['Enums']["hotspot_target_type"] | null,"target_unit_id"?: string | null,"target_url"?: string | null,"target_view_id"?: string | null,"updated_at"?: string,"view_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "hotspots_target_project_id_organization_id_fkey"
      columns: ["target_project_id","organization_id"]
isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id","organization_id"]
    },{
      foreignKeyName: "hotspots_target_unit_id_project_id_organization_id_fkey"
      columns: ["target_unit_id","project_id","organization_id"]
isOneToOne: false
      referencedRelation: "units"
      referencedColumns: ["id","project_id","organization_id"]
    },{
      foreignKeyName: "hotspots_target_view_id_project_id_organization_id_fkey"
      columns: ["target_view_id","project_id","organization_id"]
isOneToOne: false
      referencedRelation: "selector_views"
      referencedColumns: ["id","project_id","organization_id"]
    },{
      foreignKeyName: "hotspots_view_id_project_id_organization_id_fkey"
      columns: ["view_id","project_id","organization_id"]
isOneToOne: false
      referencedRelation: "selector_views"
      referencedColumns: ["id","project_id","organization_id"]
    }
                  ]
                },"invitations": {
                  Row: {
                    "accepted_at": string | null,"accepted_by": string | null,"created_at": string,"email": string,"expires_at": string,"id": string,"invited_by": string | null,"organization_id": string,"project_ids": (string)[],"revoked_at": string | null,"role": Database["public"]['Enums']["member_role"],"token_hash": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "accepted_at"?: string | null,"accepted_by"?: string | null,"created_at"?: string,"email": string,"expires_at"?: string,"id"?: string,"invited_by"?: string | null,"organization_id": string,"project_ids"?: (string)[],"revoked_at"?: string | null,"role": Database["public"]['Enums']["member_role"],"token_hash": string,"updated_at"?: string
                  }
                  Update: {
                    "accepted_at"?: string | null,"accepted_by"?: string | null,"created_at"?: string,"email"?: string,"expires_at"?: string,"id"?: string,"invited_by"?: string | null,"organization_id"?: string,"project_ids"?: (string)[],"revoked_at"?: string | null,"role"?: Database["public"]['Enums']["member_role"],"token_hash"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "invitations_invited_by_profile_fkey"
      columns: ["invited_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "invitations_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"leads": {
                  Row: {
                    "consent_contact": boolean,"consent_similar_projects": boolean,"consent_text_version": string,"consented_at": string,"created_at": string,"email": string,"id": string,"internal_note": string | null,"message": string | null,"name": string,"notified_at": string | null,"organization_id": string,"page_id": string | null,"phone": string | null,"project_id": string,"source": string,"status": Database["public"]['Enums']["lead_status"],"unit_id": string | null,"unit_number": string | null,"updated_at": string,"utm": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "consent_contact": boolean,"consent_similar_projects"?: boolean,"consent_text_version": string,"consented_at"?: string,"created_at"?: string,"email": string,"id"?: string,"internal_note"?: string | null,"message"?: string | null,"name": string,"notified_at"?: string | null,"organization_id": string,"page_id"?: string | null,"phone"?: string | null,"project_id": string,"source"?: string,"status"?: Database["public"]['Enums']["lead_status"],"unit_id"?: string | null,"unit_number"?: string | null,"updated_at"?: string,"utm"?: NonNullable<Json>
                  }
                  Update: {
                    "consent_contact"?: boolean,"consent_similar_projects"?: boolean,"consent_text_version"?: string,"consented_at"?: string,"created_at"?: string,"email"?: string,"id"?: string,"internal_note"?: string | null,"message"?: string | null,"name"?: string,"notified_at"?: string | null,"organization_id"?: string,"page_id"?: string | null,"phone"?: string | null,"project_id"?: string,"source"?: string,"status"?: Database["public"]['Enums']["lead_status"],"unit_id"?: string | null,"unit_number"?: string | null,"updated_at"?: string,"utm"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "leads_page_id_project_id_organization_id_fkey"
      columns: ["page_id","project_id","organization_id"]
isOneToOne: false
      referencedRelation: "pages"
      referencedColumns: ["id","project_id","organization_id"]
    },{
      foreignKeyName: "leads_project_id_organization_id_fkey"
      columns: ["project_id","organization_id"]
isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id","organization_id"]
    },{
      foreignKeyName: "leads_unit_id_project_id_organization_id_fkey"
      columns: ["unit_id","project_id","organization_id"]
isOneToOne: false
      referencedRelation: "units"
      referencedColumns: ["id","project_id","organization_id"]
    }
                  ]
                },"memberships": {
                  Row: {
                    "created_at": string,"id": string,"organization_id": string,"role": Database["public"]['Enums']["member_role"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"organization_id": string,"role": Database["public"]['Enums']["member_role"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"organization_id"?: string,"role"?: Database["public"]['Enums']["member_role"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "memberships_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "memberships_user_profile_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"organizations": {
                  Row: {
                    "brand": NonNullable<Json>,"created_at": string,"current_period_end": string | null,"id": string,"lead_retention_days": number | null,"locale": string,"logo_asset_id": string | null,"name": string,"organization_id": string | null,"plan": string,"slug": string,"status_colors": NonNullable<Json>,"stripe_customer_id": string | null,"stripe_subscription_id": string | null,"subscription_status": Database["public"]['Enums']["subscription_status"],"trial_ends_at": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "brand"?: NonNullable<Json>,"created_at"?: string,"current_period_end"?: string | null,"id"?: string,"lead_retention_days"?: number | null,"locale"?: string,"logo_asset_id"?: string | null,"name": string,"organization_id"?: never,"plan"?: string,"slug": string,"status_colors"?: NonNullable<Json>,"stripe_customer_id"?: string | null,"stripe_subscription_id"?: string | null,"subscription_status"?: Database["public"]['Enums']["subscription_status"],"trial_ends_at"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "brand"?: NonNullable<Json>,"created_at"?: string,"current_period_end"?: string | null,"id"?: string,"lead_retention_days"?: number | null,"locale"?: string,"logo_asset_id"?: string | null,"name"?: string,"organization_id"?: never,"plan"?: string,"slug"?: string,"status_colors"?: NonNullable<Json>,"stripe_customer_id"?: string | null,"stripe_subscription_id"?: string | null,"subscription_status"?: Database["public"]['Enums']["subscription_status"],"trial_ends_at"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "organizations_logo_asset_id_fkey"
      columns: ["logo_asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    }
                  ]
                },"page_versions": {
                  Row: {
                    "blocks": NonNullable<Json>,"created_at": string,"created_by": string | null,"id": string,"meta": NonNullable<Json>,"organization_id": string,"page_id": string,"project_id": string,"updated_at": string,"version": number
                  }
                  ComputedFields: never
                  Insert: {
                    "blocks": NonNullable<Json>,"created_at"?: string,"created_by"?: string | null,"id"?: string,"meta"?: NonNullable<Json>,"organization_id": string,"page_id": string,"project_id": string,"updated_at"?: string,"version": number
                  }
                  Update: {
                    "blocks"?: NonNullable<Json>,"created_at"?: string,"created_by"?: string | null,"id"?: string,"meta"?: NonNullable<Json>,"organization_id"?: string,"page_id"?: string,"project_id"?: string,"updated_at"?: string,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "page_versions_page_id_project_id_organization_id_fkey"
      columns: ["page_id","project_id","organization_id"]
isOneToOne: false
      referencedRelation: "pages"
      referencedColumns: ["id","project_id","organization_id"]
    }
                  ]
                },"pages": {
                  Row: {
                    "created_at": string,"draft_blocks": NonNullable<Json>,"id": string,"is_home": boolean,"og_asset_id": string | null,"organization_id": string,"project_id": string,"published_at": string | null,"published_blocks": Json | null,"published_meta": Json | null,"published_slug": string | null,"seo_description": string | null,"seo_title": string | null,"site_id": string,"slug": string,"sort_order": number,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"draft_blocks"?: NonNullable<Json>,"id"?: string,"is_home"?: boolean,"og_asset_id"?: string | null,"organization_id": string,"project_id": string,"published_at"?: string | null,"published_blocks"?: Json | null,"published_meta"?: Json | null,"published_slug"?: string | null,"seo_description"?: string | null,"seo_title"?: string | null,"site_id": string,"slug": string,"sort_order"?: number,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"draft_blocks"?: NonNullable<Json>,"id"?: string,"is_home"?: boolean,"og_asset_id"?: string | null,"organization_id"?: string,"project_id"?: string,"published_at"?: string | null,"published_blocks"?: Json | null,"published_meta"?: Json | null,"published_slug"?: string | null,"seo_description"?: string | null,"seo_title"?: string | null,"site_id"?: string,"slug"?: string,"sort_order"?: number,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "pages_og_asset_id_organization_id_fkey"
      columns: ["og_asset_id","organization_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id","organization_id"]
    },{
      foreignKeyName: "pages_site_id_project_id_organization_id_fkey"
      columns: ["site_id","project_id","organization_id"]
isOneToOne: false
      referencedRelation: "sites"
      referencedColumns: ["id","project_id","organization_id"]
    }
                  ]
                },"platform_admins": {
                  Row: {
                    "created_at": string,"id": string,"note": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"note"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"note"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"created_at": string,"email": string | null,"full_name": string | null,"id": string,"locale": string,"phone": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_url"?: string | null,"created_at"?: string,"email"?: string | null,"full_name"?: string | null,"id": string,"locale"?: string,"phone"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "avatar_url"?: string | null,"created_at"?: string,"email"?: string | null,"full_name"?: string | null,"id"?: string,"locale"?: string,"phone"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"project_members": {
                  Row: {
                    "created_at": string,"id": string,"organization_id": string,"project_id": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"organization_id": string,"project_id": string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"organization_id"?: string,"project_id"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "project_members_organization_id_user_id_fkey"
      columns: ["organization_id","user_id"]
isOneToOne: false
      referencedRelation: "memberships"
      referencedColumns: ["organization_id","user_id"]
    },{
      foreignKeyName: "project_members_project_id_organization_id_fkey"
      columns: ["project_id","organization_id"]
isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id","organization_id"]
    }
                  ]
                },"projects": {
                  Row: {
                    "address": string | null,"analytics_ids": NonNullable<Json>,"city": string | null,"contacts": NonNullable<Json>,"created_at": string,"description": string | null,"id": string,"lat": number | null,"lng": number | null,"milestones": NonNullable<Json>,"municipality": string | null,"name": string,"organization_id": string,"phase": Database["public"]['Enums']["project_phase"],"postal_code": string | null,"settings": NonNullable<Json>,"slug": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string | null,"analytics_ids"?: NonNullable<Json>,"city"?: string | null,"contacts"?: NonNullable<Json>,"created_at"?: string,"description"?: string | null,"id"?: string,"lat"?: number | null,"lng"?: number | null,"milestones"?: NonNullable<Json>,"municipality"?: string | null,"name": string,"organization_id": string,"phase"?: Database["public"]['Enums']["project_phase"],"postal_code"?: string | null,"settings"?: NonNullable<Json>,"slug": string,"updated_at"?: string
                  }
                  Update: {
                    "address"?: string | null,"analytics_ids"?: NonNullable<Json>,"city"?: string | null,"contacts"?: NonNullable<Json>,"created_at"?: string,"description"?: string | null,"id"?: string,"lat"?: number | null,"lng"?: number | null,"milestones"?: NonNullable<Json>,"municipality"?: string | null,"name"?: string,"organization_id"?: string,"phase"?: Database["public"]['Enums']["project_phase"],"postal_code"?: string | null,"settings"?: NonNullable<Json>,"slug"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "projects_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"rate_limit_buckets": {
                  Row: {
                    "created_at": string,"hits": number,"id": string,"key": string,"organization_id": string,"updated_at": string,"window_start": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"hits"?: number,"id"?: string,"key": string,"organization_id": string,"updated_at"?: string,"window_start": string
                  }
                  Update: {
                    "created_at"?: string,"hits"?: number,"id"?: string,"key"?: string,"organization_id"?: string,"updated_at"?: string,"window_start"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "rate_limit_buckets_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"selector_views": {
                  Row: {
                    "angle_group": string | null,"asset_id": string | null,"created_at": string,"id": string,"image_height": number | null,"image_width": number | null,"kind": Database["public"]['Enums']["selector_view_kind"],"name": string,"organization_id": string,"parent_view_id": string | null,"project_id": string,"selector_id": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "angle_group"?: string | null,"asset_id"?: string | null,"created_at"?: string,"id"?: string,"image_height"?: number | null,"image_width"?: number | null,"kind"?: Database["public"]['Enums']["selector_view_kind"],"name": string,"organization_id": string,"parent_view_id"?: string | null,"project_id": string,"selector_id": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "angle_group"?: string | null,"asset_id"?: string | null,"created_at"?: string,"id"?: string,"image_height"?: number | null,"image_width"?: number | null,"kind"?: Database["public"]['Enums']["selector_view_kind"],"name"?: string,"organization_id"?: string,"parent_view_id"?: string | null,"project_id"?: string,"selector_id"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "selector_views_asset_id_organization_id_fkey"
      columns: ["asset_id","organization_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id","organization_id"]
    },{
      foreignKeyName: "selector_views_parent_view_id_project_id_organization_id_fkey"
      columns: ["parent_view_id","project_id","organization_id"]
isOneToOne: false
      referencedRelation: "selector_views"
      referencedColumns: ["id","project_id","organization_id"]
    },{
      foreignKeyName: "selector_views_selector_id_project_id_organization_id_fkey"
      columns: ["selector_id","project_id","organization_id"]
isOneToOne: false
      referencedRelation: "selectors"
      referencedColumns: ["id","project_id","organization_id"]
    }
                  ]
                },"selectors": {
                  Row: {
                    "created_at": string,"entry_view_id": string | null,"id": string,"name": string,"organization_id": string,"project_id": string,"published_at": string | null,"published_snapshot": Json | null,"settings": NonNullable<Json>,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"entry_view_id"?: string | null,"id"?: string,"name": string,"organization_id": string,"project_id": string,"published_at"?: string | null,"published_snapshot"?: Json | null,"settings"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"entry_view_id"?: string | null,"id"?: string,"name"?: string,"organization_id"?: string,"project_id"?: string,"published_at"?: string | null,"published_snapshot"?: Json | null,"settings"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "selectors_entry_view_fkey"
      columns: ["entry_view_id","project_id","organization_id"]
isOneToOne: false
      referencedRelation: "selector_views"
      referencedColumns: ["id","project_id","organization_id"]
    },{
      foreignKeyName: "selectors_project_id_organization_id_fkey"
      columns: ["project_id","organization_id"]
isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id","organization_id"]
    }
                  ]
                },"sites": {
                  Row: {
                    "cookie_settings": NonNullable<Json>,"created_at": string,"footer": NonNullable<Json>,"id": string,"nav": NonNullable<Json>,"organization_id": string,"project_id": string,"published_at": string | null,"published_config": Json | null,"seo_defaults": NonNullable<Json>,"subdomain": string,"theme": NonNullable<Json>,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cookie_settings"?: NonNullable<Json>,"created_at"?: string,"footer"?: NonNullable<Json>,"id"?: string,"nav"?: NonNullable<Json>,"organization_id": string,"project_id": string,"published_at"?: string | null,"published_config"?: Json | null,"seo_defaults"?: NonNullable<Json>,"subdomain": string,"theme"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Update: {
                    "cookie_settings"?: NonNullable<Json>,"created_at"?: string,"footer"?: NonNullable<Json>,"id"?: string,"nav"?: NonNullable<Json>,"organization_id"?: string,"project_id"?: string,"published_at"?: string | null,"published_config"?: Json | null,"seo_defaults"?: NonNullable<Json>,"subdomain"?: string,"theme"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "sites_project_id_organization_id_fkey"
      columns: ["project_id","organization_id"]
isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id","organization_id"]
    }
                  ]
                },"stages": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"organization_id": string,"phase": Database["public"]['Enums']["project_phase"],"project_id": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"organization_id": string,"phase"?: Database["public"]['Enums']["project_phase"],"project_id": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"organization_id"?: string,"phase"?: Database["public"]['Enums']["project_phase"],"project_id"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "stages_project_id_organization_id_fkey"
      columns: ["project_id","organization_id"]
isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id","organization_id"]
    }
                  ]
                },"unit_status_events": {
                  Row: {
                    "changed_by": string | null,"created_at": string,"from_status": Database["public"]['Enums']["unit_status"] | null,"id": string,"note": string | null,"organization_id": string,"project_id": string,"source": string,"to_status": Database["public"]['Enums']["unit_status"],"unit_id": string | null,"unit_number": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "changed_by"?: string | null,"created_at"?: string,"from_status"?: Database["public"]['Enums']["unit_status"] | null,"id"?: string,"note"?: string | null,"organization_id": string,"project_id": string,"source"?: string,"to_status": Database["public"]['Enums']["unit_status"],"unit_id"?: string | null,"unit_number": string,"updated_at"?: string
                  }
                  Update: {
                    "changed_by"?: string | null,"created_at"?: string,"from_status"?: Database["public"]['Enums']["unit_status"] | null,"id"?: string,"note"?: string | null,"organization_id"?: string,"project_id"?: string,"source"?: string,"to_status"?: Database["public"]['Enums']["unit_status"],"unit_id"?: string | null,"unit_number"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "unit_status_events_changed_by_profile_fkey"
      columns: ["changed_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "unit_status_events_project_id_organization_id_fkey"
      columns: ["project_id","organization_id"]
isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id","organization_id"]
    },{
      foreignKeyName: "unit_status_events_unit_id_project_id_organization_id_fkey"
      columns: ["unit_id","project_id","organization_id"]
isOneToOne: false
      referencedRelation: "units"
      referencedColumns: ["id","project_id","organization_id"]
    }
                  ]
                },"units": {
                  Row: {
                    "bathrooms": number | null,"bedrooms": number | null,"bra_b": number | null,"bra_e": number | null,"bra_i": number | null,"building_id": string | null,"created_at": string,"custom_fields": NonNullable<Json>,"description": string | null,"document_asset_ids": (string)[],"external_id": string | null,"floor": number | null,"floor_plan_asset_ids": (string)[],"gallery_asset_ids": (string)[],"id": string,"is_hidden": boolean,"monthly_fee": number | null,"organization_id": string,"orientation": string | null,"ownership_type": Database["public"]['Enums']["ownership_type"] | null,"parking": string | null,"plot_area": number | null,"price": number | null,"project_id": string,"purchase_costs": number | null,"rooms": number | null,"shared_debt": number | null,"slug": string,"sort_order": number,"source": string,"stage_id": string | null,"status": Database["public"]['Enums']["unit_status"],"storage": string | null,"tba": number | null,"title": string | null,"unit_number": string,"unit_type": Database["public"]['Enums']["unit_type"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "bathrooms"?: number | null,"bedrooms"?: number | null,"bra_b"?: number | null,"bra_e"?: number | null,"bra_i"?: number | null,"building_id"?: string | null,"created_at"?: string,"custom_fields"?: NonNullable<Json>,"description"?: string | null,"document_asset_ids"?: (string)[],"external_id"?: string | null,"floor"?: number | null,"floor_plan_asset_ids"?: (string)[],"gallery_asset_ids"?: (string)[],"id"?: string,"is_hidden"?: boolean,"monthly_fee"?: number | null,"organization_id": string,"orientation"?: string | null,"ownership_type"?: Database["public"]['Enums']["ownership_type"] | null,"parking"?: string | null,"plot_area"?: number | null,"price"?: number | null,"project_id": string,"purchase_costs"?: number | null,"rooms"?: number | null,"shared_debt"?: number | null,"slug": string,"sort_order"?: number,"source"?: string,"stage_id"?: string | null,"status"?: Database["public"]['Enums']["unit_status"],"storage"?: string | null,"tba"?: number | null,"title"?: string | null,"unit_number": string,"unit_type"?: Database["public"]['Enums']["unit_type"],"updated_at"?: string
                  }
                  Update: {
                    "bathrooms"?: number | null,"bedrooms"?: number | null,"bra_b"?: number | null,"bra_e"?: number | null,"bra_i"?: number | null,"building_id"?: string | null,"created_at"?: string,"custom_fields"?: NonNullable<Json>,"description"?: string | null,"document_asset_ids"?: (string)[],"external_id"?: string | null,"floor"?: number | null,"floor_plan_asset_ids"?: (string)[],"gallery_asset_ids"?: (string)[],"id"?: string,"is_hidden"?: boolean,"monthly_fee"?: number | null,"organization_id"?: string,"orientation"?: string | null,"ownership_type"?: Database["public"]['Enums']["ownership_type"] | null,"parking"?: string | null,"plot_area"?: number | null,"price"?: number | null,"project_id"?: string,"purchase_costs"?: number | null,"rooms"?: number | null,"shared_debt"?: number | null,"slug"?: string,"sort_order"?: number,"source"?: string,"stage_id"?: string | null,"status"?: Database["public"]['Enums']["unit_status"],"storage"?: string | null,"tba"?: number | null,"title"?: string | null,"unit_number"?: string,"unit_type"?: Database["public"]['Enums']["unit_type"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "units_building_id_project_id_organization_id_fkey"
      columns: ["building_id","project_id","organization_id"]
isOneToOne: false
      referencedRelation: "buildings"
      referencedColumns: ["id","project_id","organization_id"]
    },{
      foreignKeyName: "units_project_id_organization_id_fkey"
      columns: ["project_id","organization_id"]
isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id","organization_id"]
    },{
      foreignKeyName: "units_stage_id_project_id_organization_id_fkey"
      columns: ["stage_id","project_id","organization_id"]
isOneToOne: false
      referencedRelation: "stages"
      referencedColumns: ["id","project_id","organization_id"]
    }
                  ]
                },"webhook_deliveries": {
                  Row: {
                    "attempts": number,"created_at": string,"delivered_at": string | null,"event": string,"id": string,"last_error": string | null,"last_response_status": number | null,"next_attempt_at": string,"organization_id": string,"payload": NonNullable<Json>,"status": string,"updated_at": string,"webhook_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attempts"?: number,"created_at"?: string,"delivered_at"?: string | null,"event": string,"id"?: string,"last_error"?: string | null,"last_response_status"?: number | null,"next_attempt_at"?: string,"organization_id": string,"payload": NonNullable<Json>,"status"?: string,"updated_at"?: string,"webhook_id": string
                  }
                  Update: {
                    "attempts"?: number,"created_at"?: string,"delivered_at"?: string | null,"event"?: string,"id"?: string,"last_error"?: string | null,"last_response_status"?: number | null,"next_attempt_at"?: string,"organization_id"?: string,"payload"?: NonNullable<Json>,"status"?: string,"updated_at"?: string,"webhook_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "webhook_deliveries_webhook_id_organization_id_fkey"
      columns: ["webhook_id","organization_id"]
isOneToOne: false
      referencedRelation: "webhooks"
      referencedColumns: ["id","organization_id"]
    }
                  ]
                },"webhooks": {
                  Row: {
                    "created_at": string,"created_by": string | null,"description": string | null,"events": (string)[],"failure_count": number,"id": string,"is_active": boolean,"last_failure_at": string | null,"last_success_at": string | null,"organization_id": string,"project_ids": (string)[] | null,"secret": string,"updated_at": string,"url": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"description"?: string | null,"events": (string)[],"failure_count"?: number,"id"?: string,"is_active"?: boolean,"last_failure_at"?: string | null,"last_success_at"?: string | null,"organization_id": string,"project_ids"?: (string)[] | null,"secret": string,"updated_at"?: string,"url": string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"description"?: string | null,"events"?: (string)[],"failure_count"?: number,"id"?: string,"is_active"?: boolean,"last_failure_at"?: string | null,"last_success_at"?: string | null,"organization_id"?: string,"project_ids"?: (string)[] | null,"secret"?: string,"updated_at"?: string,"url"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "webhooks_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "accept_invitation":
{ Args: { "p_token": string }; Returns: string
                           },
"adjust_unit_prices":
{ Args: { "p_percent": number,"p_round_to"?: number,"p_unit_ids": (string)[] }; Returns: number
                           },
"claim_webhook_deliveries":
{ Args: { "p_limit"?: number }; Returns: {
              "attempt": number,"delivery_id": string,"event": string,"payload": Json,"secret": string,"url": string,"webhook_id": string
            }[]
                           },
"complete_webhook_delivery":
{ Args: { "p_delivery_id": string,"p_error"?: string,"p_response_status"?: number,"p_succeeded": boolean }; Returns: undefined
                           },
"create_organization":
{ Args: { "p_name": string,"p_slug": string }; Returns: string
                           },
"create_project":
{ Args: { "p_buildings"?: Json,"p_organization_id": string,"p_project": Json,"p_stages"?: Json }; Returns: Json
                           },
"get_invitation":
{ Args: { "p_token": string }; Returns: Json
                           },
"get_public_assets":
{ Args: { "p_asset_ids": (string)[],"p_site_id": string }; Returns: Json
                           },
"get_public_unit":
{ Args: { "p_project_id": string,"p_slug": string }; Returns: Json
                           },
"get_public_units":
{ Args: { "p_project_id": string }; Returns: Json
                           },
"get_published_page":
{ Args: { "p_site_id": string,"p_slug"?: string }; Returns: Json
                           },
"get_published_selector":
{ Args: { "p_selector_id": string }; Returns: Json
                           },
"get_published_selector_project":
{ Args: { "p_selector_id": string }; Returns: string
                           },
"get_selector_preview":
{ Args: { "p_selector_id": string }; Returns: Json
                           },
"get_selector_publish_state":
{ Args: { "p_selector_id": string }; Returns: Json
                           },
"import_units":
{ Args: { "p_columns": (string)[],"p_project_id": string,"p_rows": Json }; Returns: Json
                           },
"publish_selector":
{ Args: { "p_selector_id": string }; Returns: string
                           },
"publish_site":
{ Args: { "p_site_id": string }; Returns: string
                           },
"rate_limit_hit":
{ Args: { "p_key": string,"p_limit": number,"p_organization_id": string,"p_window_seconds": number }; Returns: boolean
                           },
"record_login":
{ Args: Record<PropertyKey, never>; Returns: undefined
                           },
"reorder_selector_views":
{ Args: { "p_selector_id": string,"p_view_ids": (string)[] }; Returns: undefined
                           },
"resolve_site":
{ Args: { "p_hostname"?: string,"p_subdomain"?: string }; Returns: Json
                           },
"save_view_hotspots":
{ Args: { "p_hotspots": Json,"p_view_id": string }; Returns: number
                           },
"set_project_access":
{ Args: { "p_organization_id": string,"p_project_ids": (string)[],"p_user_id": string }; Returns: undefined
                           },
"set_project_display_settings":
{ Args: { "p_project_id": string,"p_show_price_on_sold": boolean,"p_status_colors": Json }; Returns: undefined
                           },
"set_unit_status":
{ Args: { "p_note"?: string,"p_source"?: string,"p_status": Database["public"]['Enums']["unit_status"],"p_unit_ids": (string)[] }; Returns: number
                           },
"unit_status_counts":
{ Args: { "p_project_ids": (string)[] }; Returns: {
              "project_id": string,"status": Database["public"]['Enums']["unit_status"],"units": number
            }[]
                           },
"unpublish_selector":
{ Args: { "p_selector_id": string }; Returns: undefined
                           },
"unpublish_site":
{ Args: { "p_site_id": string }; Returns: undefined
                           }
          }
          Enums: {
            "hotspot_shape": "polygon"|"rect","hotspot_target_type": "unit"|"view"|"project"|"url","lead_status": "new"|"contacted"|"closed","member_role": "owner"|"admin"|"editor"|"agent","ownership_type": "selveier"|"andel"|"aksje","project_phase": "draft"|"coming_soon"|"for_sale"|"sold_out"|"completed"|"archived","selector_view_kind": "overview"|"facade"|"floor"|"site_plan","subscription_status": "trialing"|"active"|"past_due"|"canceled"|"unpaid"|"incomplete"|"incomplete_expired"|"paused","unit_status": "upcoming"|"available"|"reserved"|"sold","unit_type": "apartment"|"townhouse"|"detached"|"semi_detached"|"cabin"|"plot"|"commercial"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "hotspot_shape": ["polygon", "rect"],"hotspot_target_type": ["unit", "view", "project", "url"],"lead_status": ["new", "contacted", "closed"],"member_role": ["owner", "admin", "editor", "agent"],"ownership_type": ["selveier", "andel", "aksje"],"project_phase": ["draft", "coming_soon", "for_sale", "sold_out", "completed", "archived"],"selector_view_kind": ["overview", "facade", "floor", "site_plan"],"subscription_status": ["trialing", "active", "past_due", "canceled", "unpaid", "incomplete", "incomplete_expired", "paused"],"unit_status": ["upcoming", "available", "reserved", "sold"],"unit_type": ["apartment", "townhouse", "detached", "semi_detached", "cabin", "plot", "commercial"]
          }
        }
} as const
