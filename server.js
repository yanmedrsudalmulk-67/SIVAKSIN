import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import './server/env.js';
import { handleLocalApi, initBackgroundServices } from './server/apiRouter.js';
import { startTunnel } from './server/tunnelManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware API Lokal
app.use((req, res, next) => {
  handleLocalApi(req, res, next);
});

// Sajikan file uploads statis dari folder public/uploads
const uploadsPath = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));
app.use(express.static(path.join(__dirname, 'public')));

// Sajikan folder dist jika sudah di-build
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Jika dist belum di-build, berikan info
  app.get('/', (req, res) => {
    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h2>SIVAKSIN Server Berjalan di Port ${PORT}</h2>
        <p>Frontend production belum di-build. Silakan jalankan <code>npm run build</code> atau jalankan dengan <code>npm run dev</code> untuk mode development.</p>
        <p><a href="/api/status" style="color: blue;">Cek Status API Lokal</a></p>
      </div>
    `);
  });
}

app.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  initBackgroundServices();
  console.log(`====================================================`);
  console.log(`  SIVAKSIN - RSUD AL-MULK KOTA SUKABUMI`);
  console.log(`  Penyimpanan Data: 100% Lokal (Komputer Ini)`);
  console.log(`  Server Lokal: http://localhost:${PORT}`);
  console.log(`  Jaringan Lokal / Wi-Fi: http://${localIp}:${PORT}`);
  console.log(`====================================================`);

  // Aktifkan Cloudflare Tunnel otomatis untuk akses HP dari luar jaringan
  startTunnel(PORT).then((result) => {
    if (result.success && result.url) {
      console.log(`  >>> AKSES HP ONLINE (4G/5G): ${result.url}`);
    }
  }).catch((err) => {
    console.warn('[Tunnel Note]:', err.message);
  });
});
