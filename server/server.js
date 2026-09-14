const http = require('http');
const path = require('path');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const config = require('./config');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public/
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

// API Routes
const donateRoutes = require('./routes/donate')(io);
const adminRoutes = require('./routes/admin')(io);

app.use('/api/donate', donateRoutes);
app.use('/api/admin', adminRoutes);

// Friendly HTML page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'donate.html'));
});

app.get('/donate', (req, res) => {
  res.sendFile(path.join(publicDir, 'donate.html'));
});

app.get('/overlay', (req, res) => {
  res.sendFile(path.join(publicDir, 'overlay.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicDir, 'admin.html'));
});

app.get('/customizer', (req, res) => {
  res.sendFile(path.join(publicDir, 'customizer.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Start listening
const PORT = config.PORT;
server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 Donation System running on http://localhost:${PORT}`);
  console.log(`🎁 Donate Page:     http://localhost:${PORT}/donate`);
  console.log(`📺 OBS Overlay:     http://localhost:${PORT}/overlay`);
  console.log(`🎨 UI Customizer:   http://localhost:${PORT}/customizer`);
  console.log(`⚙️  Admin Panel:     http://localhost:${PORT}/admin`);
  console.log('====================================================');
});
