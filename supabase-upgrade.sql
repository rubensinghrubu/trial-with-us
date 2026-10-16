-- Trail With Us feature upgrade: checkout discounts, pending trip requests, and a shared admin-managed gallery.
-- Run in Supabase SQL Editor after supabase-setup.sql. Safe to re-run.

-- Store the checkout price breakdown with each pending request.
alter table public.packages
  add column if not exists image_url text;


-- Shared catalogue for stays, transport options and rental gear; public pages use these rows after migration.
create table if not exists public.trip_listings (
  id uuid primary key default gen_random_uuid(),
  catalog_key text unique,
  listing_type text not null check (listing_type in ('stay','ride','gear')),
  title text not null,
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  capacity integer check (capacity is null or capacity > 0),
  unit text not null default 'each',
  emoji text not null default '🧭',
  state text not null default 'All states',
  destination text not null default 'Everywhere',
  image_url text,
  is_published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.trip_listings add column if not exists capacity integer check (capacity is null or capacity > 0);
alter table public.trip_listings enable row level security;
drop policy if exists "published trip listings readable" on public.trip_listings;
create policy "published trip listings readable" on public.trip_listings for select to anon, authenticated
  using (is_published = true or public.current_user_role() = 'admin');
drop policy if exists "admins manage trip listings" on public.trip_listings;
create policy "admins manage trip listings" on public.trip_listings for all to authenticated
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
grant select on public.trip_listings to anon, authenticated;
grant insert, update, delete on public.trip_listings to authenticated;

alter table public.bookings
  add column if not exists subtotal_amount numeric(12,2) not null default 0,
  add column if not exists discount_amount numeric(12,2) not null default 0,
  add column if not exists discount_code text;

-- A shared gallery table. Built-in rows use keys like builtin-0; custom rows use custom-<uuid>.
create table if not exists public.gallery_entries (
  key text primary key,
  title text not null,
  place text not null,
  image_url text not null,
  crop_size text not null default 'cover',
  crop_position text not null default 'center',
  height integer not null default 260 check (height between 120 and 900),
  is_published boolean not null default true,
  is_builtin boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.gallery_entries enable row level security;
drop policy if exists "gallery rows readable" on public.gallery_entries;
create policy "gallery rows readable" on public.gallery_entries for select to anon, authenticated using (is_published = true or public.current_user_role() = 'admin');
drop policy if exists "admins manage gallery entries" on public.gallery_entries;
create policy "admins manage gallery entries" on public.gallery_entries for all to authenticated
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
grant select on public.gallery_entries to anon, authenticated;
grant insert, update, delete on public.gallery_entries to authenticated;

-- Public photo bucket; the gallery table controls which entries appear on the site.
insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true)
on conflict (id) do update set public = true;
drop policy if exists "gallery images public read" on storage.objects;
create policy "gallery images public read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'gallery-images');
drop policy if exists "admins upload gallery images" on storage.objects;
create policy "admins upload gallery images" on storage.objects for insert to authenticated
  with check (bucket_id = 'gallery-images' and public.current_user_role() = 'admin');
drop policy if exists "admins update gallery images" on storage.objects;
create policy "admins update gallery images" on storage.objects for update to authenticated
  using (bucket_id = 'gallery-images' and public.current_user_role() = 'admin')
  with check (bucket_id = 'gallery-images' and public.current_user_role() = 'admin');
drop policy if exists "admins delete gallery images" on storage.objects;
create policy "admins delete gallery images" on storage.objects for delete to authenticated
  using (bucket_id = 'gallery-images' and public.current_user_role() = 'admin');

-- Public profile pictures with per-user write access limited to each user's own folder.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;
drop policy if exists "avatar images public read" on storage.objects;
create policy "avatar images public read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'avatars');
drop policy if exists "users upload own avatar" on storage.objects;
create policy "users upload own avatar" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "users update own avatar" on storage.objects;
create policy "users update own avatar" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "users delete own avatar" on storage.objects;
create policy "users delete own avatar" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Let users edit only profile fields meant to be user-controlled, without granting role changes.
create or replace function public.update_my_profile(
  p_full_name text,
  p_phone text default null,
  p_avatar_url text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := trim(coalesce(p_full_name, ''));
  v_phone text := nullif(trim(coalesce(p_phone, '')), '');
  v_avatar text := nullif(trim(coalesce(p_avatar_url, '')), '');
begin
  if v_user_id is null then
    raise exception 'Sign in before updating your profile.';
  end if;
  if v_name = '' or length(v_name) > 100 then
    raise exception 'Enter a name between 1 and 100 characters.';
  end if;
  if v_phone is not null and length(v_phone) > 30 then
    raise exception 'Phone number must be 30 characters or fewer.';
  end if;
  if v_avatar is not null and (length(v_avatar) > 2048 or v_avatar !~ '^https://[^[:space:]]+$') then
    raise exception 'Profile pictures must use a valid HTTPS URL.';
  end if;
  update public.profiles
    set full_name = v_name, phone = v_phone, avatar_url = v_avatar, updated_at = now()
    where id = v_user_id;
  if not found then
    raise exception 'Your profile record could not be found. Sign out and sign in again.';
  end if;
end;
$$;
revoke all on function public.update_my_profile(text, text, text) from public;
grant execute on function public.update_my_profile(text, text, text) to authenticated;

-- Validate active coupon codes without granting visitors direct read access to the discounts table.
create or replace function public.validate_discount_code(p_code text)
returns table(percent_off numeric)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_percent numeric;
begin
  if auth.uid() is null then
    raise exception 'Sign in before applying a discount code.';
  end if;
  select d.percent_off into v_percent
  from public.discounts d
  where upper(d.code) = upper(trim(coalesce(p_code, '')))
    and d.is_active = true
    and (d.starts_at is null or d.starts_at <= now())
    and (d.ends_at is null or d.ends_at > now())
    and (d.max_redemptions is null or d.redemption_count < d.max_redemptions)
  limit 1;
  if v_percent is not null then
    return query select v_percent;
  end if;
end;
$$;
revoke all on function public.validate_discount_code(text) from public;
grant execute on function public.validate_discount_code(text) to authenticated;

-- Rebuild checkout with server-calculated catalogue pricing. Never trust browser line totals.
drop function if exists public.create_trip_request(numeric, text, jsonb);
drop function if exists public.create_trip_request(numeric, text, jsonb, date);
create function public.create_trip_request(
  p_subtotal numeric,
  p_discount_code text default null,
  p_items jsonb default '[]'::jsonb,
  p_start_date date default null
)
returns table(booking_id uuid, subtotal_amount numeric, discount_amount numeric, total_amount numeric, discount_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_subtotal numeric(12,2) := 0;
  v_discount numeric(12,2) := 0;
  v_total numeric(12,2);
  v_code text := nullif(upper(trim(coalesce(p_discount_code, ''))), '');
  v_discount_row public.discounts%rowtype;
  v_booking_id uuid;
  v_item jsonb;
  v_line jsonb;
  v_kind text;
  v_source text;
  v_source_id uuid;
  v_qty integer;
  v_travellers integer;
  v_amount numeric(12,2);
  v_title text;
  v_details text;
  v_normalized jsonb := '[]'::jsonb;
  v_booking_package uuid := null;
  v_booking_guide uuid := null;
  v_booking_place uuid := null;
  v_max_travellers integer := 1;
  v_package public.packages%rowtype;
  v_guide public.guide_applications%rowtype;
  v_listing public.trip_listings%rowtype;
  v_place public.places%rowtype;
  v_catalog_index integer;
  v_km numeric;
  v_base numeric;
  v_spread integer[] := array[0,18,32,45,60,75,90];
  v_cars integer;
  v_capacity integer;
  v_line_qty integer;
  v_line_total numeric(12,2);
  v_gear_details text;
begin
  if v_user_id is null then
    raise exception 'Sign in before submitting a trip request.';
  end if;
  if p_start_date is null or p_start_date < current_date then
    raise exception 'Choose today or a future preferred trip start date.';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'Your trip selections are invalid. Please remove and re-add your items.';
  end if;
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Your trip is empty. Add a published package, guide, stay, ride or gear item first.';
  end if;
  if jsonb_array_length(p_items) > 40 then
    raise exception 'Your trip contains too many separate selections. Please split it into smaller requests.';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_kind := coalesce(v_item->>'kind','');
    v_source := coalesce(v_item->>'source_id','');
    v_qty := coalesce(nullif(v_item->>'quantity','')::integer, 0);
    v_travellers := coalesce(nullif(v_item->>'travellers','')::integer, 1);
    if v_travellers < 1 or v_travellers > 20 then raise exception 'Traveller count must be between 1 and 20.'; end if;
    v_max_travellers := greatest(v_max_travellers, v_travellers);
    v_amount := 0;
    v_title := '';
    v_details := '';

    if v_kind in ('package','guide','stay','ride') then
      if v_source !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
        raise exception 'Some saved selections use an older format. Remove and re-add them to refresh catalogue pricing.';
      end if;
      v_source_id := v_source::uuid;
      if v_kind = 'package' then
        if v_qty < 1 or v_qty > 20 then raise exception 'Package traveller count is invalid.'; end if;
        select * into v_package from public.packages where id = v_source_id and is_published = true;
        if not found then raise exception 'A package is no longer published. Remove it and choose an available package again.'; end if;
        v_amount := round(v_package.price * (1 - v_package.discount_percent / 100), 0) * v_qty;
        v_title := 'Package: ' || v_package.title;
        v_details := coalesce(v_package.duration_days::text || ' days, ', '') || v_qty::text || ' traveller(s). ' || left(v_package.description, 1000);
        v_booking_package := v_package.id;
        v_booking_place := coalesce(v_booking_place, v_package.place_id);
      elsif v_kind = 'guide' then
        if v_qty < 1 or v_qty > 60 then raise exception 'Guide duration must be between 1 and 60 days.'; end if;
        select ga.* into v_guide
          from public.guide_applications ga join public.profiles pr on pr.id = ga.user_id
          where ga.user_id = v_source_id and ga.status = 'approved' and pr.role = 'guide' and pr.guide_status = 'approved'
          order by ga.updated_at desc limit 1;
        if not found or coalesce(v_guide.daily_rate,0) <= 0 then raise exception 'This guide is no longer available at a bookable published rate. Choose another guide.'; end if;
        v_amount := round(v_guide.daily_rate * v_qty, 2);
        v_title := 'Guide: ' || v_guide.full_name;
        v_details := v_qty::text || ' day(s); ' || array_to_string(v_guide.destinations, ', ');
        v_booking_guide := v_guide.user_id;
      elsif v_kind = 'stay' then
        if v_qty < 1 or v_qty > 120 then raise exception 'Stay duration or room count is invalid.'; end if;
        select * into v_listing from public.trip_listings where id = v_source_id and listing_type='stay' and unit='per_room_night' and is_published=true and price > 0;
        if not found then raise exception 'This stay is no longer published at a valid rate. Choose another available stay.'; end if;
        v_amount := round(v_listing.price * v_qty, 2);
        v_title := 'Stay: ' || v_listing.title;
        v_details := v_qty::text || ' room-night(s) · ' || v_listing.destination || ', ' || v_listing.state;
        select * into v_place from public.places where lower(name)=lower(v_listing.destination) and lower(state)=lower(v_listing.state) and is_published=true limit 1;
        if found then v_booking_place := coalesce(v_booking_place,v_place.id); end if;
      elsif v_kind = 'ride' then
        if v_travellers < 1 or v_travellers > 20 then raise exception 'Ride passenger count is invalid.'; end if;
        if coalesce(v_item->>'origin','') not in ('Guwahati','Dimapur','Shillong') then raise exception 'Choose a supported transport departure city.'; end if;
        select * into v_listing from public.trip_listings where id = v_source_id and listing_type='ride' and unit='per_km' and is_published=true and price > 0;
        if not found then raise exception 'This ride rate is no longer published. Choose an available transport option again.'; end if;
        select * into v_place from public.places where lower(name)=lower(coalesce(v_item->>'destination','')) and lower(state)=lower(coalesce(v_item->>'destination_state','')) and is_published=true limit 1;
        if not found then raise exception 'This destination is no longer published. Choose a destination again.'; end if;
        v_catalog_index := null;
        if v_place.catalog_key ~ '^dest-[0-9]{2,}$' then v_catalog_index := substring(v_place.catalog_key from 6)::integer; end if;
        if v_catalog_index between 0 and 6 then
          if v_item->>'origin' = 'Guwahati' then v_km := (array[360,160,175,190,350,480,430])[v_catalog_index+1];
          elsif v_item->>'origin' = 'Dimapur' then v_km := (array[85,480,520,140,250,600,420])[v_catalog_index+1];
          else v_km := (array[570,55,80,250,440,560,530])[v_catalog_index+1]; end if;
        else
          if v_item->>'origin' = 'Guwahati' then v_base := case v_place.state when 'Arunachal Pradesh' then 360 when 'Assam' then 145 when 'Manipur' then 490 when 'Meghalaya' then 100 when 'Mizoram' then 530 when 'Nagaland' then 260 when 'Sikkim' then 600 when 'Tripura' then 580 else 250 end;
          elsif v_item->>'origin' = 'Dimapur' then v_base := case v_place.state when 'Arunachal Pradesh' then 420 when 'Assam' then 170 when 'Manipur' then 280 when 'Meghalaya' then 380 when 'Mizoram' then 550 when 'Nagaland' then 95 when 'Sikkim' then 700 when 'Tripura' then 490 else 250 end;
          else v_base := case v_place.state when 'Arunachal Pradesh' then 500 when 'Assam' then 180 when 'Manipur' then 450 when 'Meghalaya' then 55 when 'Mizoram' then 450 when 'Nagaland' then 500 when 'Sikkim' then 650 when 'Tripura' then 400 else 250 end; end if;
          if v_catalog_index is null or v_catalog_index >= 51 then v_km := v_base + 45;
          else v_km := v_base + v_spread[(greatest(v_catalog_index,0) % 7)+1]; end if;
        end if;
        v_capacity := greatest(coalesce(v_listing.capacity,1),1);
        v_cars := case when v_capacity = 1 then v_travellers else ceil(v_travellers::numeric/v_capacity)::integer end;
        v_amount := round(v_km * v_listing.price * v_cars * case when coalesce((v_item->>'return_trip')::boolean,false) then 2 else 1 end, 2);
        v_title := 'Ride: ' || (v_item->>'origin') || ' to ' || v_place.name;
        v_details := coalesce(v_listing.title,'Transport option') || ' · planning estimate ~' || v_km::text || ' km · ' || v_travellers::text || ' passenger(s)' || case when coalesce((v_item->>'return_trip')::boolean,false) then ' · return' else ' · one way' end;
        v_booking_place := coalesce(v_booking_place, v_place.id);
      end if;
      v_normalized := v_normalized || jsonb_build_array(jsonb_build_object('kind',v_kind,'title',v_title,'details',v_details,'amount',v_amount));
      v_subtotal := v_subtotal + v_amount;
    elsif v_kind = 'gear_bundle' then
      if jsonb_typeof(v_item->'lines') <> 'array' or jsonb_array_length(v_item->'lines') = 0 or jsonb_array_length(v_item->'lines') > 20 then
        raise exception 'Your saved gear bundle is invalid. Remove it and select gear again.';
      end if;
      v_gear_details := '';
      for v_line in select value from jsonb_array_elements(v_item->'lines') loop
        v_source := coalesce(v_line->>'catalog_key','');
        v_line_qty := coalesce(nullif(v_line->>'quantity','')::integer,0);
        if v_line_qty < 1 or v_line_qty > 120 then raise exception 'Gear quantities must be between 1 and 120 item-days.'; end if;
        select * into v_listing from public.trip_listings where listing_type='gear' and unit='per_item_day' and is_published=true and price > 0 and (catalog_key=v_source or id::text=v_source) limit 1;
        if not found then raise exception 'A gear item is no longer published. Remove the bundle and select current gear again.'; end if;
        v_line_total := round(v_listing.price * v_line_qty,2);
        v_gear_details := concat_ws(', ', nullif(v_gear_details,''), v_line_qty::text || '× ' || v_listing.title);
        v_normalized := v_normalized || jsonb_build_array(jsonb_build_object('kind','gear','title',v_listing.title,'details',v_line_qty::text || ' item-day(s)','amount',v_line_total));
        v_subtotal := v_subtotal + v_line_total;
      end loop;
    else
      raise exception 'Some saved selections use an older format. Remove and re-add them to refresh catalogue pricing.';
    end if;
    if v_amount < 0 or v_amount > 100000000 then raise exception 'An item price is outside the permitted range.'; end if;
  end loop;

  v_subtotal := round(v_subtotal,2);
  if p_subtotal is null or abs(round(p_subtotal,2)-v_subtotal) > 0.02 then
    raise exception 'Listed prices changed or cannot be verified. Remove and re-add the affected items, then review the updated total.';
  end if;
  if v_subtotal > 100000000 then raise exception 'The trip subtotal exceeds the permitted limit.'; end if;

  if v_code is not null then
    select d.* into v_discount_row from public.discounts d
      where upper(d.code)=v_code order by d.created_at desc limit 1 for update;
    if not found or v_discount_row.is_active is distinct from true
      or (v_discount_row.starts_at is not null and v_discount_row.starts_at > now())
      or (v_discount_row.ends_at is not null and v_discount_row.ends_at <= now())
      or (v_discount_row.max_redemptions is not null and v_discount_row.redemption_count >= v_discount_row.max_redemptions) then
      raise exception 'That discount code is invalid, inactive, expired, or fully redeemed.';
    end if;
    v_discount := round(v_subtotal * v_discount_row.percent_off / 100,2);
  end if;
  v_total := greatest(0,v_subtotal-v_discount);
  insert into public.bookings (user_id, package_id, guide_id, place_id, start_date, travellers, status, payment_status,
    subtotal_amount, discount_amount, discount_code, total_amount, special_requests)
  values (v_user_id, v_booking_package, v_booking_guide, v_booking_place, p_start_date, v_max_travellers, 'pending', 'unpaid',
    v_subtotal, v_discount, v_code, v_total, v_normalized::text)
  returning id into v_booking_id;
  return query select v_booking_id, v_subtotal, v_discount, v_total, v_code;
end;
$$;
revoke all on function public.create_trip_request(numeric, text, jsonb, date) from public;
grant execute on function public.create_trip_request(numeric, text, jsonb, date) to authenticated;

-- Admin can accept/cancel a pending request or mark an accepted trip completed.
-- Accepting means the operator has verified availability and arranged payment separately.
create or replace function public.admin_update_trip_request(p_booking_id uuid, p_status text)
returns table(booking_id uuid, status text)
language plpgsql security definer set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_discount public.discounts%rowtype;
begin
  if auth.uid() is null or public.current_user_role() <> 'admin' then
    raise exception 'Only an administrator can update trip requests.';
  end if;
  if p_status not in ('confirmed','cancelled','completed') then
    raise exception 'Invalid trip request status.';
  end if;
  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'Trip request not found.'; end if;
  if p_status = 'completed' and v_booking.status <> 'confirmed' then
    raise exception 'Only an accepted trip request can be marked completed.';
  end if;
  if p_status = 'confirmed' and v_booking.status not in ('pending','confirmed') then
    raise exception 'Only a pending request can be accepted.';
  end if;
  if p_status = 'cancelled' and v_booking.status not in ('pending','confirmed','cancelled') then
    raise exception 'Only a pending or accepted request can be cancelled.';
  end if;
  if p_status = 'confirmed' and v_booking.status <> 'confirmed' and v_booking.discount_code is not null then
    select * into v_discount from public.discounts where upper(code) = upper(v_booking.discount_code) for update;
    -- If an administrator already deleted the code, keep the original quoted pending-request total.
    if found then
      if v_discount.max_redemptions is not null and v_discount.redemption_count >= v_discount.max_redemptions then
        raise exception 'The discount redemption limit has been reached; review the total before accepting.';
      end if;
      update public.discounts set redemption_count = redemption_count + 1 where id = v_discount.id;
    end if;
  end if;
  update public.bookings set status = p_status, updated_at = now() where id = p_booking_id;
  insert into public.notifications (user_id, title, message, type)
  values (
    v_booking.user_id,
    case p_status when 'confirmed' then 'Trip request accepted' when 'cancelled' then 'Trip request cancelled' else 'Trip marked completed' end,
    case p_status
      when 'confirmed' then 'Your trip request was accepted by the operator. Please confirm the final availability and payment arrangements with them; payment is not collected by this website.'
      when 'cancelled' then 'Your trip request was cancelled by the operator. Contact support if you need more details.'
      else 'The operator marked your trip as completed.'
    end,
    'trip_request'
  );
  return query select p_booking_id, p_status;
end;
$$;
revoke all on function public.admin_update_trip_request(uuid, text) from public;
grant execute on function public.admin_update_trip_request(uuid, text) to authenticated;


-- In-app notifications for guide application decisions.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'general',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications" on public.notifications for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Admins create notifications" on public.notifications;
create policy "Admins create notifications" on public.notifications for insert to authenticated with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "Users mark own notifications read" on public.notifications;
create policy "Users mark own notifications read" on public.notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Fields required for the editable eight-state destination catalogue and provider pricing.
alter table public.places add column if not exists catalog_key text;
create unique index if not exists places_catalog_key_unique on public.places(catalog_key) where catalog_key is not null;
alter table public.guide_applications add column if not exists daily_rate numeric(12,2) check (daily_rate is null or daily_rate between 0 and 1000000);

-- Public-safe list of approved local guides. Private phone numbers and verification notes are never exposed.
drop function if exists public.list_approved_guides();
create function public.list_approved_guides()
returns table (
  user_id uuid,
  full_name text,
  languages text[],
  destinations text[],
  daily_rate numeric,
  experience text,
  avatar_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select ga.user_id, ga.full_name, ga.languages, ga.destinations, ga.daily_rate, ga.experience, p.avatar_url
  from public.guide_applications ga
  join public.profiles p on p.id = ga.user_id
  where ga.status = 'approved'
    and p.role = 'guide'
    and p.guide_status = 'approved'
    and ga.daily_rate > 0
  order by lower(ga.full_name);
$$;
revoke all on function public.list_approved_guides() from public;
grant execute on function public.list_approved_guides() to anon, authenticated;

-- Seed the public destination catalogue once, so the Admin > Places workspace can maintain it.
-- Relative image names are still rendered from the site's local assets folder by the UI.
do $$
declare
  rec record;
  catalog_index integer := 0;
  catalog_key_value text;
  catalogue jsonb := '[
    {"name":"Dzükou Valley","state":"Nagaland","description":"A high ridge valley known for seasonal flowers and trekking routes.","image_url":"assets/valley.jpg"},
    {"name":"Living Root Bridges","state":"Meghalaya","description":"Living bridges woven from rubber tree roots around Nongriat and the Khasi Hills.","image_url":"assets/bridge.jpg"},
    {"name":"Dawki & Mawlynnong","state":"Meghalaya","description":"Clear river water, village walks and the green hills of the southern Khasi region.","image_url":"assets/boats.jpg"},
    {"name":"Kaziranga National Park","state":"Assam","description":"Grasslands and wetlands known for the greater one-horned rhinoceros.","image_url":"assets/falls.jpg"},
    {"name":"Majuli Island","state":"Assam","description":"River-island culture, satras, mask making and Mising heritage.","image_url":"assets/boats.jpg"},
    {"name":"Tawang","state":"Arunachal Pradesh","description":"High Himalayan scenery, Tawang Monastery and mountain passes.","image_url":"assets/road.jpg"},
    {"name":"Ziro Valley","state":"Arunachal Pradesh","description":"Apatani villages, pine hills and paddy landscapes.","image_url":"assets/valley.jpg"},
    {"name":"Manas National Park","state":"Assam","description":"Foothill forests and riverine wildlife landscapes near Bhutan.","image_url":"assets/hikers.jpg"},
    {"name":"Kamakhya Temple","state":"Assam","description":"A major Shakti pilgrimage site on Nilachal Hill in Guwahati.","image_url":"assets/road.jpg"},
    {"name":"Sivasagar Ahom Heritage","state":"Assam","description":"Ahom-era monuments, tanks and historic architecture around Sivasagar.","image_url":"assets/bridge.jpg"},
    {"name":"Charaideo Maidams","state":"Assam","description":"The royal burial mounds of the Ahom dynasty.","image_url":"assets/hikers.jpg"},
    {"name":"Haflong & Haflong Lake","state":"Assam","description":"A hill town surrounded by forested ridges in Dima Hasao.","image_url":"assets/valley.jpg"},
    {"name":"Sela Pass","state":"Arunachal Pradesh","description":"A high mountain pass and lake landscape on the route to Tawang.","image_url":"assets/road.jpg"},
    {"name":"Dirang","state":"Arunachal Pradesh","description":"Monpa heritage, apple orchards, valleys and mountain views.","image_url":"assets/valley.jpg"},
    {"name":"Bomdila","state":"Arunachal Pradesh","description":"Monasteries, craft centres and Himalayan viewpoints.","image_url":"assets/hikers.jpg"},
    {"name":"Mechuka","state":"Arunachal Pradesh","description":"A remote valley with rivers, wooden homes and dramatic mountain scenery.","image_url":"assets/valley.jpg"},
    {"name":"Namdapha National Park","state":"Arunachal Pradesh","description":"A vast eastern Himalayan biodiversity hotspot in Changlang district.","image_url":"assets/falls.jpg"},
    {"name":"Shillong","state":"Meghalaya","description":"A lively hill city, music culture, markets and viewpoints.","image_url":"assets/hikers.jpg"},
    {"name":"Sohra (Cherrapunji)","state":"Meghalaya","description":"Rainforest cliffs, waterfalls, caves and monsoon landscapes.","image_url":"assets/falls.jpg"},
    {"name":"Laitlum Canyon","state":"Meghalaya","description":"Wide escarpment views above deep green valleys.","image_url":"assets/valley.jpg"},
    {"name":"Mawphlang Sacred Forest","state":"Meghalaya","description":"A community-protected forest with Khasi cultural traditions.","image_url":"assets/hikers.jpg"},
    {"name":"Krang Suri Falls","state":"Meghalaya","description":"A blue-green waterfall pool surrounded by forested hills.","image_url":"assets/falls.jpg"},
    {"name":"Loktak Lake","state":"Manipur","description":"A large freshwater lake with floating phumdis and boat journeys.","image_url":"assets/boats.jpg"},
    {"name":"Keibul Lamjao National Park","state":"Manipur","description":"The floating national park and habitat of the endangered Sangai deer.","image_url":"assets/boats.jpg"},
    {"name":"Kangla Fort, Imphal","state":"Manipur","description":"A historic seat of Meitei power and an important cultural site.","image_url":"assets/bridge.jpg"},
    {"name":"Shirui Hills","state":"Manipur","description":"Mountain landscapes known for the rare Shirui lily in its flowering season.","image_url":"assets/valley.jpg"},
    {"name":"Andro Heritage Village","state":"Manipur","description":"A traditional village known for pottery, heritage and local craft.","image_url":"assets/hikers.jpg"},
    {"name":"Aizawl","state":"Mizoram","description":"A ridge-top capital with lively markets, views and Mizo culture.","image_url":"assets/hikers.jpg"},
    {"name":"Reiek","state":"Mizoram","description":"A forested hill and heritage village overlooking the surrounding ranges.","image_url":"assets/valley.jpg"},
    {"name":"Vantawng Falls","state":"Mizoram","description":"A high waterfall surrounded by dense green hills near Thenzawl.","image_url":"assets/falls.jpg"},
    {"name":"Phawngpui (Blue Mountain)","state":"Mizoram","description":"Mizoram’s highest peak with cloud forests and panoramic viewpoints.","image_url":"assets/valley.jpg"},
    {"name":"Tam Dil Lake","state":"Mizoram","description":"A forest-ringed lake popular for quiet nature outings.","image_url":"assets/boats.jpg"},
    {"name":"Hmuifang","state":"Mizoram","description":"A forested hill area with Mizo village culture and outdoor trails.","image_url":"assets/hikers.jpg"},
    {"name":"Kohima","state":"Nagaland","description":"The state capital, Naga heritage and the historic war cemetery.","image_url":"assets/hikers.jpg"},
    {"name":"Khonoma Green Village","state":"Nagaland","description":"A community-led conservation village with Angami heritage and walking trails.","image_url":"assets/valley.jpg"},
    {"name":"Mokokchung","state":"Nagaland","description":"Ao Naga culture, lively hill neighbourhoods and nearby villages.","image_url":"assets/hikers.jpg"},
    {"name":"Doyang Reservoir","state":"Nagaland","description":"Reservoir scenery and a seasonal gathering place for migratory Amur falcons.","image_url":"assets/boats.jpg"},
    {"name":"Longwa Village","state":"Nagaland","description":"A Konyak village near the international border, known for its distinctive setting.","image_url":"assets/road.jpg"},
    {"name":"Gangtok","state":"Sikkim","description":"A Himalayan city with monasteries, markets and views of Kanchenjunga on clear days.","image_url":"assets/hikers.jpg"},
    {"name":"Tsomgo (Changu) Lake","state":"Sikkim","description":"A high-altitude glacial lake; access rules and permits can apply.","image_url":"assets/boats.jpg"},
    {"name":"Nathula Pass","state":"Sikkim","description":"A high mountain pass that requires current permit and access checks.","image_url":"assets/road.jpg"},
    {"name":"Yumthang Valley","state":"Sikkim","description":"An alpine valley of rivers, meadows and seasonal rhododendrons.","image_url":"assets/valley.jpg"},
    {"name":"Gurudongmar Lake","state":"Sikkim","description":"A high-altitude sacred lake; weather, health and permit restrictions matter.","image_url":"assets/boats.jpg"},
    {"name":"Pelling & Pemayangtse","state":"Sikkim","description":"Monastery heritage and western Sikkim mountain viewpoints.","image_url":"assets/hikers.jpg"},
    {"name":"Ravangla Buddha Park","state":"Sikkim","description":"A large Buddha statue and peaceful garden views near the foothills.","image_url":"assets/valley.jpg"},
    {"name":"Ujjayanta Palace, Agartala","state":"Tripura","description":"A white-domed former royal palace now housing a state museum.","image_url":"assets/bridge.jpg"},
    {"name":"Neermahal","state":"Tripura","description":"A lake palace set in Rudrasagar Lake.","image_url":"assets/boats.jpg"},
    {"name":"Unakoti","state":"Tripura","description":"Rock-cut Shaivite sculptures and monumental stone reliefs in a forested setting.","image_url":"assets/hikers.jpg"},
    {"name":"Jampui Hills","state":"Tripura","description":"Cooler hill scenery, viewpoints and orange-growing villages.","image_url":"assets/valley.jpg"},
    {"name":"Tripura Sundari Temple","state":"Tripura","description":"An important historic temple at Matabari near Udaipur.","image_url":"assets/bridge.jpg"},
    {"name":"Sepahijala Wildlife Sanctuary","state":"Tripura","description":"A protected area with forest trails, wetlands and wildlife attractions.","image_url":"assets/falls.jpg"}
  ]'::jsonb;
begin
  for rec in
    select x.name, x.state, x.description, x.image_url, arr.ordinality
    from jsonb_array_elements(catalogue) with ordinality as arr(value, ordinality)
    cross join lateral jsonb_to_record(arr.value) as x(
      name text,
      state text,
      description text,
      image_url text
    )
    order by arr.ordinality
  loop
    catalog_index := rec.ordinality::integer - 1;
    catalog_key_value := 'dest-' || lpad(catalog_index::text, 2, '0');
    if not exists (select 1 from public.places p where p.catalog_key = catalog_key_value) then
      update public.places p set catalog_key = catalog_key_value
        where p.id = (select p2.id from public.places p2 where lower(p2.name) = lower(rec.name) and lower(p2.state) = lower(rec.state) and p2.catalog_key is null order by p2.created_at limit 1);
      if not exists (select 1 from public.places p where p.catalog_key = catalog_key_value) then
        insert into public.places (name, state, description, image_url, catalog_key, is_published)
        values (rec.name, rec.state, rec.description, rec.image_url, catalog_key_value, true);
      end if;
    end if;
  end loop;
end $$;

-- Lets public pages distinguish an unpublished built-in destination from a missing migration.
create or replace function public.list_public_destination_keys()
returns table(catalog_key text)
language sql stable security definer set search_path = public
as $$ select p.catalog_key from public.places p where p.is_published = true and p.catalog_key is not null $$;
revoke all on function public.list_public_destination_keys() from public;
grant execute on function public.list_public_destination_keys() to anon, authenticated;

-- Seed the original package catalogue once; admin edits remain authoritative on subsequent runs.
do $$
begin
  if not exists (select 1 from public.packages) then
    insert into public.packages (title, description, price, discount_percent, duration_days, image_url, is_published)
    values
      ('Dzükou Weekend', 'Suggested Dzükou itinerary with guide, stay and return transport planning. Price is indicative; providers, permits and availability must be confirmed.', 9800, 0, 3, 'assets/valley.jpg', true),
      ('Roots and Rivers', 'Suggested Nongriat trek, Dawki boat ride and Shillong transfer itinerary. Price is indicative; providers and availability must be confirmed.', 18500, 0, 5, 'assets/bridge.jpg', true),
      ('Wild Assam', 'Suggested Kaziranga safaris and Majuli river-island itinerary. Price is indicative; safari slots, permits and transport must be confirmed.', 24000, 0, 4, 'assets/boats.jpg', true),
      ('Tawang and Ziro Loop', 'Suggested monastery circuit and Apatani valley itinerary. Price is indicative; local providers and availability must be confirmed.', 36000, 0, 7, 'assets/road.jpg', true);
  end if;
end $$;

-- Seed shared stays, rides and gear once. These are starter listings and should be verified/edited by the operator.
do $$
begin
  -- Replace any still-unedited older illustrative homestay names with private provider drafts.
  update public.trip_listings
    set title = case catalog_key
      when 'stay-00' then 'Draft accommodation — Arunachal Pradesh'
      when 'stay-01' then 'Draft accommodation — Assam'
      when 'stay-02' then 'Draft accommodation — Manipur'
      when 'stay-03' then 'Draft accommodation — Meghalaya'
      when 'stay-04' then 'Draft accommodation — Mizoram'
      when 'stay-05' then 'Draft accommodation — Nagaland'
      when 'stay-06' then 'Draft accommodation — Sikkim'
      else title end,
      state = case catalog_key
      when 'stay-00' then 'Arunachal Pradesh' when 'stay-01' then 'Assam'
      when 'stay-02' then 'Manipur' when 'stay-03' then 'Meghalaya'
      when 'stay-04' then 'Mizoram' when 'stay-05' then 'Nagaland'
      when 'stay-06' then 'Sikkim' else state end,
      destination = case catalog_key
      when 'stay-00' then 'Tawang' when 'stay-01' then 'Kaziranga National Park'
      when 'stay-02' then 'Loktak Lake' when 'stay-03' then 'Dawki & Mawlynnong'
      when 'stay-04' then 'Aizawl' when 'stay-05' then 'Dzükou Valley'
      when 'stay-06' then 'Gangtok' else destination end,
      description = 'UNPUBLISHED TEMPLATE: replace with a real, verified property name, address, contact, photos, terms and current rate before publishing.',
      price = 0, is_published = false, updated_at = now()
    where catalog_key in ('stay-00','stay-01','stay-02','stay-03','stay-04','stay-05','stay-06')
      and title in ('Viswema Hearth Home','Nongriat Rootside Stay','Bamboo House Mawlynnong','Paddy House Kaziranga','Stilt Home Majuli','Monpa Home Tawang','Apatani Lodge Ziro');

  insert into public.trip_listings (catalog_key, listing_type, title, description, price, capacity, unit, emoji, state, destination, is_published)
  values
    ('stay-00','stay','Draft accommodation — Arunachal Pradesh','UNPUBLISHED TEMPLATE: add a real, verified property name, address, contact, photos, terms and current rate before publishing.',0,null,'per_room_night','🏡','Arunachal Pradesh','Tawang',false),
    ('stay-01','stay','Draft accommodation — Assam','UNPUBLISHED TEMPLATE: add a real, verified property name, address, contact, photos, terms and current rate before publishing.',0,null,'per_room_night','🏡','Assam','Kaziranga National Park',false),
    ('stay-02','stay','Draft accommodation — Manipur','UNPUBLISHED TEMPLATE: add a real, verified property name, address, contact, photos, terms and current rate before publishing.',0,null,'per_room_night','🏡','Manipur','Loktak Lake',false),
    ('stay-03','stay','Draft accommodation — Meghalaya','UNPUBLISHED TEMPLATE: add a real, verified property name, address, contact, photos, terms and current rate before publishing.',0,null,'per_room_night','🏡','Meghalaya','Dawki & Mawlynnong',false),
    ('stay-04','stay','Draft accommodation — Mizoram','UNPUBLISHED TEMPLATE: add a real, verified property name, address, contact, photos, terms and current rate before publishing.',0,null,'per_room_night','🏡','Mizoram','Aizawl',false),
    ('stay-05','stay','Draft accommodation — Nagaland','UNPUBLISHED TEMPLATE: add a real, verified property name, address, contact, photos, terms and current rate before publishing.',0,null,'per_room_night','🏡','Nagaland','Dzükou Valley',false),
    ('stay-06','stay','Draft accommodation — Sikkim','UNPUBLISHED TEMPLATE: add a real, verified property name, address, contact, photos, terms and current rate before publishing.',0,null,'per_room_night','🏡','Sikkim','Gangtok',false),
    ('stay-07','stay','Draft accommodation — Tripura','UNPUBLISHED TEMPLATE: add a real, verified property name, address, contact, photos, terms and current rate before publishing.',0,null,'per_room_night','🏡','Tripura','Ujjayanta Palace, Agartala',false),
    ('ride-00','ride','Shared seat estimate','Planning estimate only; confirm route, operator, seat availability and final fare before acceptance.',7,1,'per_km','🚐','All states','Everywhere',true),
    ('ride-01','ride','Taxi estimate · up to 4','Planning estimate only; confirm route, licensed operator, availability and final fare before acceptance.',16,4,'per_km','🚕','All states','Everywhere',true),
    ('ride-02','ride','Private SUV estimate · up to 6','Planning estimate only; confirm route, permits, operator and final fare before acceptance.',22,6,'per_km','🚙','All states','Everywhere',true),
    ('gear-00','gear','Trekking pole','Starter rental rate; operator must verify stock, condition and collection before accepting.',150,null,'per_item_day','🥢','All states','Everywhere',true),
    ('gear-01','gear','2-person tent','Starter rental rate; operator must verify stock, condition and collection before accepting.',600,null,'per_item_day','⛺','All states','Everywhere',true),
    ('gear-02','gear','Sleeping bag','Starter rental rate; confirm stock, condition and temperature rating before accepting.',350,null,'per_item_day','🛌','All states','Everywhere',true),
    ('gear-03','gear','Rain jacket','Starter rental rate; confirm stock, sizes and waterproof condition before accepting.',250,null,'per_item_day','🧥','All states','Everywhere',true),
    ('gear-04','gear','Backpack 50L','Starter rental rate; confirm stock, fit and condition before accepting.',300,null,'per_item_day','🎒','All states','Everywhere',true),
    ('gear-05','gear','Headlamp','Starter rental rate; confirm stock and battery/charge before accepting.',100,null,'per_item_day','🔦','All states','Everywhere',true),
    ('gear-06','gear','Trekking shoes','Starter rental rate; confirm stock, sizes and tread condition before accepting.',400,null,'per_item_day','🥾','All states','Everywhere',true)
  on conflict (catalog_key) do nothing;
end $$;
