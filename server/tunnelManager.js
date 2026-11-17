import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const onlineLinkFile = path.join(rootDir, 'data', 'online_link.txt');
const customConfigPath = path.join(rootDir, 'data', 'cloudflared_sivaksin.yml');

const CLOUDFLARED_PATH = 'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe';

let tunnelProcess = null;
let currentTunnelUrl = null;
let isStarting = false;

// Baca link tersimpan sebelumnya jika ada
if (fs.existsSync(onlineLinkFile)) {
  try {
    currentTunnelUrl = fs.readFileSync(onlineLinkFile, 'utf8').trim() || null;
  } catch (e) {}
}

export function getTunnelStatus() {
  return {
    active: !!tunnelProcess && !!currentTunnelUrl,
    url: currentTunnelUrl,
    isStarting
  };
}

export function startTunnel(port = 3003) {
  return new Promise((resolve) => {
    if (tunnelProcess && currentTunnelUrl) {
      return resolve({ success: true, url: currentTunnelUrl });
    }

    if (!fs.existsSync(CLOUDFLARED_PATH)) {
      return resolve({
        success: false,
        error: 'Aplikasi cloudflared tidak ditemukan di ' + CLOUDFLARED_PATH
      });
    }

    isStarting = true;
    console.log('[Tunnel] Memulai Cloudflare Tunnel ke port ' + port + '...');

    try {
      tunnelProcess = spawn(CLOUDFLARED_PATH, [
        'tunnel',
        '--config', customConfigPath,
        '--url', `http://127.0.0.1:${port}`
      ]);
    } catch (err) {
      isStarting = false;
      return resolve({ success: false, error: err.message });
    }

    let urlFound = false;

    const handleOutput = (data) => {
      const text = data.toString();
      const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
      if (match && !urlFound) {
        urlFound = true;
        isStarting = false;
        currentTunnelUrl = match[0];
        console.log('====================================================');
        console.log('  LINK ONLINE SIVAKSIN AKTIF (CLOUDFLARE HTTPS):');
        console.log(`  ${currentTunnelUrl}`);
        console.log('====================================================');
        try {
          fs.writeFileSync(onlineLinkFile, currentTunnelUrl, 'utf8');
        } catch (e) {}
        resolve({ success: true, url: currentTunnelUrl });
      }
    };

    tunnelProcess.stdout.on('data', handleOutput);
    tunnelProcess.stderr.on('data', handleOutput);

    tunnelProcess.on('error', (err) => {
      console.error('[Tunnel Error]:', err);
      isStarting = false;
      tunnelProcess = null;
      if (!urlFound) resolve({ success: false, error: err.message });
    });

    tunnelProcess.on('exit', () => {
      console.log('[Tunnel] Cloudflare Tunnel dinonaktifkan.');
      tunnelProcess = null;
      currentTunnelUrl = null;
      isStarting = false;
      try {
        if (fs.existsSync(onlineLinkFile)) fs.unlinkSync(onlineLinkFile);
      } catch (e) {}
    });

    // Timeout 25 detik
    setTimeout(() => {
      if (!urlFound) {
        isStarting = false;
        resolve({
          success: !!currentTunnelUrl,
          url: currentTunnelUrl,
          error: currentTunnelUrl ? null : 'Timeout menghubungkan Cloudflare Tunnel'
        });
      }
    }, 25000);
  });
}

export function stopTunnel() {
  if (tunnelProcess) {
    try {
      tunnelProcess.kill('SIGTERM');
    } catch (e) {}
    tunnelProcess = null;
  }
  currentTunnelUrl = null;
  isStarting = false;
  try {
    if (fs.existsSync(onlineLinkFile)) fs.unlinkSync(onlineLinkFile);
  } catch (e) {}
  return { success: true };
}
