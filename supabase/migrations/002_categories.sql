-- Golfroshi: categories managed from the admin panel
-- Run once on a database that was set up with schema.sql (before this change).

-- 1. Categories table, names in three languages -------------------------------

create table public.categories (
  id text primary key check (id ~ '^[a-z0-9-]{1,40}$'),
  name jsonb not null check (
    length(trim(name->>'tr')) > 0 and length(trim(name->>'en')) > 0 and length(trim(name->>'ar')) > 0
  ),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.categories (id, name, position) values
  ('romantic', '{"tr":"Romantik","en":"Romantic","ar":"رومانسية"}', 1),
  ('pastel',   '{"tr":"Pastel","en":"Pastel","ar":"ألوان هادئة"}', 2),
  ('wild',     '{"tr":"Kır ve bahçe","en":"Wild & garden","ar":"برية وحدائق"}', 3),
  ('seasonal', '{"tr":"Mevsimlik","en":"Seasonal","ar":"موسمية"}', 4),
  ('luxury',   '{"tr":"İmza","en":"Signature","ar":"توقيع المشغل"}', 5)
on conflict (id) do nothing;

-- 2. Bouquets point at a category; a category in use can't be deleted ---------

alter table public.bouquets drop constraint if exists bouquets_category_check;
alter table public.bouquets
  add constraint bouquets_category_fkey foreign key (category)
  references public.categories (id) on update cascade on delete restrict;
create index if not exists bouquets_category_idx on public.bouquets (category);

-- 3. Security: anyone can read categories, only admins can change them --------

alter table public.categories enable row level security;
revoke all on public.categories from anon, authenticated;
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

create policy "Anyone can read categories"
on public.categories for select to anon, authenticated
using (true);

create policy "Administrators can manage categories"
on public.categories for all to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
