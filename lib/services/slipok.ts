import axios from 'axios';
import FormData from 'form-data';
import { supabaseAdmin } from '../supabaseAdmin';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export const ERROR_CODE_MESSAGES: Record<number, string> = {
  1000: 'กรุณาอัปโหลดรูปภาพสลิปให้ถูกต้อง',
  1001: 'ไม่พบข้อมูลสาขา SlipOK กรุณาตรวจสอบ Branch ID',
  1002: 'API Key ของ SlipOK ไม่ถูกต้อง',
  1003: 'แพ็กเกจ SlipOK หมดอายุแล้ว กรุณาต่ออายุแพ็กเกจ',
  1004: 'โควต้าสลิปของคุณหมดแล้ว กรุณาเติมโควต้า',
  1005: 'ประเภทไฟล์ไม่ถูกต้อง (รองรับเฉพาะ JPG, PNG, WEBP)',
  1006: 'รูปภาพไม่ถูกต้องหรือไม่สมบูรณ์',
  1007: 'ไม่พบ QR Code ในรูปภาพสลิป กรุณาอัปโหลดรูปสลิปที่มี QR ชัดเจน',
  1008: 'QR Code ในภาพไม่ใช่ QR Code สำหรับตรวจสอบสลิปธนาคาร',
  1009: 'ระบบธนาคารขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้งใน 10-15 นาที',
  1010: 'กรุณารอตรวจสอบสลิปหลังจากการโอนประมาณ 1-2 นาที',
  1011: 'QR Code หมดอายุ หรือไม่พบข้อมูลรายการโอนนี้ในระบบธนาคาร',
  1012: 'สลิปนี้เคยถูกส่งเข้าสู่ระบบแล้ว (สลิปซ้ำ)',
  1013: 'ยอดเงินในสลิปไม่ตรงกับยอดที่ระบุ',
  1014: 'บัญชีผู้รับเงินไม่ตรงกับบัญชีของร้านค้า',
  1015: 'ไม่พบข้อมูลแพ็กเกจ SlipOK'
};

async function getSettingValue(key: string, fallback: string = ''): Promise<string> {
  try {
    const { data } = await supabaseAdmin.from('settings').select('value').eq('key', key).single();
    if (data && data.value) return data.value;
  } catch (e) {}
  return fallback;
}

export async function checkQuota(): Promise<any> {
  const branchId = await getSettingValue('slipok_branch_id', process.env.SLIPOK_BRANCH_ID || '');
  const apiKey = await getSettingValue('slipok_api_key', process.env.SLIPOK_API_KEY || '');

  if (!branchId || !apiKey) {
    throw new Error('SlipOK credentials not configured');
  }

  const url = `https://api.slipok.com/api/line/apikey/${branchId}/quota`;
  const response = await axios.get(url, {
    headers: {
      'x-authorization': apiKey,
      'User-Agent': USER_AGENT
    },
    timeout: 10000
  });

  return response.data;
}

export interface VerifySlipParams {
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  expectedAmount: number | string;
  log?: boolean;
}

export interface VerifiedSlipResult {
  verified: boolean;
  transRef: string;
  amount: number;
  senderName: string;
  senderBank: string;
  receiverName: string;
  transDate?: string;
  transTime?: string;
  raw?: any;
}

