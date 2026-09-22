-- ============================================================
-- KOL Radar — Seed ข้อมูลตัวอย่าง (ทางเลือก)
-- ------------------------------------------------------------
-- แนะนำ: ใช้ปุ่ม "โหลดข้อมูลตัวอย่าง" ในแอปแทน จะง่ายกว่า
--        เพราะมันผูก owner_id ให้อัตโนมัติกับ user ที่ล็อกอิน
--
-- ถ้าจะ seed ผ่าน SQL Editor เอง: SQL Editor รันในสิทธิ์ postgres
-- ทำให้ auth.uid() = null คุณจึงต้องใส่ user id ของคุณเองแทน
--   1) สมัคร/ล็อกอินในแอป 1 ครั้ง
--   2) Dashboard > Authentication > Users > คัดลอก UID ของคุณ
--   3) แทนที่ <YOUR_USER_ID> ด้านล่างด้วย UID นั้น แล้ว Run
-- ============================================================

-- \set owner '<YOUR_USER_ID>'

insert into public.kols
  (owner_id, name, handle, category, tier, platforms, followers, engagement_rate, avg_views, rate_per_post, status, roi, growth)
values
  ('<YOUR_USER_ID>','ญาญ่า บิวตี้','@yaya.beauty','ความงาม','macro','{ig,tiktok,yt}',2400000,6.8,850000,120000,'active',4.2,8.4),
  ('<YOUR_USER_ID>','พี่จอง Tech','@jong.tech','เทคโนโลยี','mid','{yt,fb,x}',680000,5.1,210000,55000,'active',3.6,5.2),
  ('<YOUR_USER_ID>','หมูอ้วนกินทุกอย่าง','@moowin.eat','อาหาร','macro','{tiktok,ig,fb}',1800000,9.2,1200000,95000,'active',5.1,12.1),
  ('<YOUR_USER_ID>','Nina Fashionista','@ninastyle','แฟชั่น','mid','{ig,tiktok}',540000,4.3,180000,48000,'pending',2.9,-1.4),
  ('<YOUR_USER_ID>','เกมเมอร์ต้น','@ton.gaming','เกม','mega','{yt,tiktok,fb}',5200000,3.9,2100000,280000,'active',3.1,6.7),
  ('<YOUR_USER_ID>','มินิมอลลิสต์เมย์','@may.minimal','ไลฟ์สไตล์','micro','{ig,x}',98000,8.7,34000,12000,'active',6.3,15.3);

-- หมายเหตุ: ปุ่มในแอปจะใส่ครบ 12 KOL + 6 แคมเปญ พร้อมผูกความสัมพันธ์ให้
