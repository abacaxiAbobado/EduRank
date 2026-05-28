const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const rankingRoutes = require('./routes/rankingRoutes');
const quizRoutes = require('./routes/quizRoutes');
const contentRoutes = require('./routes/contentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5500'];

app.use(cors({
  origin: (origin, callback) => {
    // null = arquivo local aberto direto no navegador (file://)
    if (!origin || origin === 'null' || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Origem não permitida pelo CORS.'));
  }
}));

app.use(express.json());

// Servir arquivos estáticos do frontend construído
const frontendPath = path.join(__dirname, '../../Front/dist');
app.use(express.static(frontendPath));

// Rotas da API
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/ranking', rankingRoutes);
app.use('/quizzes', quizRoutes);
app.use('/content', contentRoutes);
app.use('/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ message: 'EduRank API funcionando!' }));

// Fallback para SPA - redirecionar todas as rotas não encontradas para index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use(errorMiddleware);

module.exports = app;
