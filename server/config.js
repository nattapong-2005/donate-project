require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  SLIPOK_BRANCH_ID: process.env.SLIPOK_BRANCH_ID || '76110',
  SLIPOK_API_KEY: process.env.SLIPOK_API_KEY || 'SLIPOK67HJ1G8',
  PROMPTPAY_ID: process.env.PROMPTPAY_ID || '0649520055',
  RECEIVER_NAME: process.env.RECEIVER_NAME || '',
  RECEIVER_ACCOUNT: process.env.RECEIVER_ACCOUNT || '',
  ADMIN_SECRET: process.env.ADMIN_SECRET || 'streamer1234'
};
