import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import apiRouter from './backend/routes/api.js';
import { seedDatabase } from './backend/db/prismaClient.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Run database seeding/migration on start
  await seedDatabase();

  // Request limits configured for 10mb to safely accommodate Base64 profile pictures under 2MB
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // API Router Mount
  app.use('/api', apiRouter);

  // Health probe
  app.get('/api-health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Vite Assets Serving and SPA Fallback Routing
  if (process.env.NODE_ENV !== 'production') {
    console.log('Mounting development Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Serving production static build contents...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduRank Full-Stack Server running and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Fatal crash on server startup:', error);
  process.exit(1);
});
