const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://sunnybariya:sunnybariya1@cluster0.xxgfaha.mongodb.net/aimx?retryWrites=true&w=majority';

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://aimx-website-gilt.vercel.app',
    'https://aimx.online',
    'https://www.aimx.online'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

console.log('✅ CORS configured for:', ['http://localhost:5173', 'https://aimx-website-gilt.vercel.app', 'https://aimx.online', 'https://www.aimx.online']);
console.log('✅ CORS configured for production (Render)');
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Mount routes
app.use('/api/participants', require('./routes/participants'));
app.use('/api/organizers', require('./routes/organizers'));

// Socket.IO setup
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST']
  }
});
console.log('✅ Socket.IO configured for production');

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('connected', { message: 'Welcome to AIMX dashboard' });
});

mongoose.connect(MONGO_URI, {
  bufferCommands: false,
  serverSelectionTimeoutMS: 30000,
  maxPoolSize: 10,
  socketTimeoutMS: 45000
})
  .then(() => console.log(`✅ MongoDB connected: ${MONGO_URI.includes('mongodb+srv') ? 'Atlas' : 'Local'}`))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('ℹ️ Using MONGO_URI from env:', Boolean(process.env.MONGO_URI));
  });

// Health check
app.get('/', (req, res) => res.json({ status: 'AIMX Backend running', port: PORT }));

// 404 fallback
app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handlers for Render stability
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Mongo close error:', err);
  }
  process.exit(0);
});

// Start server only after Mongo is connected
mongoose.connection.once('open', () => {
  server.listen(PORT, () => {
    console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
    console.log(`📊 Health: http://${process.env.RENDER_EXTERNAL_HOSTNAME || 'localhost'}:${PORT}/`);
  });
});

// Fallback server start if Mongo fails (for health checks)
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} (Mongo unavailable)`);
  });
});
