require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const initSocket = require('./socket/chat');

// Routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');

// ── MongoDB setup ──────────────────────────────────────────────
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in .env');
  console.error('   Please add MONGO_URI=<your-atlas-uri> to server/.env');
  process.exit(1);
}

connectDB();

const app = express();
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://nexus-v5-responsive.onrender.com',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
initSocket(io);

// Middleware
// Use restrictive CORS in production when CLIENT_URL is provided; otherwise allow all origins for local/dev.
if (process.env.NODE_ENV === 'production' && process.env.CLIENT_URL) {
  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
} else {
  app.use(cors());
}
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Serve client `dist` if present (SPA fallback). This makes the API host also serve
// the built frontend so dynamic imports and hashed assets are available at the same origin.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    // Let API and uploads routes pass through
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Nexus server running on http://localhost:${PORT}`);
});
