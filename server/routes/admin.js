const express = require('express');
const router = express.Router();
const {
  getStats,
  getDonations,
  getAllSettings,
  updateSettings,
  getBlacklist,
  addBlacklistWord,
  deleteBlacklistWord,
  filterMessage
} = require('../database/database');
const { checkQuota } = require('../services/slipok');

module.exports = function(io) {
  // Get overview stats
  router.get('/stats', async (req, res) => {
    try {
      const stats = getStats();
      let quotaInfo = null;

      try {
        const quotaData = await checkQuota();
        if (quotaData && quotaData.data) {
          quotaInfo = quotaData.data;
        }
      } catch (qErr) {
        console.warn('Quota check warning:', qErr.message);
      }

      res.json({
        success: true,
        stats,
        quota: quotaInfo
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Get donation history
  router.get('/donations', (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const donations = getDonations(limit, offset);
      res.json({
        success: true,
        donations
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Trigger test alert to OBS
  router.post('/test-alert', (req, res) => {
    try {
      const { name, amount, message } = req.body;
      const testData = {
        id: 'test-' + Date.now(),
        name: name || 'ผู้ชมทดสอบ',
        amount: parseFloat(amount) || 50,
        message: filterMessage(message || 'นี่คือการทดสอบระบบ Alert ขึ้นจอ OBS!'),
        sender_bank: 'TEST',
        created_at: new Date().toLocaleTimeString('th-TH'),
        isTest: true
      };

      // Emit to overlay
      io.emit('donation', testData);

      res.json({
        success: true,
        message: 'ส่ง Test Alert ขึ้นหน้าจอ OBS เรียบร้อยแล้ว!',
        data: testData
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Replay an existing donation
  router.post('/replay-alert', (req, res) => {
    try {
      const { id, name, amount, message } = req.body;
      const replayData = {
        id: id || 'replay-' + Date.now(),
        name: name || 'ผู้สนับสนุน',
        amount: parseFloat(amount) || 50,
        message: filterMessage(message || ''),
        created_at: new Date().toLocaleTimeString('th-TH'),
        isReplay: true
      };

      io.emit('donation', replayData);

      res.json({
        success: true,
        message: 'ส่ง Replay Alert ขึ้นจอแล้ว!',
        data: replayData
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Get all settings
  router.get('/settings', (req, res) => {
    try {
      const settings = getAllSettings();
      res.json({ success: true, settings });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Update settings
  router.post('/settings', (req, res) => {
    try {
      const settingsObj = req.body;
      updateSettings(settingsObj);

      // Notify OBS overlay of updated settings live
      io.emit('settings_updated', getAllSettings());

      res.json({
        success: true,
        message: 'บันทึกการตั้งค่าเรียบร้อยแล้ว'
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Get blacklist
  router.get('/blacklist', (req, res) => {
    try {
      const list = getBlacklist();
      res.json({ success: true, blacklist: list });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Add blacklist word
  router.post('/blacklist', (req, res) => {
    try {
      const { word } = req.body;
      if (!word || !word.trim()) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกคำที่ต้องการบล็อก' });
      }
      addBlacklistWord(word.trim());
      res.json({ success: true, message: 'เพิ่มคำต้องห้ามสำเร็จ' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Delete blacklist word
  router.delete('/blacklist/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      deleteBlacklistWord(id);
      res.json({ success: true, message: 'ลบคำต้องห้ามสำเร็จ' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Check quota directly
  router.get('/quota', async (req, res) => {
    try {
      const quotaData = await checkQuota();
      res.json({ success: true, quota: quotaData.data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  return router;
};