export async function verifySlip({
  fileBuffer,
  fileName,
  mimeType,
  expectedAmount,
  log = false
}: VerifySlipParams): Promise<VerifiedSlipResult> {
  const branchId = await getSettingValue('slipok_branch_id', process.env.SLIPOK_BRANCH_ID || '');
  const apiKey = await getSettingValue('slipok_api_key', process.env.SLIPOK_API_KEY || '');

  if (!branchId || !apiKey) {
    throw new Error('SlipOK credentials not configured');
  }

  const formData = new FormData();
  formData.append('files', fileBuffer, {
    filename: fileName || 'slip.jpg',
    contentType: mimeType || 'image/jpeg'
  });

  if (expectedAmount) {
    formData.append('amount', Number(expectedAmount));
  }
  formData.append('log', log ? 'true' : 'false');

  const url = `https://api.slipok.com/api/line/apikey/${branchId}`;

  let apiResponse: any;
  try {
    const res = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        'x-authorization': apiKey,
        'User-Agent': USER_AGENT
      },
      timeout: 25000
    });
    apiResponse = res.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      const errData = error.response.data;
      const code: number = errData.code;
      const friendlyMsg = ERROR_CODE_MESSAGES[code] || errData.message || 'การตรวจสอบสลิปล้มเหลว';
      const customErr: any = new Error(friendlyMsg);
      customErr.code = code;
      customErr.details = errData;
      throw customErr;
    }
    throw new Error(`ไม่สามารถเชื่อมต่อ SlipOK API ได้: ${error.message}`);
  }

  if (!apiResponse || !apiResponse.success || !apiResponse.data) {
    const msg = apiResponse?.message || 'สลิปไม่ถูกต้อง';
    throw new Error(msg);
  }

  const slipData = apiResponse.data;

  // 1. Check duplicate via transRef in Supabase
  const transRef: string = slipData.transRef;
  if (!transRef) {
    throw new Error('ไม่พบรหัสอ้างอิงธุรกรรม (Transaction Ref) ในสลิป');
  }

  const { data: existingDonation } = await supabaseAdmin
    .from('donations')
    .select('id, created_at')
    .eq('transaction_ref', transRef)
    .maybeSingle();

  if (existingDonation) {
    const err: any = new Error(`สลิปนี้ถูกใช้งานไปแล้วเมื่อ ${existingDonation.created_at || 'ก่อนหน้านี้'}`);
    err.code = 1012;
    throw err;
  }

  // 2. Check Amount
  const slipAmount = parseFloat(slipData.amount);
  const targetAmount = typeof expectedAmount === 'number' ? expectedAmount : parseFloat(expectedAmount);
  if (!isNaN(targetAmount) && targetAmount > 0) {
    if (Math.abs(slipAmount - targetAmount) > 0.001) {
      const err: any = new Error(`ยอดเงินในสลิป (${slipAmount} บาท) ไม่ตรงกับยอดที่ต้องชำระ (${targetAmount} บาท)`);
      err.code = 1013;
      throw err;
    }
  }

  // 3. Check Receiver
  const expectedReceiverName = await getSettingValue('receiver_name', process.env.RECEIVER_NAME || '');
  const expectedReceiverAccount = await getSettingValue('receiver_account', process.env.RECEIVER_ACCOUNT || '');

  if (expectedReceiverName && expectedReceiverName.trim() !== '') {
    const receiverDisplayName: string = slipData.receiver?.displayName || '';
    const receiverName: string = slipData.receiver?.name || '';
    const cleanExpected = expectedReceiverName.trim().toLowerCase();
    const match1 = receiverDisplayName.toLowerCase().includes(cleanExpected);
    const match2 = receiverName.toLowerCase().includes(cleanExpected);
    if (!match1 && !match2) {
      const err: any = new Error(`ชื่อบัญชีผู้รับในสลิปไม่ตรงกับที่กำหนดไว้ (${receiverDisplayName || receiverName})`);
      err.code = 1014;
      throw err;
    }
  }

  if (expectedReceiverAccount && expectedReceiverAccount.trim() !== '') {
    const cleanExpectedAcc = expectedReceiverAccount.replace(/[^0-9]/g, '');
    const accVal: string = (slipData.receiver?.account?.value || slipData.receiver?.proxy?.value || '').replace(/[^0-9xX]/g, '');
    const last4Expected = cleanExpectedAcc.slice(-4);
    const last4Slip = accVal.replace(/[^0-9]/g, '').slice(-4);
    if (last4Expected && last4Slip && last4Expected !== last4Slip) {
      const err: any = new Error(`เลขบัญชีผู้รับในสลิป (${accVal}) ไม่ตรงกับบัญชีที่กำหนด`);
      err.code = 1014;
      throw err;
    }
  }

  return {
    verified: true,
    transRef: slipData.transRef,
    amount: slipAmount,
    senderName: slipData.sender?.displayName || slipData.sender?.name || 'ผู้สนับสนุนนิรนาม',
    senderBank: slipData.sendingBank || '',
    receiverName: slipData.receiver?.displayName || slipData.receiver?.name || '',
    transDate: slipData.transDate,
    transTime: slipData.transTime,
    raw: slipData
  };
}
