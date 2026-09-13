require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  SLIPOK_BRANCH_ID: process.env.SLIPOK_BRANCH_ID || '',
  SLIPOK_API_KEY: process.env.SLIPOK_API_KEY || '',
  PROMPTPAY_ID: process.env.PROMPTPAY_ID || '',
  RECEIVER_NAME: process.env.RECEIVER_NAME || '',
  RECEIVER_ACCOUNT: process.env.RECEIVER_ACCOUNT || '',
  ADMIN_SECRET: process.env.ADMIN_SECRET || 'streamer1234'
};
