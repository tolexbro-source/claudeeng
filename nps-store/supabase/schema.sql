-- ===== NPS-Store: Supabase Schema =====
-- วิธีใช้: Supabase Dashboard > SQL Editor > New query > วางไฟล์นี้ทั้งหมด > Run
-- รันซ้ำได้ปลอดภัย (ใช้ IF NOT EXISTS / OR REPLACE / DROP...CREATE ทุกจุด)

create extension if not exists "pgcrypto";

-- ===== ตารางสินค้า =====
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('Shoes', 'Clothing')),
  sizes text[] not null default '{}',
  price numeric not null,
  sale_price numeric,
  image text,
  is_new boolean not null default false,
  created_at timestamptz not null default now()
);

-- ===== ตารางคำสั่งซื้อ =====
create table if not exists orders (
  id text primary key,
  customer_name text not null,
  customer_address text not null,
  customer_phone text not null,
  customer_email text not null,
  payment text not null check (payment in ('transfer', 'cod')),
  items jsonb not null,
  total numeric not null,
  user_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ===== โปรไฟล์ผู้ใช้ (ชื่อ + สิทธิ์แอดมิน) — 1 แถวต่อ 1 บัญชีใน auth.users =====
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- สร้างแถว profiles อัตโนมัติทุกครั้งที่มีผู้ใช้สมัครใหม่ (Email/Password หรือ Facebook)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ป้องกันไม่ให้ผู้ใช้ทั่วไปแก้ is_admin ของตัวเอง (ต่อให้ยิง update ตรงๆ ผ่าน anon key ก็เปลี่ยนไม่ได้)
-- ต้องการตั้งใครเป็นแอดมิน ให้ไปแก้ค่า is_admin ที่ Dashboard > Table Editor > profiles โดยตรงเท่านั้น
create or replace function public.protect_is_admin()
returns trigger as $$
begin
  if new.is_admin is distinct from old.is_admin then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists protect_is_admin_trigger on profiles;
create trigger protect_is_admin_trigger
  before update on profiles
  for each row execute procedure public.protect_is_admin();

-- ===== Row Level Security =====
alter table products enable row level security;
alter table orders enable row level security;
alter table profiles enable row level security;

drop policy if exists "products_public_read" on products;
create policy "products_public_read" on products for select using (true);

drop policy if exists "products_admin_write" on products;
create policy "products_admin_write" on products for insert with check (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

drop policy if exists "products_admin_update" on products;
create policy "products_admin_update" on products for update using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

drop policy if exists "products_admin_delete" on products;
create policy "products_admin_delete" on products for delete using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- ออเดอร์: ใครก็สั่งซื้อได้ (รองรับลูกค้าที่ไม่ได้ล็อกอิน/Guest checkout)
drop policy if exists "orders_anyone_insert" on orders;
create policy "orders_anyone_insert" on orders for insert with check (true);

-- อ่านออเดอร์ได้เฉพาะแอดมิน หรือเจ้าของออเดอร์ (ถ้าล็อกอินตอนสั่งซื้อ)
drop policy if exists "orders_admin_or_owner_read" on orders;
create policy "orders_admin_or_owner_read" on orders for select using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  or user_id = auth.uid()
);

-- เปิด Supabase Realtime ให้ตาราง orders — จำเป็นเพราะเว็บลูกค้า (nps-store) กับแอปแอดมิน
-- (nps-store-admin) แยกเป็นคนละแอปคนละเครื่องแล้ว แอดมินจึงต้องรับแจ้งเตือนออเดอร์ใหม่ผ่าน
-- Realtime แทนการอัปเดต state ในโปรเซสเดียวกันแบบเดิม (ดู OrderToast.jsx ในฝั่งแอดมิน)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table orders;
  end if;
end $$;

drop policy if exists "profiles_read_own" on profiles;
create policy "profiles_read_own" on profiles for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- ===== Storage bucket สำหรับรูปสินค้า =====
-- 1. ไปที่ Dashboard > Storage > New bucket > ตั้งชื่อ "product-images" > เปิด Public bucket
-- 2. กลับมารันคำสั่งด้านล่างนี้ต่อใน SQL Editor
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects for select using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_upload" on storage.objects;
create policy "product_images_admin_upload" on storage.objects for insert with check (
  bucket_id = 'product-images'
  and exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- ===== วิธีตั้งบัญชีแรกให้เป็นแอดมิน =====
-- 1. สมัครสมาชิกตามปกติผ่านหน้าเว็บ (ปุ่ม "เข้าสู่ระบบ" > "สมัครสมาชิก")
-- 2. ไปที่ Dashboard > Table Editor > profiles > หาแถวที่อีเมลตรงกับบัญชีที่สมัคร
-- 3. แก้คอลัมน์ is_admin เป็น true แล้ว Save
-- 4. กลับไปล็อกอินใหม่ที่หน้าเว็บ (หรือรีเฟรช) จะเข้าหน้า Admin Dashboard ได้ทันที
