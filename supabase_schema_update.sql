-- 1. Create the 'tipsters' table
create table public.tipsters (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  user_id uuid not null default auth.uid (),
  name text not null,
  initial_bankroll numeric not null default 0,
  constraint tipsters_pkey primary key (id),
  constraint tipsters_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

-- 2. Enable RLS on 'tipsters'
alter table public.tipsters enable row level security;

-- 3. Create policies for 'tipsters'
create policy "Enable read access for own tipsters" on public.tipsters
  for select using (auth.uid() = user_id);

create policy "Enable insert access for own tipsters" on public.tipsters
  for insert with check (auth.uid() = user_id);

create policy "Enable update access for own tipsters" on public.tipsters
  for update using (auth.uid() = user_id);

create policy "Enable delete access for own tipsters" on public.tipsters
  for delete using (auth.uid() = user_id);

-- 4. Add columns to 'bets' table
alter table public.bets 
add column tipster_id uuid references public.tipsters(id) on delete set null,
add column stake_percentage numeric;
