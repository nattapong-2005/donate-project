# Donate Project

ระบบรับโดเนท PromptPay และแสดงแจ้งเตือนบน OBS สร้างด้วย Next.js, TypeScript และ Supabase

## เริ่มใช้งาน

1. ติดตั้งแพ็กเกจด้วย `npm install`
2. คัดลอก `.env.example` เป็น `.env.local` แล้วกรอกค่า Supabase, SlipOK และ `ADMIN_SECRET` ของคุณ
3. รัน `npm run dev` แล้วเปิด `http://localhost:3000`

หน้าใช้งานหลัก: `/donate` สำหรับผู้สนับสนุน, `/overlay` สำหรับ OBS Browser Source, `/admin` สำหรับจัดการระบบ และ `/customizer` สำหรับปรับแต่งแจ้งเตือนพร้อม Live Preview

การตั้งค่าและข้อมูลโดเนทเก็บใน Supabase; สร้างตารางผู้ใช้ด้วย `supabase/migrations/create_users_table.sql` เมื่อใช้ระบบบัญชีผู้ดูแล

## ตรวจสอบก่อนใช้งานจริง

รัน `npm run type-check` และ `npm run build` เพื่อตรวจ TypeScript และ production build

เก็บ `.env.local` และ `supabase.txt` ไว้เฉพาะในเครื่อง ห้ามนำ service role key ขึ้น Git
