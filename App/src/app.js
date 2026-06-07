const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const rankingRoutes = require('./routes/rankingRoutes');
const quizRoutes = require('./routes/quizRoutes');
const contentRoutes = require('./routes/contentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5500'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === 'null' || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Origem não permitida pelo CORS.'));
  }
}));

// ── BODY PARSER ───────────────────────────────────────────────
// Limite maior para suportar Base64 de imagens de perfil (~1MB)
app.use(express.json({ limit: '2mb' }));

// ── RATE LIMITING ─────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  message: { error: 'Muitas tentativas. Aguarde 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const quizLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30,
  message: { error: 'Muitas requisições. Aguarde um momento.' },
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Muitas requisições. Aguarde um momento.' },
});

app.use(generalLimiter);

// ── ROTAS ─────────────────────────────────────────────────────
app.use('/auth', authLimiter, authRoutes);
app.use('/users', userRoutes);
app.use('/ranking', rankingRoutes);
app.use('/quizzes', quizLimiter, quizRoutes);
app.use('/content', contentRoutes);
app.use('/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'EduRank API funcionando!' }));

app.use(errorMiddleware);

module.exports = app;
