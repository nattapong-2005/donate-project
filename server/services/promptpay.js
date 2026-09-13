const promptpayQR = require('promptpay-qr');
const QRCode = require('qrcode');
const { getSetting } = require('../database/database');
const config = require('../config');

/**
 * Generate PromptPay QR Code Payload & DataURL
 * @param {number} amount - Amount in THB
 * @param {string} [customPromptpayId] - Optional promptpay ID override
 * @returns {Promise<{ payload: string, qrDataUrl: string, promptpayId: string }>}
 */
async function generatePromptPayQR(amount, customPromptpayId = null) {
  const promptpayId = customPromptpayId || getSetting('promptpay_id') || config.PROMPTPAY_ID;
  
  if (!promptpayId) {
    throw new Error('PromptPay ID is not configured');
  }

  const parsedAmount = parseFloat(amount);
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
      dark: '#002D62', // Classic Thai PromptPay Navy Blue
      light: '#FFFFFF'
    }
  });

  return {
    payload,
    qrDataUrl,
    promptpayId,
    amount: parsedAmount
  };
}

module.exports = {
  generatePromptPayQR
};
