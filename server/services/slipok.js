const axios = require('axios');
const FormData = require('form-data');
const config = require('../config');
const { getSetting, getDonationByRef } = require('../database/database');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Mapping error codes from SlipOK to friendly Thai messages
const ERROR_CODE_MESSAGES = {
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

/**
 * Check SlipOK Quota
 */
async function checkQuota() {
  const branchId = getSetting('slipok_branch_id') || config.SLIPOK_BRANCH_ID;
  const apiKey = getSetting('slipok_api_key') || config.SLIPOK_API_KEY;

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

/**
 * Verify slip with SlipOK API and run internal business checks
 * @param {Object} params
 * @param {Buffer} params.fileBuffer - Buffer of the slip image
 * @param {string} params.fileName - Original file name
 * @param {string} params.mimeType - Mime type of file
 * @param {number} params.expectedAmount - Expected donation amount
 * @param {boolean} [params.log] - Whether to log in SlipOK LIFF
 */
async function verifySlip({ fileBuffer, fileName, mimeType, expectedAmount, log = false }) {
  const branchId = getSetting('slipok_branch_id') || config.SLIPOK_BRANCH_ID;
  const apiKey = getSetting('slipok_api_key') || config.SLIPOK_API_KEY;

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

  let apiResponse;
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
  } catch (error) {
    if (error.response && error.response.data) {
      const errData = error.response.data;
      const code = errData.code;
      const friendlyMsg = ERROR_CODE_MESSAGES[code] || errData.message || 'การตรวจสอบสลิปล้มเหลว';
      const customErr = new Error(friendlyMsg);
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

  // 1. Check duplicate via transRef in local database
  const transRef = slipData.transRef;
  if (!transRef) {
    throw new Error('ไม่พบรหัสอ้างอิงธุรกรรม (Transaction Ref) ในสลิป');
  }

  const existingDonation = getDonationByRef(transRef);
  if (existingDonation) {
    const err = new Error(`สลิปนี้ถูกใช้งานไปแล้วเมื่อ ${existingDonation.created_at || 'ก่อนหน้านี้'}`);
    err.code = 1012;
    throw err;
  }

  // 2. Check Amount
  const slipAmount = parseFloat(slipData.amount);
  const targetAmount = parseFloat(expectedAmount);
  if (!isNaN(targetAmount) && targetAmount > 0) {
    if (Math.abs(slipAmount - targetAmount) > 0.001) {
      const err = new Error(`ยอดเงินในสลิป (${slipAmount} บาท) ไม่ตรงกับยอดที่ต้องชำระ (${targetAmount} บาท)`);
      err.code = 1013;
      throw err;
    }
  }

  // 3. Check Receiver (Optional setting check)
  const expectedReceiverName = getSetting('receiver_name') || config.RECEIVER_NAME;
  const expectedReceiverAccount = getSetting('receiver_account') || config.RECEIVER_ACCOUNT;

  if (expectedReceiverName && expectedReceiverName.trim() !== '') {
    const receiverDisplayName = slipData.receiver?.displayName || '';
    const receiverName = slipData.receiver?.name || '';
    const cleanExpected = expectedReceiverName.trim().toLowerCase();
    const match1 = receiverDisplayName.toLowerCase().includes(cleanExpected);
    const match2 = receiverName.toLowerCase().includes(cleanExpected);
    if (!match1 && !match2) {
      const err = new Error(`ชื่อบัญชีผู้รับในสลิปไม่ตรงกับที่กำหนดไว้ (${receiverDisplayName || receiverName})`);
      err.code = 1014;
      throw err;
    }
  }

  if (expectedReceiverAccount && expectedReceiverAccount.trim() !== '') {
    const cleanExpectedAcc = expectedReceiverAccount.replace(/[^0-9]/g, '');
    const accVal = (slipData.receiver?.account?.value || slipData.receiver?.proxy?.value || '').replace(/[^0-9xX]/g, '');
    
    // Compare last digits if masked
    const last4Expected = cleanExpectedAcc.slice(-4);
    const last4Slip = accVal.replace(/[^0-9]/g, '').slice(-4);
    if (last4Expected && last4Slip && last4Expected !== last4Slip) {
      const err = new Error(`เลขบัญชีผู้รับในสลิป (${accVal}) ไม่ตรงกับบัญชีที่กำหนด`);
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

module.exports = {
  verifySlip,
  checkQuota,
  ERROR_CODE_MESSAGES
};
