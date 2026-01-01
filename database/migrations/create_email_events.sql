create table public.email_events (
  id uuid not null default extensions.uuid_generate_v4 (),
  tenant_id uuid not null,
  department_id uuid null,
  external_message_id text not null,
  external_thread_id text not null,
  current_state public.email_state not null default 'queued'::email_state,
  intent public.email_intent null,
  priority public.email_priority null default 'medium'::email_priority,
  handled_by public.handler_type null default 'ai'::handler_type,
  assigned_user_id uuid null,
  subject text null,
  summary text null,
  sentiment_score double precision null,
  metadata jsonb null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  source text null default 'email'::text,
  content text null,
  sla_deadline timestamp with time zone null,
  escalation_reason text null,
  failure_reason text null,
  constraint email_events_pkey primary key (id),
  constraint unique_external_message unique (tenant_id, external_message_id),
  constraint email_events_department_id_fkey foreign KEY (department_id) references departments (id) on delete CASCADE,
  constraint email_events_tenant_id_fkey foreign KEY (tenant_id) references tenants (id) on delete CASCADE,
  constraint email_events_assigned_user_id_fkey foreign KEY (assigned_user_id) references users (id) on delete set null,
  constraint email_events_sentiment_score_check check (
    (
      (
        sentiment_score >= ('-1.0'::numeric)::double precision
      )
      and (sentiment_score <= (1.0)::double precision)
    )
  ),
  constraint department_required_after_processing check (
    (
      (
        current_state = any (
          array['queued'::email_state, 'processing'::email_state]
        )
      )
      or (department_id is not null)
    )
  ),
  constraint email_events_source_check check (
    (
      source = any (
        array[
          'gmail'::text,
          'outlook'::text,
          'imap'::text,
          'email'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_email_events_tenant on public.email_events using btree (tenant_id) TABLESPACE pg_default;

create index IF not exists idx_email_events_department on public.email_events using btree (department_id) TABLESPACE pg_default;

create index IF not exists idx_email_events_assigned_user on public.email_events using btree (assigned_user_id) TABLESPACE pg_default;

create index IF not exists idx_email_events_state on public.email_events using btree (current_state) TABLESPACE pg_default;

create index IF not exists idx_email_events_created_at on public.email_events using btree (created_at desc) TABLESPACE pg_default;

create unique INDEX IF not exists idx_email_events_idempotent on public.email_events using btree (tenant_id, external_message_id) TABLESPACE pg_default;

create trigger update_email_events_updated_at BEFORE
update on email_events for EACH row
execute FUNCTION update_updated_at_column ();
