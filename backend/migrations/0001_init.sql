-- ============================================================
-- KOL Radar — Database schema + Row Level Security
-- วิธีใช้: เปิด Supabase Dashboard > SQL Editor > New query
--          วางไฟล์นี้ทั้งหมดแล้วกด Run
-- ============================================================

-- ---------- Enums ----------
do $$ begin
  create type kol_tier as enum ('nano','micro','mid','macro','mega');
exception when duplicate_object then null; end $$;

do $$ begin
  create type kol_status as enum ('active','pending','paused');
exception when duplicate_object then null; end $$;

do $$ begin
  create type campaign_stage as enum ('planning','active','review','done');
exception when duplicate_object then null; end $$;

do $$ begin
  create type platform as enum ('tiktok','ig','yt','fb','x');
exception when duplicate_object then null; end $$;

-- ---------- Table: kols ----------
create table if not exists public.kols (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name            text not null,
  handle          text not null,
  category        text not null default '',
  tier            kol_tier not null default 'micro',
  platforms       platform[] not null default '{}',
  followers       bigint not null default 0,
  engagement_rate numeric(5,2) not null default 0,
  avg_views       bigint not null default 0,
  rate_per_post   integer not null default 0,
  status          kol_status not null default 'active',
  roi             numeric(5,2) not null default 0,
  growth          numeric(5,2) not null default 0,
  contact         text not null default '',
  line_id         text not null default '',
  -- LINE userId (ขึ้นต้น U...) ได้จาก webhook เมื่อ KOL แอด/ทัก OA — ใช้สำหรับ push
  line_user_id    text,
  -- comp card / media kit: โหมด Local เก็บเป็น data URL (base64)
  -- โปรดักชันจริงควรอัปโหลดขึ้น Supabase Storage แล้วเก็บเป็น URL แทน
  compcard        text,
  created_at      timestamptz not null default now()
);

-- ---------- Table: campaigns ----------
create table if not exists public.campaigns (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name         text not null,
  brand        text not null default '',
  stage        campaign_stage not null default 'planning',
  budget       integer not null default 0,
  spent        integer not null default 0,
  reach        bigint not null default 0,
  conversions  integer not null default 0,
  start_date   date,
  end_date     date,
  created_at   timestamptz not null default now()
);

-- ---------- Table: campaign_kols (join) ----------
create table if not exists public.campaign_kols (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  kol_id      uuid not null references public.kols(id) on delete cascade,
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  primary key (campaign_id, kol_id)
);

-- ---------- Table: messages (แชท 1-1 ทีม <-> KOL) ----------
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kol_id      uuid not null references public.kols(id) on delete cascade,
  sender      text not null check (sender in ('team','kol')),
  text        text not null,
  via_line    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------- Indexes ----------
create index if not exists idx_kols_owner      on public.kols(owner_id);
create index if not exists idx_messages_kol    on public.messages(kol_id, created_at);
create index if not exists idx_campaigns_owner on public.campaigns(owner_id);
create index if not exists idx_ck_owner        on public.campaign_kols(owner_id);
create index if not exists idx_ck_campaign     on public.campaign_kols(campaign_id);

-- ---------- Row Level Security ----------
alter table public.kols          enable row level security;
alter table public.campaigns     enable row level security;
alter table public.campaign_kols enable row level security;
alter table public.messages      enable row level security;

-- ผู้ใช้เห็น/เพิ่ม/แก้/ลบ ได้เฉพาะข้อมูลของตัวเอง (owner_id = auth.uid())
drop policy if exists kols_owner_all on public.kols;
create policy kols_owner_all on public.kols
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists campaigns_owner_all on public.campaigns;
create policy campaigns_owner_all on public.campaigns
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists ck_owner_all on public.campaign_kols;
create policy ck_owner_all on public.campaign_kols
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists messages_owner_all on public.messages;
create policy messages_owner_all on public.messages
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
-- หมายเหตุ: ให้ KOL แชทได้จริงในโหมด Supabase ต้องผูกบัญชี KOL (account_id ใน kols)
-- แล้วเพิ่ม policy ให้ฝั่ง KOL อ่าน/ส่งข้อความของตัวเองได้ + เปิด Realtime บนตาราง messages
