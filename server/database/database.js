const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const config = require('../config');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'donate.db');
const db = new DatabaseSync(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    message TEXT,
    transaction_ref TEXT UNIQUE,
    sender_name TEXT,
    sender_bank TEXT,
    receiver_name TEXT,
    transaction_date TEXT,
    status TEXT DEFAULT 'verified',
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS blacklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT UNIQUE NOT NULL
  );
`);

// Initialize default settings if not exists
const defaultSettings = {
  promptpay_id: config.PROMPTPAY_ID,
  receiver_name: config.RECEIVER_NAME,
  receiver_account: config.RECEIVER_ACCOUNT,
  min_donate: '1',
  alert_duration: '8',
  alert_volume: '80',
  tts_enabled: 'true',
  tts_min_amount: '20',
  alert_sound: 'chime'
};

const insertSettingStmt = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
for (const [key, value] of Object.entries(defaultSettings)) {
  insertSettingStmt.run(key, String(value));
}

// Helper methods
function getDonationByRef(transRef) {
  if (!transRef) return null;
  const stmt = db.prepare('SELECT * FROM donations WHERE transaction_ref = ?');
  return stmt.get(transRef);
}

function insertDonation({ name, amount, message, transaction_ref, sender_name, sender_bank, receiver_name, transaction_date, status = 'verified' }) {
  const stmt = db.prepare(`
    INSERT INTO donations (name, amount, message, transaction_ref, sender_name, sender_bank, receiver_name, transaction_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    name,
    amount,
    message || '',
    transaction_ref || null,
    sender_name || '',
    sender_bank || '',
    receiver_name || '',
    transaction_date || new Date().toISOString(),
    status
  );
  return { id: result.lastInsertRowid };
}

function getDonations(limit = 50, offset = 0) {
  const stmt = db.prepare(`
    SELECT * FROM donations 
    ORDER BY id DESC 
    LIMIT ? OFFSET ?
  `);
  return stmt.all(limit, offset);
}

function getStats() {
  const totalStmt = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as totalAmount FROM donations WHERE status = 'verified'");
  const todayStmt = db.prepare(`
    SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as todayAmount 
    FROM donations 
    WHERE status = 'verified' AND date(created_at) = date('now', 'localtime')
  `);
  const topDonatorStmt = db.prepare(`
    SELECT name, SUM(amount) as total 
    FROM donations 
    WHERE status = 'verified' 
    GROUP BY name 
    ORDER BY total DESC 
    LIMIT 1
  `);

  const total = totalStmt.get();
  const today = todayStmt.get();
  const topDonator = topDonatorStmt.get();

  return {
    totalCount: total.count,
    totalAmount: total.totalAmount,
    todayCount: today.count,
    todayAmount: today.todayAmount,
    topDonator: topDonator ? { name: topDonator.name, total: topDonator.total } : null
  };
}

function getSetting(key, fallback = '') {
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  const row = stmt.get(key);
  return row ? row.value : fallback;
}

function getAllSettings() {
  const stmt = db.prepare('SELECT key, value FROM settings');
  const rows = stmt.all();
  const result = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

function updateSetting(key, value) {
  const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  return stmt.run(key, String(value));
}

function updateSettings(settingsObj) {
  for (const [key, value] of Object.entries(settingsObj)) {
    updateSetting(key, value);
  }
}

function getBlacklist() {
  const stmt = db.prepare('SELECT * FROM blacklist ORDER BY id ASC');
  return stmt.all();
}

function addBlacklistWord(word) {
  const clean = (word || '').trim().toLowerCase();
  if (!clean) return null;
  const stmt = db.prepare('INSERT OR IGNORE INTO blacklist (word) VALUES (?)');
  return stmt.run(clean);
}

function deleteBlacklistWord(id) {
  const stmt = db.prepare('DELETE FROM blacklist WHERE id = ?');
  return stmt.run(id);
}

function filterMessage(message) {
  if (!message) return '';
  let filtered = message;
  const words = getBlacklist();
  for (const item of words) {
    if (!item.word) continue;
    const escaped = item.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    filtered = filtered.replace(regex, '***');
  }
  return filtered;
}

module.exports = {
  db,
  getDonationByRef,
  insertDonation,
  getDonations,
  getStats,
  getSetting,
  getAllSettings,
  updateSetting,
  updateSettings,
  getBlacklist,
  addBlacklistWord,
  deleteBlacklistWord,
  filterMessage
};
