-- Trail With Us initial Supabase schema. Run in Supabase SQL Editor.
-- Never expose the service_role key in browser code.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'user' check (role in ('user','guide','admin')),
  guide_status text not null default 'not_applied' check (guide_status in ('not_applied','pending','approved','rejected','suspended')),
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text not null default '',
  description text not null default '',
  image_url text,
  catalog_key text unique,
  is_published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  place_id uuid references public.places(id) on delete set null,
  price numeric(12,2) not null check (price >= 0),
  discount_percent numeric(5,2) not null default 0 check (discount_percent >= 0 and discount_percent <= 100),
  duration_days integer check (duration_days is null or duration_days > 0),
  capacity integer check (capacity is null or capacity > 0),
  is_published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  percent_off numeric(5,2) not null check (percent_off > 0 and percent_off <= 100),
  starts_at timestamptz,
  ends_at timestamptz,
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  redemption_count integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  package_id uuid references public.packages(id) on delete set null,
  guide_id uuid references public.profiles(id) on delete set null,
  place_id uuid references public.places(id) on delete set null,
  start_date date,
  travellers integer not null default 1 check (travellers > 0),
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed','refunded')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','failed','refunded')),
  special_requests text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guide_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  phone text not null,
  languages text[] not null default '{}',
  destinations text[] not null default '{}',
  daily_rate numeric(12,2) check (daily_rate is null or daily_rate between 0 and 1000000),
  experience text not null default '',
  verification_notes text not null default '',
  status text not null default 'pending' check (status in ('pending','approved','rejected','needs_more_info')),
  admin_notes text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  subject_id uuid references public.profiles(id),
  rating integer not null check (rating between 1 and 5),
  body text not null default '',
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  unique (booking_id, author_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id),
  reported_profile_id uuid references public.profiles(id),
  booking_id uuid references public.bookings(id),
  reason text not null,
  details text not null default '',
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);

create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'user')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.packages enable row level security;
alter table public.discounts enable row level security;
alter table public.bookings enable row level security;
alter table public.guide_applications enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;

-- Profiles: users can read their own profile; admins can review all profiles.
drop policy if exists "profile self or admin read" on public.profiles;
create policy "profile self or admin read" on public.profiles for select to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin');
drop policy if exists "admin updates profiles" on public.profiles;
create policy "admin updates profiles" on public.profiles for update to authenticated
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
-- No user-facing profile update policy: users cannot promote themselves to guide/admin.

-- Places and packages: visitors can read published records; only admins can write.
drop policy if exists "published places readable" on public.places;
create policy "published places readable" on public.places for select to anon, authenticated
using (is_published = true or public.current_user_role() = 'admin');
drop policy if exists "admin manages places" on public.places;
create policy "admin manages places" on public.places for all to authenticated
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
drop policy if exists "published packages readable" on public.packages;
create policy "published packages readable" on public.packages for select to anon, authenticated
using (is_published = true or public.current_user_role() = 'admin');
drop policy if exists "admin manages packages" on public.packages;
create policy "admin manages packages" on public.packages for all to authenticated
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

-- Discounts are only readable/writable by admins. Validate redemption on a trusted server later.
drop policy if exists "admin manages discounts" on public.discounts;
create policy "admin manages discounts" on public.discounts for all to authenticated
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

-- Bookings: traveller sees own; assigned guide sees assigned; admin sees/manages all.
drop policy if exists "booking parties read" on public.bookings;
create policy "booking parties read" on public.bookings for select to authenticated
using (user_id = auth.uid() or guide_id = auth.uid() or public.current_user_role() = 'admin');
drop policy if exists "traveller creates own booking" on public.bookings;
create policy "traveller creates own booking" on public.bookings for insert to authenticated
with check (user_id = auth.uid() and status = 'pending' and payment_status = 'unpaid');
drop policy if exists "admin manages bookings" on public.bookings;
create policy "admin manages bookings" on public.bookings for update to authenticated
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

-- Guide applications: users can submit/read their own; admin can review and update.
drop policy if exists "user reads own applications" on public.guide_applications;
create policy "user reads own applications" on public.guide_applications for select to authenticated
using (user_id = auth.uid() or public.current_user_role() = 'admin');
drop policy if exists "user submits own application" on public.guide_applications;
create policy "user submits own application" on public.guide_applications for insert to authenticated
with check (user_id = auth.uid() and status = 'pending');
drop policy if exists "admin reviews applications" on public.guide_applications;
create policy "admin reviews applications" on public.guide_applications for update to authenticated
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

-- Reviews and reports.
drop policy if exists "published reviews readable" on public.reviews;
create policy "published reviews readable" on public.reviews for select to anon, authenticated
using (is_hidden = false or public.current_user_role() = 'admin');
drop policy if exists "booking parties create reviews" on public.reviews;
create policy "booking parties create reviews" on public.reviews for insert to authenticated
with check (author_id = auth.uid() and exists (select 1 from public.bookings b where b.id = booking_id and (b.user_id = auth.uid() or b.guide_id = auth.uid()) and b.status = 'completed'));
drop policy if exists "users submit reports" on public.reports;
create policy "users submit reports" on public.reports for insert to authenticated
with check (reporter_id = auth.uid());
drop policy if exists "reporter or admin reads reports" on public.reports;
create policy "reporter or admin reads reports" on public.reports for select to authenticated
using (reporter_id = auth.uid() or public.current_user_role() = 'admin');
drop policy if exists "admin manages reports" on public.reports;
create policy "admin manages reports" on public.reports for update to authenticated
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create index if not exists bookings_user_created_idx on public.bookings(user_id, created_at desc);
create index if not exists bookings_guide_created_idx on public.bookings(guide_id, created_at desc);
create index if not exists applications_user_created_idx on public.guide_applications(user_id, created_at desc);
create index if not exists packages_published_idx on public.packages(is_published);
create index if not exists places_published_idx on public.places(is_published);
