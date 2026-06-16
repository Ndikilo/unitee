require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const session = require('express-session');
const compression = require('compression');
const passport = require('./config/passport');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Connect to database
connectDB();

// Trust proxy (required for rate limiting behind reverse proxies like nginx)
if (isProduction) {
  app.set('trust proxy', 1);
}

// Compression
app.use(compression());

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// MongoDB injection prevention
app.use(mongoSanitize());

// HTTP Parameter Pollution protection
app.use(hpp());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'volunteer-platform-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 100 : 500,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow all origins in development
    if (!isProduction) return callback(null, true);
    callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (for load balancers / uptime monitors)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/communities', require('./routes/communityRoutes'));
app.use('/api/opportunities', require('./routes/opportunityRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/organizer', require('./routes/organizerRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/admin/certificate-templates', require('./routes/certTemplateRoutes'));
app.use('/api/badges', require('./routes/badgeRoutes'));
app.use('/api/setup', require('./routes/setupRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (!isProduction) {
    console.error(err.stack);
  } else {
    console.error(`[${new Date().toISOString()}] ${err.message}`);
  }
  res.status(statusCode).json({
    message: isProduction ? 'An unexpected error occurred' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`[${process.env.NODE_ENV || 'development'}] Server running on port ${PORT}`);
  const { initializeBadges } = require('./utils/badgeSystem');
  await initializeBadges();
});
