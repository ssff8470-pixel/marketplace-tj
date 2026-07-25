import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Статические файлы (загруженные изображения)
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Маршруты
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Обработка 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Глобальная обработка ошибок
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Запуск сервера (HTTP или HTTPS)
const useHttps = process.env.USE_HTTPS === 'true';
const certPath = process.env.SSL_CERT_PATH;
const keyPath = process.env.SSL_KEY_PATH;

if (useHttps && certPath && keyPath) {
  const certFullPath = path.resolve(__dirname, '..', certPath);
  const keyFullPath = path.resolve(__dirname, '..', keyPath);

  if (!fs.existsSync(certFullPath) || !fs.existsSync(keyFullPath)) {
    console.error('\n[!] SSL-сертификат не найден!');
    console.error('    Запустите: npm run cert  (в папке backend)');
    console.error('    Или установите USE_HTTPS=false в .env\n');
    process.exit(1);
  }

  const sslOptions = {
    cert: fs.readFileSync(certFullPath),
    key: fs.readFileSync(keyFullPath),
  };

  https.createServer(sslOptions, app).listen(PORT, HOST, () => {
    console.log(`\n[TJ Marketplace] HTTPS сервер запущен:`);
    console.log(`  Локально:        https://localhost:${PORT}`);
    console.log(`  В сети (Android): https://<IP-компьютера>:${PORT}`);
    console.log(`  Health check:    https://localhost:${PORT}/api/health\n`);
  });
} else {
  http.createServer(app).listen(PORT, HOST, () => {
    console.log(`\n[TJ Marketplace] HTTP сервер запущен:`);
    console.log(`  Локально:        http://localhost:${PORT}`);
    console.log(`  В сети (Android): http://<IP-компьютера>:${PORT}`);
    console.log(`  Health check:    http://localhost:${PORT}/api/health\n`);
  });
}
