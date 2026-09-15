import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySlip } from '@/lib/services/slipok';
import { filterMessage } from '@/lib/services/blacklist';
import { Donation } from '@/lib/types/database';
import { MAX_SLIP_FILE_SIZE_BYTES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const slipFile = formData.get('slip') as File | null;
    const rawName = (formData.get('name') || '').toString().trim();
    const amountStr = formData.get('amount') as string;
    const rawMessage = (formData.get('message') || '').toString().trim();

    if (formData.get('simulate') === 'true') {
      return NextResponse.json(
        { success: false, message: 'ไม่รองรับการจำลองโดเนทผ่านหน้าสาธารณะ' },
        { status: 403 }
      );
    }

    // 1. Input Sanitization & Validation
    const name = rawName ? rawName.slice(0, 50) : 'ผู้สนับสนุนนิรนาม';
    const cleanMessage = await filterMessage(rawMessage.slice(0, 200));

    const expectedAmount = parseFloat(amountStr);
    if (isNaN(expectedAmount) || expectedAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'ยอดเงินไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // 2. Check minimum donation setting
    try {
      const { data: minSet } = await supabaseAdmin
        .from('settings')
        .select('value')
        .eq('key', 'min_donate')
        .single();
      const minVal = parseFloat(minSet?.value) || 1;
      if (expectedAmount < minVal) {
        return NextResponse.json(
          { success: false, message: `ยอดเงินขั้นต่ำในการโดเนทคือ ${minVal} บาท` },
          { status: 400 }
        );
      }
    } catch (e) {}

    let verifiedData: {
      verified: boolean;
      transRef: string;
      amount: number;
      senderName: string;
      senderBank: string;
      receiverName: string;
      transDate?: string;
    };

    // 3. Require a real slip before creating a verified donation.
    if (!slipFile) {
      return NextResponse.json(
        { success: false, message: 'กรุณาอัปโหลดรูปภาพสลิป' },
        { status: 400 }
      );
    }

    // 4. File Security Checks (MIME type & Size limit)
    if (slipFile.size > MAX_SLIP_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: 'ขนาดไฟล์ภาพสลิปต้องไม่เกิน 4MB' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(slipFile.type)) {
      return NextResponse.json(
        { success: false, message: 'รูปแบบไฟล์ไม่ถูกต้อง รองรับเฉพาะ JPG, PNG, WEBP' },
        { status: 400 }
      );
    }

    const arrayBuffer = await slipFile.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    try {
      verifiedData = await verifySlip({
        fileBuffer,
        fileName: slipFile.name || 'slip.jpg',
        mimeType: slipFile.type || 'image/jpeg',
        expectedAmount
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, message: err.message || 'การตรวจสอบสลิปล้มเหลว', code: err.code },
        { status: 400 }
      );
    }

    // 5. Insert into Supabase donations table
    const donationRecord: Donation = {
      name,
      amount: verifiedData.amount,
      message: cleanMessage,
      transaction_ref: verifiedData.transRef,
      sender_name: verifiedData.senderName,
      sender_bank: verifiedData.senderBank,
      receiver_name: verifiedData.receiverName,
      transaction_date: verifiedData.transDate || new Date().toISOString(),
      status: 'verified'
    };

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('donations')
      .insert([donationRecord])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + insertError.message },
        { status: 500 }
      );
    }

    // 6. Broadcast event to Supabase Realtime channel for instant OBS alert
    const channel = supabaseAdmin.channel('donation-alerts');
    try {
      await channel.httpSend('donation', {
        id: inserted.id,
        name: inserted.name,
        amount: inserted.amount,
        message: inserted.message
      });
    } catch (realtimeErr: any) {
      console.warn('Realtime broadcast warning:', realtimeErr.message);
    } finally {
      await supabaseAdmin.removeChannel(channel).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'การโดเนทสำเร็จและส่งการแจ้งเตือนขึ้นจอแล้ว!',
      data: inserted
    });
  } catch (err: any) {
    console.error('Verify slip fatal error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'เกิดข้อผิดพลาดของระบบ' },
      { status: 500 }
    );
  }
}
