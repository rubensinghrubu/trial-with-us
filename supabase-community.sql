-- Trail With Us community Q&A, trekker tips and trek-buddy board.
-- Run after supabase-setup.sql / supabase-upgrade.sql in Supabase SQL Editor.
-- Safe to re-run. Community posts are public to read; only signed-in users can post/reply.

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null default 'Traveller' check (char_length(author_name) between 1 and 80),
  post_type text not null check (post_type in ('question','tip','buddy')),
  title text not null check (char_length(title) between 3 and 120),
  body text not null check (char_length(body) between 3 and 3000),
  state text not null default '',
  destination text not null default '',
  travel_date date,
  experience_level text not null default '',
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null default 'Traveller' check (char_length(author_name) between 1 and 80),
  body text not null check (char_length(body) between 1 and 1500),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists community_posts_created_idx on public.community_posts(created_at desc);
create index if not exists community_posts_type_idx on public.community_posts(post_type, created_at desc);
create index if not exists community_replies_post_created_idx on public.community_replies(post_id, created_at asc);

alter table public.community_posts enable row level security;
alter table public.community_replies enable row level security;

grant select on public.community_posts to anon, authenticated;
grant insert, update, delete on public.community_posts to authenticated;
grant select on public.community_replies to anon, authenticated;
grant insert, update, delete on public.community_replies to authenticated;

drop policy if exists "community posts readable" on public.community_posts;
create policy "community posts readable" on public.community_posts
  for select to anon, authenticated
  using (is_hidden = false or public.current_user_role() = 'admin');

drop policy if exists "signed-in users create community posts" on public.community_posts;
create policy "signed-in users create community posts" on public.community_posts
  for insert to authenticated
  with check (author_id = auth.uid() and is_hidden = false);

drop policy if exists "authors update their community posts" on public.community_posts;
create policy "authors update their community posts" on public.community_posts
  for update to authenticated
  using (author_id = auth.uid() or public.current_user_role() = 'admin')
  with check (author_id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "authors delete their community posts" on public.community_posts;
create policy "authors delete their community posts" on public.community_posts
  for delete to authenticated
  using (author_id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "visible post replies readable" on public.community_replies;
create policy "visible post replies readable" on public.community_replies
  for select to anon, authenticated
  using (
    (is_hidden = false and exists (
      select 1 from public.community_posts p
      where p.id = post_id and (p.is_hidden = false or public.current_user_role() = 'admin')
    )) or public.current_user_role() = 'admin'
  );

drop policy if exists "signed-in users reply to visible posts" on public.community_replies;
create policy "signed-in users reply to visible posts" on public.community_replies
  for insert to authenticated
  with check (
    author_id = auth.uid() and is_hidden = false and exists (
      select 1 from public.community_posts p
      where p.id = post_id and p.is_hidden = false
    )
  );

drop policy if exists "authors update their community replies" on public.community_replies;
create policy "authors update their community replies" on public.community_replies
  for update to authenticated
  using (author_id = auth.uid() or public.current_user_role() = 'admin')
  with check (author_id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "authors delete their community replies" on public.community_replies;
create policy "authors delete their community replies" on public.community_replies
  for delete to authenticated
  using (author_id = auth.uid() or public.current_user_role() = 'admin');

-- Derive displayed names from the signed-in profile / JWT rather than trusting arbitrary form text.
create or replace function public.set_community_author_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_name text;
  token_email text;
begin
  select nullif(trim(full_name), '') into profile_name
  from public.profiles where id = auth.uid();
  token_email := auth.jwt() ->> 'email';
  new.author_name := left(coalesce(
    profile_name,
    nullif(trim(auth.jwt() -> 'user_metadata' ->> 'full_name'), ''),
    nullif(trim(auth.jwt() -> 'user_metadata' ->> 'name'), ''),
    nullif(split_part(coalesce(token_email, ''), '@', 1), ''),
    'Traveller'
  ), 80);
  return new;
end;
$$;

drop trigger if exists set_community_post_author_name on public.community_posts;
create trigger set_community_post_author_name
before insert or update of author_name on public.community_posts
for each row execute function public.set_community_author_name();

drop trigger if exists set_community_reply_author_name on public.community_replies;
create trigger set_community_reply_author_name
before insert or update of author_name on public.community_replies
for each row execute function public.set_community_author_name();
