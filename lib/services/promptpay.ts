import promptpayQR from 'promptpay-qr';
import QRCode from 'qrcode';
import { supabaseAdmin } from '../supabaseAdmin';

export interface PromptPayResult {
  payload: string;
  qrDataUrl: string;
  qrImage?: string;
  promptpayId: string;
  amount: number;
}

/**
 * Generate PromptPay QR Code Payload & DataURL
 * @param amount - Amount in THB
 */
export async function generatePromptPayQR(
  amount: number | string
): Promise<PromptPayResult> {
  let promptpayId: string | null = null;

  try {
    const { data } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'promptpay_id')
      .single();
    if (data && data.value) {
      promptpayId = data.value;
    }
  } catch (e: any) {
    console.warn('Could not fetch promptpay_id from Supabase:', e.message);
  }

  // Fallback to env
  if (!promptpayId) {
    promptpayId = process.env.PROMPTPAY_ID || null;
  }
  if (!promptpayId) {
    throw new Error('กรุณาตั้งค่าหมายเลขพร้อมเพย์ก่อนสร้าง QR');
  }

  const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Invalid amount for PromptPay QR');
  }

  // Generate standard PromptPay EMVCo payload
  const payload = promptpayQR(promptpayId, { amount: parsedAmount });

  // Generate QR image as Data URL
  const qrDataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    margin: 2,
    width: 320,
    color: {
      dark: '#002D62', // Thai PromptPay Navy Blue
      light: '#FFFFFF'
    }
  });

  return {
    payload,
    qrDataUrl,
    qrImage: qrDataUrl,
    promptpayId,
    amount: parsedAmount
  };
}
