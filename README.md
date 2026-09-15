# Donate Project

ระบบรับโดเนท PromptPay และแสดงแจ้งเตือนบน OBS สร้างด้วย Next.js, TypeScript และ Supabase

## เริ่มใช้งาน

1. ติดตั้งแพ็กเกจด้วย `npm install`
2. คัดลอก `.env.example` เป็น `.env.local` แล้วกรอกค่า Supabase, SlipOK และ `ADMIN_SECRET` ของคุณ
3. รัน `npm run dev` แล้วเปิด `http://localhost:3000`

หน้าใช้งานหลัก: `/donate` สำหรับผู้สนับสนุน, `/overlay` สำหรับ OBS Browser Source, `/admin` สำหรับจัดการระบบ และ `/customizer` สำหรับปรับแต่งแจ้งเตือนพร้อม Live Preview

การตั้งค่าและข้อมูลโดเนทเก็บใน Supabase; รัน `supabase/migrations/20260915_core_tables.sql` และ `supabase/migrations/create_users_table.sql` ใน SQL Editor ของโปรเจกต์ Supabase ก่อนใช้งาน

## Deploy บน Vercel

1. เชื่อม repository กับ Vercel โดยเลือก Next.js และใช้คำสั่ง build `npm run build`
2. ตั้ง environment variables ตาม `.env.example` ใน Vercel Project Settings สำหรับ Production โดยใช้ค่าจริงจาก Supabase, SlipOK และบัญชี PromptPay ของคุณ ตั้ง `ADMIN_SECRET` เป็นข้อความสุ่มที่เดายาก และกำหนด `RECEIVER_NAME` หรือ `RECEIVER_ACCOUNT` อย่างน้อยหนึ่งค่า
3. รัน SQL migrations ข้างต้นใน Supabase ก่อนเปิดเว็บ แล้วตรวจว่าเลข PromptPay ใน QR และชื่อหรือเลขบัญชีผู้รับตรงกับบัญชีจริง
4. ทดสอบโดเนทด้วยสลิปจริงหนึ่งรายการและตรวจว่าแจ้งเตือนขึ้น `/overlay` ใน OBS; ปุ่ม Test Alert สำหรับทดสอบโดยไม่โอนเงินจริงอยู่ในหน้า `/admin`

สลิปขนาดสูงสุด 4 MB เพื่อไม่ให้เกินขีดจำกัด request body ของ Vercel Functions ระบบส่งแจ้งเตือนผ่าน Supabase Realtime private channel โดยใช้ service role key เฉพาะฝั่งเซิร์ฟเวอร์

## ตรวจสอบก่อนใช้งานจริง

รัน `npm run type-check` และ `npm run build` เพื่อตรวจ TypeScript และ production build

เก็บ `.env.local` และ `supabase.txt` ไว้เฉพาะในเครื่อง ห้ามนำ service role key ขึ้น Git
