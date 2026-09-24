-- ============================================================
-- KOL Radar — เพิ่มระบบสิทธิ์ (admin / super_admin) + เปิด Realtime แชท
-- วิธีใช้: Supabase Dashboard > SQL Editor > New query > วางทั้งหมด > Run
-- ============================================================

-- ---------- ตาราง profiles (เก็บ role ของผู้ใช้ทีม) ----------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  role       text not null default 'admin' check (role in ('admin','super_admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ผู้ใช้อ่าน profile ของตัวเองได้ (ไม่ให้แก้ role เองกันสิทธิ์รั่ว)
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select using (auth.uid() = id);

-- ---------- สร้าง profile อัตโนมัติเมื่อมีคนสมัครใหม่ (ดีฟอลต์ = admin) ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Backfill: ผู้ใช้เดิม (เจ้าของระบบ) → super_admin ----------
-- คนที่มีอยู่แล้วตอนนี้จะได้เป็น super_admin, คนสมัครใหม่ทีหลังเป็น admin
insert into public.profiles (id, email, role)
select id, email, 'super_admin' from auth.users
on conflict (id) do nothing;

-- ---------- เปิด Realtime บนตาราง messages (สำหรับแชทเรียลไทม์) ----------
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;
