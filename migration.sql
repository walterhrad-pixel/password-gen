drop table if exists passwords;

create table passwords (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users not null,
  ciphertext text not null,
  iv         text not null,
  created_at timestamptz default now()
);

alter table passwords enable row level security;

create policy "Users manage own passwords" on passwords
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table vault_meta (
  user_id           uuid references auth.users primary key,
  salt              text not null,
  check_ciphertext  text not null,
  check_iv          text not null,
  created_at        timestamptz default now()
);

alter table vault_meta enable row level security;

create policy "Users manage own vault meta" on vault_meta
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
  