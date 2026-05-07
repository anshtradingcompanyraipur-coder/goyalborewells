create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  id text primary key default 'main',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  icon text,
  image text,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  category text,
  sku text,
  moq text,
  material text,
  price_type text,
  rate text,
  unit text,
  image text,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalogues (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  type text,
  link text,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  category text,
  image text,
  caption text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id text primary key default gen_random_uuid()::text,
  company text,
  name text,
  mobile text,
  email text,
  city text,
  state text,
  district text,
  business text,
  category text,
  quantity text,
  message text,
  status text not null default 'New',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at before update on public.products for each row execute function public.set_updated_at();

drop trigger if exists set_catalogues_updated_at on public.catalogues;
create trigger set_catalogues_updated_at before update on public.catalogues for each row execute function public.set_updated_at();

drop trigger if exists set_gallery_updated_at on public.gallery;
create trigger set_gallery_updated_at before update on public.gallery for each row execute function public.set_updated_at();

drop trigger if exists set_enquiries_updated_at on public.enquiries;
create trigger set_enquiries_updated_at before update on public.enquiries for each row execute function public.set_updated_at();


alter table public.products add column if not exists rate text;
alter table public.products add column if not exists unit text;
alter table public.products add column if not exists image text;
alter table public.gallery add column if not exists image text;

insert into storage.buckets (id, name, public)
values ('gb-media', 'gb-media', true)
on conflict (id) do update set public = true;

drop policy if exists gb_media_public_read on storage.objects;
create policy gb_media_public_read on storage.objects
for select using (bucket_id = 'gb-media');

drop policy if exists gb_media_admin_insert on storage.objects;
create policy gb_media_admin_insert on storage.objects
for insert with check (bucket_id = 'gb-media' and auth.role() = 'authenticated');

drop policy if exists gb_media_admin_update on storage.objects;
create policy gb_media_admin_update on storage.objects
for update using (bucket_id = 'gb-media' and auth.role() = 'authenticated')
with check (bucket_id = 'gb-media' and auth.role() = 'authenticated');

drop policy if exists gb_media_admin_delete on storage.objects;
create policy gb_media_admin_delete on storage.objects
for delete using (bucket_id = 'gb-media' and auth.role() = 'authenticated');

alter table public.site_settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.catalogues enable row level security;
alter table public.gallery enable row level security;
alter table public.enquiries enable row level security;

drop policy if exists site_settings_public_select on public.site_settings;
create policy site_settings_public_select on public.site_settings for select using (true);

drop policy if exists site_settings_admin_all on public.site_settings;
create policy site_settings_admin_all on public.site_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists categories_public_select on public.categories;
create policy categories_public_select on public.categories for select using (is_active = true or auth.role() = 'authenticated');

drop policy if exists categories_admin_all on public.categories;
create policy categories_admin_all on public.categories for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists products_public_select on public.products;
create policy products_public_select on public.products for select using (is_active = true or auth.role() = 'authenticated');

drop policy if exists products_admin_all on public.products;
create policy products_admin_all on public.products for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists catalogues_public_select on public.catalogues;
create policy catalogues_public_select on public.catalogues for select using (is_active = true or auth.role() = 'authenticated');

drop policy if exists catalogues_admin_all on public.catalogues;
create policy catalogues_admin_all on public.catalogues for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists gallery_public_select on public.gallery;
create policy gallery_public_select on public.gallery for select using (is_active = true or auth.role() = 'authenticated');

drop policy if exists gallery_admin_all on public.gallery;
create policy gallery_admin_all on public.gallery for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists enquiries_public_insert on public.enquiries;
create policy enquiries_public_insert on public.enquiries for insert with check (true);

drop policy if exists enquiries_admin_all on public.enquiries;
create policy enquiries_admin_all on public.enquiries for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');


alter table public.categories add column if not exists image text;
