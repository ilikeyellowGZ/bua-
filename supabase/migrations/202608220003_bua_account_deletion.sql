alter table public.profiles
  add column if not exists deletion_requested_at timestamptz;
