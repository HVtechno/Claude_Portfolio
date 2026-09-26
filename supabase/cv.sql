-- Run once in Supabase → SQL Editor. Creates the storage for the /cv editor.
-- Row Level Security is ON with NO policies, so the public (anon) key can't read
-- or write these tables at all — only the server, using the service-role key.

create table if not exists public.cv_documents (
  id text primary key check (id in ('draft', 'published')),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.cv_versions (
  id bigserial primary key,
  label text not null default 'Published',
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.cv_documents enable row level security;
alter table public.cv_versions enable row level security;
