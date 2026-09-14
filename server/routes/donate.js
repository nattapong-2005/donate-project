const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { generatePromptPayQR } = require('../services/promptpay');
const { verifySlip } = require('../services/slipok');
const { 
  insertDonation, 
  getSetting, 
  filterMessage 
} = require('../database/database');

/**
 * Clean & sanitize text to prevent XSS
 */
function sanitizeText(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

module.exports = function(io) {
  // Get public settings (minimum donation, etc.)
  router.get('/config', (req, res) => {
    try {
      const minDonate = parseFloat(getSetting('min_donate', '5'));
      res.json({
        success: true,
        minDonate
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Generate PromptPay QR Code
  router.post('/create-qr', async (req, res) => {
    try {
      const { amount, name, message } = req.body;
      const amountStr = String(amount || '').trim();
      const parsedAmount = parseFloat(amountStr);
      const minDonate = parseFloat(getSetting('min_donate', '5'));

      if (!/^\d+(\.\d{1,2})?$/.test(amountStr) || isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount < minDonate) {
        return res.status(400).json({
          success: false,
          message: `ยอดโดเนทต้องเป็นตัวเลขจำนวนบวก และขั้นต่ำคือ ${minDonate} บาท`
        });
      }

      const qrResult = await generatePromptPayQR(parsedAmount);

      res.json({
        success: true,
        qrDataUrl: qrResult.qrDataUrl,
        amount: parsedAmount,
        promptpayId: qrResult.promptpayId
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || 'ไม่สามารถสร้าง QR Code ได้'
      });
    }
  });

  // Verify Slip Upload
  router.post('/verify', upload.single('slip'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาเลือกรูปภาพสลิปที่ต้องการตรวจสอบ'
        });
      }

      const { amount } = req.body;
      const rawName = req.body.name || 'ผู้สนับสนุนใจดี';
      const rawMessage = req.body.message || '';

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุยอดเงินที่ถูกต้อง'
        });
      }

      // Verify slip via SlipOK API
      const slipResult = await verifySlip({
        fileBuffer: req.file.buffer,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        expectedAmount: parsedAmount
      });

      // Sanitize and filter inputs
      const safeName = sanitizeText(rawName).slice(0, 50) || 'ผู้สนับสนุนใจดี';
      const cleanMessage = sanitizeText(rawMessage).slice(0, 200);
      const filteredMsg = filterMessage(cleanMessage);

      // Save to database
      const insertResult = insertDonation({
        name: safeName,
        amount: slipResult.amount,
        message: filteredMsg,
        transaction_ref: slipResult.transRef,
        sender_name: slipResult.senderName,
        sender_bank: slipResult.senderBank,
        receiver_name: slipResult.receiverName,
        transaction_date: `${slipResult.transDate} ${slipResult.transTime}`
      });

      const donationData = {
        id: insertResult.id,
        name: safeName,
        amount: slipResult.amount,
        message: filteredMsg,
        transaction_ref: slipResult.transRef,
        sender_bank: slipResult.senderBank,
        created_at: new Date().toLocaleTimeString('th-TH')
      };

      // Broadcast alert to OBS Overlay and Admin
      io.emit('donation', donationData);

      res.json({
        success: true,
        message: 'ตรวจสอบสลิปเรียบร้อยแล้ว ขอบคุณสำหรับการสนับสนุน!',
        data: donationData
      });
    } catch (err) {
      console.error('Slip verification error:', err.message);
      res.status(400).json({
        success: false,
        code: err.code || null,
        message: err.message || 'การตรวจสอบสลิปล้มเหลว'
      });
    }
  });

  return router;
};
