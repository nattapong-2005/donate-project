import { NextResponse } from 'next/server';
import { generatePromptPayQR } from '@/lib/services/promptpay';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, promptpayId } = body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'ยอดเงินไม่ถูกต้อง กรุณาระบุยอดเงินมากกว่า 0 บาท' },
        { status: 400 }
      );
    }

    // Security: Limit single transaction maximum amount to prevent overflow
    if (parsedAmount > 1000000) {
      return NextResponse.json(
        { success: false, message: 'ยอดเงินเกินจำนวนที่ระบบกำหนด (ไม่เกิน 1,000,000 บาท)' },
        { status: 400 }
      );
    }

    const qrResult = await generatePromptPayQR(parsedAmount, promptpayId);

    return NextResponse.json({
      success: true,
      data: qrResult
    });
  } catch (err: any) {
    console.error('Error generating QR:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'เกิดข้อผิดพลาดในการสร้าง QR Code' },
      { status: 500 }
    );
  }
}
