create table if not exists public.products (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.movements (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.preparations (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.movements enable row level security;
alter table public.preparations enable row level security;

drop policy if exists "own products" on public.products;
drop policy if exists "own movements" on public.movements;
drop policy if exists "own preparations" on public.preparations;

create policy "own products" on public.products for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own movements" on public.movements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own preparations" on public.preparations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

do $$ begin
  alter publication supabase_realtime add table public.products;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.movements;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.preparations;
exception when duplicate_object then null; end $$;
