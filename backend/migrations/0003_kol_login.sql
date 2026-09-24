-- ============================================================
-- KOL Radar — ให้ KOL login ด้วย email/password + เห็นข้อมูลตัวเอง
-- วิธีใช้: Supabase Dashboard > SQL Editor > New query > วางทั้งหมด > Run
-- ============================================================

-- ---------- ผูกบัญชี auth กับแถว KOL ----------
alter table public.kols
  add column if not exists account_id uuid references auth.users(id) on delete set null;
create index if not exists idx_kols_account on public.kols(account_id);

-- ---------- อนุญาต role 'kol' ในตาราง profiles ----------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('admin','super_admin','kol'));

-- ---------- RLS: KOL อ่าน/แก้ไข "โปรไฟล์ของตัวเอง" ----------
drop policy if exists kols_self_read on public.kols;
create policy kols_self_read on public.kols
  for select using (account_id = auth.uid());

drop policy if exists kols_self_update on public.kols;
create policy kols_self_update on public.kols
  for update using (account_id = auth.uid()) with check (account_id = auth.uid());

-- ---------- RLS: KOL อ่าน/ส่ง "ข้อความของตัวเอง" ----------
drop policy if exists messages_kol_read on public.messages;
create policy messages_kol_read on public.messages
  for select using (
    kol_id in (select id from public.kols where account_id = auth.uid())
  );

drop policy if exists messages_kol_insert on public.messages;
create policy messages_kol_insert on public.messages
  for insert with check (
    sender = 'kol'
    and kol_id in (select id from public.kols where account_id = auth.uid())
  );

-- ---------- RLS: KOL เห็นแคมเปญที่ตัวเองร่วม ----------
drop policy if exists ck_kol_read on public.campaign_kols;
create policy ck_kol_read on public.campaign_kols
  for select using (
    kol_id in (select id from public.kols where account_id = auth.uid())
  );

drop policy if exists campaigns_kol_read on public.campaigns;
create policy campaigns_kol_read on public.campaigns
  for select using (
    id in (
      select campaign_id from public.campaign_kols
      where kol_id in (select id from public.kols where account_id = auth.uid())
    )
  );
