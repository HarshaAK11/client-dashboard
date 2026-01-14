create table public.temp_auth_users (
  id uuid not null default gen_random_uuid (),
  email text not null,
  password text not null,
  created_at timestamp with time zone null default now(),
  constraint temp_auth_users_pkey primary key (id),
  constraint temp_auth_users_email_key unique (email)
) TABLESPACE pg_default;