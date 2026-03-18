const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL =
  process.env.MONGO_URL ||
  process.env.MONGODB_URI ||
  'mongodb+srv://sunnybariya:sunnybariya@cluster0.xxgfaha.mongodb.net/aimx?retryWrites=true&w=majority';

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('connected', { message: 'Welcome to AIMX dashboard' });
});

mongoose.connect(MONGO_URL, {

  bufferCommands: false,
  serverSelectionTimeoutMS: 10000
})
  .then(() => console.log(`✅ MongoDB connected: ${MONGO_URL.includes('mongodb+srv') ? 'Atlas' : 'Local'}`))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('ℹ️ Using MONGO_URL/MONGODB_URI from env:', Boolean(process.env.MONGO_URL || process.env.MONGODB_URI));
  });

// Health check
app.get('/', (req, res) => res.json({ status: 'AIMX Backend running', port: PORT }));

// 404 fallback
app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));

// Start server only after Mongo is connected
mongoose.connection.once('open', () => {
  server.listen(PORT, () => {
    console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/`);
  });
});


