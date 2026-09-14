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
 * @param customPromptpayId - Optional promptpay ID override
 */
export async function generatePromptPayQR(
  amount: number | string,
  customPromptpayId: string | null = null
): Promise<PromptPayResult> {
  let promptpayId = customPromptpayId;

  if (!promptpayId) {
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
  }

  // Fallback to env
  if (!promptpayId) {
    promptpayId = process.env.PROMPTPAY_ID || '0649520055';
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
