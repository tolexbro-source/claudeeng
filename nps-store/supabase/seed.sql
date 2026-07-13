-- ===== NPS-Store: ข้อมูลสินค้าตัวอย่าง (ไม่บังคับ) =====
-- รันไฟล์นี้หลัง schema.sql ถ้าอยากมีสินค้าตัวอย่างให้ทดสอบทันที
-- (ของจริงให้แอดมินเพิ่มเองผ่านหน้า Admin Dashboard หลังตั้งค่า is_admin แล้ว)

insert into products (name, category, sizes, price, sale_price, image, is_new) values
  ('NPS Air Runner 01', 'Shoes', array['39','40','41','42'], 4200, 3290, 'https://placehold.co/700x700/ececec/171717.png?text=NPS+Air+Runner+01', true),
  ('NPS Court Classic', 'Shoes', array['38','39','40','41'], 2900, null, 'https://placehold.co/700x700/ececec/171717.png?text=NPS+Court+Classic', false),
  ('NPS Speed Knit', 'Shoes', array['40','41','42'], 3600, 2990, 'https://placehold.co/700x700/ececec/171717.png?text=NPS+Speed+Knit', false),
  ('NPS Trail X', 'Shoes', array['41','42','43','44'], 4800, null, 'https://placehold.co/700x700/ececec/171717.png?text=NPS+Trail+X', true),
  ('NPS Essential Tee', 'Clothing', array['S','M','L','XL'], 890, null, 'https://placehold.co/700x700/ececec/171717.png?text=NPS+Essential+Tee', false),
  ('NPS Tech Hoodie', 'Clothing', array['S','M','L','XL'], 2200, 1790, 'https://placehold.co/700x700/ececec/171717.png?text=NPS+Tech+Hoodie', true),
  ('NPS Running Shorts', 'Clothing', array['S','M','L'], 1100, null, 'https://placehold.co/700x700/ececec/171717.png?text=NPS+Running+Shorts', false),
  ('NPS Windbreaker', 'Clothing', array['M','L','XL'], 2600, null, 'https://placehold.co/700x700/ececec/171717.png?text=NPS+Windbreaker', true);
