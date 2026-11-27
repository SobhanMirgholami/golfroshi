-- Golfroshi: tables, security rules, photo bucket and sample bouquets
-- Run once in the Supabase SQL Editor of a NEW project. If your project is already set up, compare instead of rerunning.

-- 1. Tables -----------------------------------------------------------------

-- categories are managed from the admin panel; names in three languages
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


create table public.bouquets (
  id uuid primary key default gen_random_uuid(),
  -- text in three languages: { "tr": "...", "en": "...", "ar": "..." }
  name jsonb not null check (
    length(trim(name->>'tr')) > 0 and length(trim(name->>'en')) > 0 and length(trim(name->>'ar')) > 0
  ),
  description jsonb not null default '{}'::jsonb,
  price integer not null check (price > 0), -- Turkish lira
  category text not null references public.categories (id) on update cascade on delete restrict,
  is_available boolean not null default true,
  image_url text not null check (length(trim(image_url)) > 0),
  image_path text, -- Storage path, used to delete the photo later; null for the bundled sample photos
  created_at timestamptz not null default now()
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 2. Row Level Security -------------------------------------------------------
-- Visitors can read only the bouquets that are available; admins can read and change everything.

alter table public.bouquets enable row level security;
alter table public.admin_users enable row level security;

revoke all on public.bouquets from anon, authenticated;
revoke all on public.admin_users from anon, authenticated;

grant select on public.bouquets to anon, authenticated;
grant insert, update, delete on public.bouquets to authenticated;
grant select on public.admin_users to authenticated;

create policy "Users can read their own admin membership"
on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));

create policy "Anyone can read available bouquets"
on public.bouquets for select to anon, authenticated
using (is_available);

create policy "Administrators can manage bouquets"
on public.bouquets for all to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

-- categories: anyone can read, only admins can change
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

-- 3. Photo bucket ---------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bouquet-images', 'bouquet-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Administrators can manage bouquet images"
on storage.objects for all to authenticated
using (
  bucket_id = 'bouquet-images'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
)
with check (
  bucket_id = 'bouquet-images'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);

-- 4. Sample bouquets (photos are bundled with the site in /public/bouquets) ------

insert into public.bouquets (name, description, price, category, is_available, image_url) values
  ('{"tr":"Pembe Sabah","en":"Blush Morning","ar":"صباح وردي"}'::jsonb, '{"tr":"Pudra pembesi şakayıklar, krem güller ve okaliptüs; aralarında gelin duvağı. Doğum günü ya da “iyi ki varsın” için.","en":"Powder-pink peonies, cream roses and eucalyptus, with a cloud of baby’s breath. For birthdays or a simple “glad you exist”.","ar":"فاوانيا بلون الورد الفاتح وورود كريمية وأوكالبتوس مع سحابة من زهرة أنفاس الطفل. لأعياد الميلاد أو لرسالة «سعيد بوجودك»."}'::jsonb, 1450, 'pastel', true, '/bouquets/blush-morning.webp'),
  ('{"tr":"Kırmızı Mektup","en":"Red Letter","ar":"رسالة حمراء"}'::jsonb, '{"tr":"Koyu kırmızı güller, yaban mersini dalları ve siyah kâğıt. Söylenmesi zor olanı söyler.","en":"Deep red roses with dark berries, wrapped in black paper. Says the thing that’s hard to say.","ar":"ورود حمراء داكنة مع توت داكن، ملفوفة بورق أسود. تقول ما يصعب قوله."}'::jsonb, 1850, 'romantic', true, '/bouquets/red-letter.webp'),
  ('{"tr":"Kır Çiçekleri","en":"Meadow","ar":"مرج"}'::jsonb, '{"tr":"Papatyalar, lavanta ve kır otları, kraft kâğıtta. Bahar sabahı bir tarladan toplanmış gibi.","en":"Daisies, lavender and wild grasses in kraft paper, as if picked from a field on a spring morning.","ar":"أقحوان ولافندر وأعشاب برية في ورق كرافت، كأنها قُطفت من حقل في صباح ربيعي."}'::jsonb, 950, 'wild', true, '/bouquets/meadow.webp'),
  ('{"tr":"Lale Mevsimi","en":"Tulip Season","ar":"موسم التوليب"}'::jsonb, '{"tr":"İstanbul’un çiçeğine selam: kırmızıdan açık pembeye laleler, uzun yeşil yapraklarıyla.","en":"A nod to Istanbul’s own flower: tulips from red to the palest pink, with their long green leaves.","ar":"تحية لزهرة إسطنبول: توليب من الأحمر إلى الوردي الباهت، مع أوراقها الخضراء الطويلة."}'::jsonb, 1200, 'seasonal', true, '/bouquets/tulip-season.webp'),
  ('{"tr":"Fildişi Saat","en":"Ivory Hour","ar":"ساعة العاج"}'::jsonb, '{"tr":"Beyaz güller, düğün çiçekleri ve şakayıklar; okaliptüs ve eğrelti otuyla. Nikâh, nişan ve büyük günler için atölyenin imzası.","en":"White roses, ranunculus and peonies with eucalyptus and fern. The atelier’s signature for weddings, engagements and big days.","ar":"ورود بيضاء وحوذان وفاوانيا مع أوكالبتوس وسرخس. توقيع المشغل للأعراس والخطوبة والأيام الكبيرة."}'::jsonb, 2400, 'luxury', true, '/bouquets/ivory-hour.webp'),
  ('{"tr":"Gün Batımı","en":"Sunset","ar":"غروب"}'::jsonb, '{"tr":"Turuncu ve mercan düğün çiçekleri, sarı tomurcuklar ve koyu yeşil kâğıt. Akşam ışığı gibi sıcak.","en":"Orange and coral ranunculus with yellow buds in dark green paper. Warm like evening light.","ar":"حوذان برتقالي ومرجاني مع براعم صفراء في ورق أخضر داكن. دافئة كضوء المساء."}'::jsonb, 1350, 'seasonal', false, '/bouquets/sunset.webp'),
  ('{"tr":"Leylak Notası","en":"Lilac Note","ar":"نغمة الليلك"}'::jsonb, '{"tr":"Lila şakayıklar, lavanta dalları ve mor düğün çiçekleri. Sakin, zarif ve biraz da nostaljik.","en":"Lilac peonies, lavender stems and purple ranunculus. Calm, elegant and a little nostalgic.","ar":"فاوانيا ليلكية وأغصان لافندر وحوذان بنفسجي. هادئة وأنيقة وفيها شيء من الحنين."}'::jsonb, 1100, 'pastel', true, '/bouquets/lilac-note.webp');

-- 5. Make yourself an admin ---------------------------------------------------
-- Create the account in Authentication > Users, then put its UUID here:
-- insert into public.admin_users (user_id) values ('REPLACE_WITH_AUTH_USER_UUID') on conflict do nothing;
