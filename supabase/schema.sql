-- =============================================================
-- BUDDIES — Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- =============================================================

-- Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- =============================================================
-- 1. TABLES
-- =============================================================

-- Profiles (one per user; auth_id links to auth.users when signed up)
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  avatar text,
  bio text,
  favorite_snack text,
  hobbies text[] default '{}',
  rating numeric(3,2) default 5.0,
  events_hosted int default 0,
  events_attended int default 0,
  badge text,
  push_subscription jsonb,
  created_at timestamptz default now()
);

-- Active / upcoming events
create table if not exists public.events (
  id bigserial primary key,
  title text not null,
  description text,
  host_id uuid references public.profiles(id) on delete cascade,
  date date not null,
  time time not null,
  location text,
  lat double precision,
  lng double precision,
  max_snackers int default 8,
  current_snackers int default 0,
  snack_size int default 10,
  image text,
  status text default 'planning',
  tag text,
  walk_time text,
  created_at timestamptz default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'events_status_check'
  ) then
    alter table public.events
      add constraint events_status_check
      check (status in ('planning', 'confirmed', 'cancelled'));
  end if;
end;
$$;

-- Past events (history showcase on profile)
create table if not exists public.past_events (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  location text,
  date text,
  image text,
  tag text
);

-- Event applicants
create table if not exists public.applicants (
  id bigserial primary key,
  event_id bigint references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  name text,
  avatar text,
  message text,
  status text default 'pending', -- pending | accepted | rejected
  created_at timestamptz default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'applicants_status_check'
  ) then
    alter table public.applicants
      add constraint applicants_status_check
      check (status in ('pending', 'accepted', 'rejected'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'applicants_event_user_unique'
  ) then
    alter table public.applicants
      add constraint applicants_event_user_unique
      unique (event_id, user_id);
  end if;
end;
$$;

-- =============================================================
-- 2. ROW-LEVEL SECURITY (RLS)
-- =============================================================
alter table public.profiles    enable row level security;
alter table public.events      enable row level security;
alter table public.past_events enable row level security;
alter table public.applicants  enable row level security;

-- Profiles
drop policy if exists "Profiles viewable by everyone"   on public.profiles;
drop policy if exists "Users can insert own profile"    on public.profiles;
drop policy if exists "Users can update own profile"    on public.profiles;
create policy "Profiles viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert own profile"  on public.profiles for insert with check (auth.uid() = auth_id);
create policy "Users can update own profile"  on public.profiles for update using (auth.uid() = auth_id);

-- Events
drop policy if exists "Events viewable by everyone"     on public.events;
drop policy if exists "Authenticated can insert events" on public.events;
drop policy if exists "Host can update own events"      on public.events;
drop policy if exists "Host can delete own events"      on public.events;
create policy "Events viewable by everyone"     on public.events for select using (true);
create policy "Authenticated can insert events" on public.events for insert
  with check (exists (select 1 from public.profiles p where p.id = host_id and p.auth_id = auth.uid()));
create policy "Host can update own events" on public.events for update
  using (exists (select 1 from public.profiles p where p.id = host_id and p.auth_id = auth.uid()));
create policy "Host can delete own events" on public.events for delete
  using (exists (select 1 from public.profiles p where p.id = host_id and p.auth_id = auth.uid()));

-- Past events
drop policy if exists "Past events viewable by everyone" on public.past_events;
drop policy if exists "Users manage own past events"     on public.past_events;
create policy "Past events viewable by everyone" on public.past_events for select using (true);
create policy "Users manage own past events"     on public.past_events for all
  using (exists (select 1 from public.profiles p where p.id = user_id and p.auth_id = auth.uid()));

-- Applicants
drop policy if exists "Applicants viewable by everyone"   on public.applicants;
drop policy if exists "Authenticated can apply"           on public.applicants;
drop policy if exists "Host can update applicant status"  on public.applicants;
create policy "Applicants viewable by everyone" on public.applicants for select using (true);
create policy "Authenticated can apply" on public.applicants for insert
  with check (exists (select 1 from public.profiles p where p.id = user_id and p.auth_id = auth.uid()));
create policy "Host can update applicant status" on public.applicants for update using (
  exists (
    select 1 from public.events e
    join public.profiles p on p.id = e.host_id
    where e.id = event_id and p.auth_id = auth.uid()
  )
);

-- =============================================================
-- 3. AUTO-CREATE PROFILE ON SIGNUP
-- =============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (auth_id, name, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(
      new.raw_user_meta_data->>'avatar',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id::text
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- Apaga todos os dados de exemplo, mas mantém as tabelas e políticas.
-- ATENÇÃO: Isto elimina dados reais se já os tiveres. Usa apenas em ambiente de desenvolvimento.
TRUNCATE TABLE public.applicants CASCADE;
TRUNCATE TABLE public.past_events CASCADE;
TRUNCATE TABLE public.events CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- Reinicia as sequências para que os IDs voltem a 1
ALTER SEQUENCE public.events_id_seq RESTART WITH 1;
ALTER SEQUENCE public.applicants_id_seq RESTART WITH 1;
ALTER SEQUENCE public.past_events_id_seq RESTART WITH 1;


-- =============================================================
-- 4. SEED DATA
-- =============================================================
-- Demo profiles (no auth.users link — visible as event hosts)
insert into public.profiles (id, name, avatar, bio, favorite_snack, hobbies, rating, events_hosted, events_attended, badge)
values
  ('11111111-1111-1111-1111-111111111111',
   'Julian Hearthstone',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuDTDMsxzNJvcl1sUSbJ-JPqZun_GgLarqwepjbm8196TZQRINVn_WHCdU8uv9Kssfk_m35OlMQx8KmLfCn7a7ftRSKCB13TJCfBrB34ZdDKcxVrBrxaOEH3NToBlr0sGX_yAzpO0sdeRUYl6QdhMsBbqdcIfK9I7roHSNwk0W7y0CJ29vzCOxQwADXHnngcE9cifh5FtdBhnI-MwT5VSee31_tGPi9GPwd5AKp2Q7IeyjlL2gE6kwe5riFliDRA5fawnk8VdTzjfHc',
   'Curating the intersection of atmospheric smoke and artisanal snacking. A seeker of the perfect char and the quietest tea rooms.',
   'Dark Chocolate Matcha Truffles',
   array['Tea Ceremonies','Sourdough','Pottery','Foraging','Latte Art'],
   5.0, 100, 42, '50cm Snack Mastery'),
  ('22222222-2222-2222-2222-222222222222',
   'Master Kenji',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuCj78_h-oMjA6c7Qd-w6Yd8dGH4sE_9e5BcXgEkSKR732JFXpJBL2zDVA35p4SAN8ImffXNOLc8GgWF53DUk7DXliov5pge_2clngVNfIeqqz7fKeXW-iauTwtVZzAmwdp75L0WWgaXHqUo7V_8-PPCWOteWuN9WNCMJiNi1gbRbNDTqPVinKpy_FaVQG_1oEhatBzeQkImVkiKAJcNO5aOglN7Lv7onC8ujYQcYDNDqo3b85Jj-t2tvQl4jc3sgtv_MJoTr1E4xnEV',
   'A third-generation tea ceremony instructor dedicated to making the art of Zen accessible.',
   'Wagashi',
   array['Matcha','Calligraphy','Meditation'],
   5.0, 200, 0, null),
  ('33333333-3333-3333-3333-333333333333',
   'Sofia Baker',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuDG9lvQOTfX-l1rdquMHIV5iW-beaAPgQru5cQCgAOonadA9j4p_YYMNDcmhXS5fiDaFOUMdYQZxIHdovAZpVzBdJ8q0fUMJFSXNjZVV2hPuekmUpVIyp7DXCtvTVXo6mQB26tLUXp3nVi_r3crUvxS3Pn-OSp62uJ6gxlQ-oLMNkAqg9Ma_y9n4Eue3X4iuiocA4cX7SpyT3JPPxdPHL-xnM-H_ULmokmLJMr0hFHLADDOOqIi7hjullxqCirqY98GEfMypHyjDZ8f',
   'Passionate baker who loves sharing fresh pastries with the community.',
   'Croissants',
   array['Baking','Photography','Hiking'],
   4.8, 34, 0, null)
on conflict (id) do nothing;

-- Demo events
insert into public.events (title, description, host_id, date, time, location, lat, lng, max_snackers, current_snackers, snack_size, image, status, tag, walk_time)
values
  ('Green Whisk Pop-up',
   'Experimental matcha tea & mochi pairing session in a cozy garden setting.',
   '22222222-2222-2222-2222-222222222222',
   '2026-04-20', '14:00', 'Jardim do Morro, Vila Nova de Gaia', 41.1375, -8.6093,
   8, 5, 12,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuCaZN-4WWPz68IO5galEggKHp4npqYWWQaCQuWND3wFUT5fh94ZDX7z3TkginTNzwxxOeXMuavXHhrAWM5VsQu6RJvMIdFr3WHY4voXMzPM6aV3BPE3iWs3O31YvpfD1qtZOaqPkULGeRZ4t9HIOA2YqiF7J1QhigpULIQwLPt1U_RaIv7PywUAyxgHNpPS68Ejqb4kdcPnI2xH7DKg-UeLeb0F9BjpwkVIGCsgJlCapg-vMNrAnHykfwCvPVBQg6Bo5J1gjoDnd-nQ',
   'confirmed', 'Brewing Now', '5 min walk'),
  ('The Butter Nook',
   'Warm sea-salt chocolate chip cookies freshly baked and shared with love.',
   '33333333-3333-3333-3333-333333333333',
   '2026-04-21', '10:00', 'Rua das Flores, Porto', 41.1456, -8.6147,
   6, 4, 8,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuAcfIrFi1NJc9q7EZYfYkdNPvegNehvF1qGbFbd0GikJTMGfmvxpqcCvsTGHpvPSeQE3C5QMHKP4WXHfaMzArXzRX0X3BD3y_Mtsq-A2xxDrOUgQ_aR8TfEJclXemAdJXufRTavx24yG0ZsU3KnXqmLZYHTQULfuKcLbQE4lYFieer8hQe556-lqIDOBQlVWW1Mt1A6vNgdk4Zny54Wx7sw-lq9uXnGrFl5RwlWbhvB03x0MK5uQI4ejQ0RfJROswGmi3XbN4FbYBGg',
   'confirmed', 'Baker''s Choice', '0.4 km away'),
  ('Espresso & Ego',
   'Single origin beans from local roasters. Perfect pour-over demonstration.',
   '11111111-1111-1111-1111-111111111111',
   '2026-04-22', '16:00', 'Majestic Café, Rua Santa Catarina, Porto', 41.1505, -8.6050,
   5, 2, 15,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuBQYfnXmgpdvdDspGQWdRnFrIR8kzlxibwjuF6lk9osfcCD4c62DWPgGSUzg1ma8DRi_ywZl8MYgo614VJGGiULO3EOLRKGQ_l_lpqIIgplyUozICr5CCr87TWK5-AMwGks3_c-BUeiQSaBC95Kq8zIp4ETHvWc0KI4Gbb4Al0Kns671ctnMWx_eqp2AslEJkNh-ZfmAmdV9tyMqvL93LJDGiiUeO061ccNRPlRagB1PEuhP0IYt4_1dXMlhaKX3FvwgpEp8KJ8Ly1f',
   'planning', 'Trending', '1.2 km away'),
  ('Sourdough & Stories Brunch',
   'Share your sourdough starter and hear stories from fellow bread enthusiasts.',
   '11111111-1111-1111-1111-111111111111',
   '2026-04-25', '10:00', 'Mercado do Bolhão, Porto', 41.1530, -8.6070,
   10, 6, 20,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuA3cR--3TpUYLwCDG6AstPxxuERcRfpPDpdfaklG8V3WlqjNjLIrIQuxVjJ6x_lvMRMsw2696ZMSjD_sF6-5EutFld9S2Jv4gwZ5KSLuJzE-ZVmBMYFrCiWDvArv2mDFfw5iExdqL2tlWuQPHJA85ODIv-eWk2W8Ck4WbVIIkblCq8OW45UmEnUQzsAilREBIPDRCjFOZ_myCw1HEK_gHD5vnfxvndjxZGjya8wmx-ooW_lTwqBUKGxPa2vgNESHnA0DpVKL7lzqteb',
   'planning', 'New', '0.8 km away')
on conflict do nothing;

-- Demo past events (attached to Julian)
insert into public.past_events (user_id, title, location, date, image, tag) values
  ('11111111-1111-1111-1111-111111111111', 'The Charred Selection', 'Ribeira, Porto',     'Oct 2023', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnXof_8InVM3DwD02u31Gid2Sz75dbHA-WCAwNUJQKrggGF2bceaRppRrlwXd3sxYY5YUPH4_EgCK1xpTkXJpYS8fk9rdqGuXXxCG2AWr8G-UZPENbuD-pdv9cHtLHIZ4OAir4gufkLAWXbb2ebDFEg4wP-kQ57QG7QJIG-HFBBpmxWFPBwk3x48pvh8EjtCg2FvZ78NiOwdjYdX6MpbVqMy1Tx66sZNyKx2loyBzo5-k5w_pXb1cx8RIGWmufefRXiVRRAB_w5mo', 'Midnight Market'),
  ('11111111-1111-1111-1111-111111111111', 'Aged Comté Pairings',  'Foz do Douro, Porto', 'Sep 2023', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNO49MbcZopFIovg558OEa-29Pfm_DfXREQS-6YKd3vKV9_ZIVrwI15zop6tYfpJoQDGExf7hLphrNfbQ4Sgz5zVCABRolysE-sry9SFqQhPjpKUqx2oZOlD2c2kyXZTpkk1FSevULuldRabfMrfVeoaBTjuLpuV-NwVEYb0PH8YHWk27wCRJHoCZhBgOUZdpWs7Sr4JOi6S0ApIZwltfF1e9DEvdUZ9a-dxW4J8hbLXUWrFoVg9dFTwRWrip0nhjc2_K1R4Ut6tc', null),
  ('11111111-1111-1111-1111-111111111111', 'Zen Morning Whisk',    'Cedofeita, Porto',    'Aug 2023', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHn5XEb5aejP3POZuRV25u4ZITDVpH4DsD_Xl_UKP_vZ1bXDQJ9Zz5O5vA9Vy8tIWj5osQleAWOlT0luji2GOKD4HpqHFomdb3dXTehmhWuQg3Prbo8qet1qIS9bKg_ZwDl_vtHNN7C9Ih9zfuYQON7_Qs4_zVHQUOdzQCPIFRIVMw2EVQpKe3a7v_EgLo4Tk7XWKPrub1LQ3o2fN2cjUuz61YWo7wAIGal9j21kOhn3t8lRb6wsVh44DEeHkBDJgg-AKyvpn43rc', null),
  ('11111111-1111-1111-1111-111111111111', 'Dust & Cacao',         'Boavista, Porto',     'Jul 2023', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrqY8HSkXlSZgE2rtFzYNKOGWAJQC4hKKmFSF8D95gQyAaiTnvCoqK8VkONK7qx8CUtF1MztWaXcS1qvH83pHl8SRyxP5i43FSDLDEYMBbei8sLiWLkV9j4ODH9TRtrsrsyF2npu4kK8iGa6pjL4tua-96Tw2xT9OxXU13Hj9_JUVITFKzLvjZ4R-JDt7YD3U8h59pfQ1NykpRWAevyXHgrYtQ3E1Bydxh6TKYvFmHib95dzJPMVTlsJvcMgbvSLV5N1awaKyz6I8', null);

-- Demo applicants
insert into public.applicants (event_id, user_id, name, avatar, message, status) values
  (1, '22222222-2222-2222-2222-222222222222', 'Aiko Tanaka',     'https://lh3.googleusercontent.com/aida-public/AB6AXuDtVl-lbVHNMZfrPOWbtnGyz-sjM_97XH9Ab_RdvY3L3Ud_l2tJ_WWqi56BtHftKBPhOgSypcGkjvK19Kem9tyUjPo8h0TdYpC19FVH4HFMa5KBsPPx4JbLI7j3nB8cFEJWft56EeIL4VC0LOtTQ49rjH7KkowW6W_gqO8TG1_mWRpGFG7kPe7sFca4Zt0lw_cdcg11Q93JMSwefe3x3JyC2zeJvoJiVRFhKDXRYidTo0_pHbDzFo7JrsGhK2VHXuSJ7lLYuhjce02o', 'I''ve been studying matcha ceremony for two years and would love to learn from a master!', 'pending'),
  (1, '33333333-3333-3333-3333-333333333333', 'Lars Bergström',  'https://lh3.googleusercontent.com/aida-public/AB6AXuAvaBM2KESHMj9arpU6eBTQJMduK09BN7H5EpcsOQTNcRStWjFvNEHuyU4i5lwvkGo6mNofKuNbVmh6dXp_UuJX2NSXkllSHcZpUF9MvCHqJMMsIn2ABRUEkBy1FDvMHHum_e7TYnVUqis5EryL7ahInfem9pVugfKo_FTf7638nkuJwe5s8khHLht7XJ6RrmEzOhCJp4UES98cj-sHxaVVI0OjNjz7_IpF3Cq5_8_l-jPmOFf0MP_VGf-dqB3nRkwlbbgeHxgQdUI_', 'Big fan of artisanal baking – count me in!', 'pending'),
  (2, '22222222-2222-2222-2222-222222222222', 'Priya Nair',      'https://lh3.googleusercontent.com/aida-public/AB6AXuBoyo1wCEEzPVAkcskd-NIoWhASM4Qfd1O1iGFv0x8CUAcQvwMZ7R_qfA4uj0LZ8m7f_w7yWgARVU1RHC42tIeQk6fyGZNQhea6rvg-OZF2A-TTgEaGKuMmd8zk0qribKHou3IKZPTlQ9Q6668VnDwp2JmO-wxEWJWDKygttKTRQwXiQvdjYcZybc0Fx-u_5caZUKV0PfkVeDHF5ZHvlHP48b0e76fjJNDgXSg02XYiFBVoDUIVT9ul9c3sYpM83MnkK6xs95JhxRxn', 'Would love to share some chai-spiced cookies from my kitchen too!', 'pending');
