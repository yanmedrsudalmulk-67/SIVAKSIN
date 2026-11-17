import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const LOG_FILE = path.join(DATA_DIR, 'autosync.log');
const LOCK_FILE = path.join(DATA_DIR, 'autosync.lock');
const SERVER_PORT = 3003;
const QUIET_PUSH_WINDOW_MS = 10000;
const WATCH_INTERVAL_MS = 15000;

const EXPECTED_SCRIPTS = {
  dev: `vite --port=${SERVER_PORT} --host=0.0.0.0`,
  start: 'node server.js',
  build: 'vite build',
  preview: `vite preview --port=${SERVER_PORT} --host=0.0.0.0`,
  lint: 'tsc --noEmit',
};

const REQUIRED_BACKEND_DEPS = ['express', 'mysql2', 'dotenv'];

const REQUIRED_GITIGNORE_LINES = [
  'node_modules/',
  'dist/',
  '.env*',
  '!.env.example',
  'data/',
  'public/uploads/',
  'scratch/',
];

const PROTECTED_CORE_FILES = [
  'server.js',
  'vite.config.ts',
  'scripts/sync-github.js',
  'src/services/localDataService.ts',
  '.gitignore',
];

const PROTECTED_DIRECTORIES = ['server', 'scripts'];

const FORBIDDEN_STAGE_PATTERNS = [
  /^data\//i,
  /^public\/uploads\//i,
  /^scratch\//i,
  /^(dist|build|node_modules)\//i,
  /(^|\/)\.env(?!\.example$)/i,
  /\.(log|db|sqlite|sqlite3)$/i,
];

let cycleActive = false;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function log(msg) {
  ensureDataDir();
  const stamp = new Date().toLocaleString('id-ID', { hour12: false });
  const line = `[${stamp}] ${msg}`;
  console.log(line);
  try {
    if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > 262144) {
      const tail = fs.readFileSync(LOG_FILE, 'utf8').slice(-65536);
      fs.writeFileSync(LOG_FILE, tail + '\n', 'utf8');
    }
    fs.appendFileSync(LOG_FILE, line + '\n', 'utf8');
  } catch {
    // Ignore log write error
  }
}

function runGit(cmd, timeoutMs = 20000) {
  return execSync(`git ${cmd}`, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: timeoutMs,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function runGitRaw(cmd, timeoutMs = 15000) {
  return execSync(`git ${cmd}`, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: timeoutMs,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function isPidAlive(pid) {
  if (!pid || Number.isNaN(Number(pid))) return false;
  try {
    process.kill(Number(pid), 0);
    return true;
  } catch {
    return false;
  }
}

function acquireWatchLock() {
  ensureDataDir();
  if (fs.existsSync(LOCK_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'));
      if (data?.pid && data.pid !== process.pid && isPidAlive(data.pid)) {
        return false;
      }
    } catch {
      // Stale lock file, overwrite below
    }
  }
  fs.writeFileSync(
    LOCK_FILE,
    JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }),
    'utf8'
  );
  const release = () => {
    try {
      if (fs.existsSync(LOCK_FILE)) {
        const cur = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'));
        if (cur?.pid === process.pid) fs.unlinkSync(LOCK_FILE);
      }
    } catch {
      // Ignore release error
    }
  };
  process.on('exit', release);
  process.on('SIGINT', () => {
    release();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    release();
    process.exit(0);
  });
  return true;
}

function getPortPids(port = SERVER_PORT) {
  try {
    const out = execSync(`netstat -aon | findstr ":${port} " | findstr "LISTENING"`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid) && pid !== '0' && pid !== '4') {
        pids.add(pid);
      }
    }
    return Array.from(pids);
  } catch {
    return [];
  }
}

function stopPortServer(port = SERVER_PORT) {
  const pids = getPortPids(port);
  for (const pid of pids) {
    try {
      execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'ignore' });
      log(`Menghentikan server SIVAKSIN lama di port ${port} (PID ${pid})...`);
    } catch {
      // Process may already have exited
    }
  }
}

function httpGetOk(url, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      res.resume();
      resolve((res.statusCode || 500) >= 200 && (res.statusCode || 500) < 400);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startServerAndWarmup() {
  ensureDataDir();
  const serverLogFd = fs.openSync(path.join(DATA_DIR, 'server-autosync.log'), 'a');
  const child = spawn(process.execPath, [path.join(ROOT, 'server.js')], {
    cwd: ROOT,
    detached: true,
    windowsHide: true,
    stdio: ['ignore', serverLogFd, serverLogFd],
  });
  child.unref();
  log(`Menjalankan ulang server SIVAKSIN pada port ${SERVER_PORT} (PID ${child.pid})...`);

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500));
    const ok = await httpGetOk(`http://127.0.0.1:${SERVER_PORT}/api/status`);
    if (ok) {
      log(`Server SIVAKSIN port ${SERVER_PORT} aktif & siap digunakan.`);
      return true;
    }
  }
  log(`Peringatan: Server belum merespons dalam 15 detik, cek data/server-autosync.log.`);
  return false;
}

function runViteBuild() {
  log('Menyusun ulang build produksi Vite SIVAKSIN (dist/)...');
  const viteBin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
  execSync(`"${process.execPath}" "${viteBin}" build`, {
    cwd: ROOT,
    stdio: 'inherit',
    timeout: 180000,
  });
  log('Build produksi Vite selesai tanpa error!');
}

function mergePackageJsonSafely(beforePkgRaw, incomingPkgRaw) {
  try {
    const beforePkg = JSON.parse(beforePkgRaw);
    const incomingPkg = JSON.parse(incomingPkgRaw);
    const mergedScripts = { ...(incomingPkg.scripts || {}) };
    const mergedDeps = { ...(incomingPkg.dependencies || {}) };
    let adjusted = false;

    for (const [key, expectedVal] of Object.entries(EXPECTED_SCRIPTS)) {
      if (mergedScripts[key] !== expectedVal) {
        mergedScripts[key] = expectedVal;
        adjusted = true;
      }
    }

    for (const pkgName of REQUIRED_BACKEND_DEPS) {
      if (beforePkg?.dependencies?.[pkgName] && !mergedDeps[pkgName]) {
        mergedDeps[pkgName] = beforePkg.dependencies[pkgName];
        adjusted = true;
      }
    }

    const beforeDeps = JSON.stringify({ d: beforePkg.dependencies, dd: beforePkg.devDependencies });
    const afterDeps = JSON.stringify({ d: mergedDeps, dd: incomingPkg.devDependencies || {} });

    if (!adjusted) {
      return { text: incomingPkgRaw, depsChanged: beforeDeps !== afterDeps, adjusted: false };
    }

    const merged = {
      ...incomingPkg,
      scripts: mergedScripts,
      dependencies: mergedDeps,
    };
    return {
      text: JSON.stringify(merged, null, 2) + '\n',
      depsChanged: beforeDeps !== afterDeps,
      adjusted: true,
    };
  } catch {
    return { text: beforePkgRaw, depsChanged: false, adjusted: true };
  }
}

function snapshotProtectedFiles() {
  const snapshots = new Map();
  const relFiles = new Set(PROTECTED_CORE_FILES);

  for (const dir of PROTECTED_DIRECTORIES) {
    const absDir = path.join(ROOT, dir);
    if (fs.existsSync(absDir)) {
      for (const entry of fs.readdirSync(absDir)) {
        const full = path.join(absDir, entry);
        if (fs.statSync(full).isFile()) {
          relFiles.add(`${dir}/${entry}`);
        }
      }
    }
  }

  for (const rel of relFiles) {
    const abs = path.join(ROOT, rel);
    if (fs.existsSync(abs)) {
      snapshots.set(rel, fs.readFileSync(abs, 'utf8'));
    }
  }
  return snapshots;
}

function protectAfterMerge(snapshots, beforePkgRaw) {
  let modifiedByGuard = false;

  // 1. Jaga file backend/sync/layanan lokal agar tidak terhapus oleh AI Studio
  for (const [rel, originalContent] of snapshots.entries()) {
    const abs = path.join(ROOT, rel);
    if (rel === '.gitignore' || rel === 'vite.config.ts') continue;
    if (!fs.existsSync(abs)) {
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, originalContent, 'utf8');
      log(`[Proteksi] Memulihkan file lokal yang terhapus saat sinkronisasi: ${rel}`);
      modifiedByGuard = true;
    }
  }

  // 2. Pastikan vite.config.ts tetap memiliki middleware /api lokal dan port 3003
  const viteCfgPath = path.join(ROOT, 'vite.config.ts');
  const viteSnap = snapshots.get('vite.config.ts');
  if (viteSnap) {
    const currentVite = fs.existsSync(viteCfgPath) ? fs.readFileSync(viteCfgPath, 'utf8') : '';
    if (!currentVite.includes('localApiPlugin') || !currentVite.includes(String(SERVER_PORT))) {
      fs.writeFileSync(viteCfgPath, viteSnap, 'utf8');
      log(`[Proteksi] Memulihkan vite.config.ts agar API lokal & port ${SERVER_PORT} tetap berjalan.`);
      modifiedByGuard = true;
    }
  }

  // 3. Pastikan .gitignore tetap mengecualikan DB pasien, uploads KTP/Paspor, .env*, dan scratch
  const gitignorePath = path.join(ROOT, '.gitignore');
  const currentIgnore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
  const missingRules = REQUIRED_GITIGNORE_LINES.filter(
    (rule) => !currentIgnore.split(/\r?\n/).some((line) => line.trim() === rule)
  );
  if (missingRules.length > 0) {
    const updatedIgnore = currentIgnore.trimEnd() + '\n\n# Proteksi Otomatis\n' + missingRules.join('\n') + '\n';
    fs.writeFileSync(gitignorePath, updatedIgnore, 'utf8');
    log(`[Proteksi] Menjaga aturan privasi .gitignore (${missingRules.join(', ')}).`);
    modifiedByGuard = true;
  }

  // 4. Gabungkan package.json dengan aman (pertahankan script start/dev port 3003 & deps server)
  const pkgPath = path.join(ROOT, 'package.json');
  const incomingPkgRaw = fs.existsSync(pkgPath) ? fs.readFileSync(pkgPath, 'utf8') : beforePkgRaw;
  const pkgResult = mergePackageJsonSafely(beforePkgRaw, incomingPkgRaw);
  if (pkgResult.adjusted) {
    fs.writeFileSync(pkgPath, pkgResult.text, 'utf8');
    log('[Proteksi] Menyesuaikan script & dependensi server lokal pada package.json.');
    modifiedByGuard = true;
  }

  return { modifiedByGuard, depsChanged: pkgResult.depsChanged };
}

function unstageForbiddenFiles() {
  let staged = [];
  try {
    const out = runGitRaw('diff --cached --name-only -z', 5000);
    staged = out ? out.split('\0').map((s) => s.trim()).filter(Boolean) : [];
  } catch {
    return [];
  }

  const safeFiles = [];
  for (const rel of staged) {
    const normalized = rel.replace(/\\/g, '/');
    if (FORBIDDEN_STAGE_PATTERNS.some((re) => re.test(normalized))) {
      try {
        execSync(`git reset HEAD -- "${rel.replace(/"/g, '\\"')}"`, { cwd: ROOT, stdio: 'ignore' });
        log(`[Keamanan] Melewati file sensitif/runtime agar tidak terunggah ke GitHub: ${normalized}`);
      } catch {
        // Ignore
      }
    } else {
      safeFiles.push(normalized);
    }
  }
  return safeFiles;
}

function parseDirtyStatusPaths() {
  const out = runGitRaw('status --porcelain=v1 -z -uall', 8000);
  if (!out) return [];
  const tokens = out.split('\0');
  const files = [];

  for (let i = 0; i < tokens.length; i++) {
    const entry = tokens[i];
    if (!entry || entry.length < 4) continue;
    const x = entry[0];
    const filePath = entry.slice(3).replace(/\\/g, '/');
    if (x === 'R' || x === 'C') {
      i++; // Skip secondary original path token
    }
    if (filePath && !FORBIDDEN_STAGE_PATTERNS.some((re) => re.test(filePath))) {
      files.push(filePath);
    }
  }
  return files;
}

function getNewestMtimeMs(relPaths) {
  let newest = 0;
  for (const rel of relPaths) {
    const abs = path.join(ROOT, rel);
    try {
      if (fs.existsSync(abs)) {
        const st = fs.statSync(abs);
        if (st.mtimeMs > newest) newest = st.mtimeMs;
      }
    } catch {
      // Ignore deleted/inaccessible files
    }
  }
  return newest;
}

function isAlreadyAncestor(commitHash) {
  if (!commitHash) return false;
  try {
    execSync(`git merge-base --is-ancestor ${commitHash} HEAD`, {
      cwd: ROOT,
      stdio: 'ignore',
      timeout: 3000,
    });
    return true;
  } catch {
    return false;
  }
}

function hasActiveGitOperation() {
  const gitDir = path.join(ROOT, '.git');
  return (
    fs.existsSync(path.join(gitDir, 'index.lock')) ||
    fs.existsSync(path.join(gitDir, 'MERGE_HEAD')) ||
    fs.existsSync(path.join(gitDir, 'REBASE_HEAD'))
  );
}

function pathsRequireBuild(relPaths) {
  return relPaths.some((p) =>
    /^(src\/|public\/(?!uploads\/)|index\.html$|vite\.config\.ts$|tsconfig\.json$|package\.json$)/i.test(p)
  );
}

function pathsRequireServerRestart(relPaths) {
  return relPaths.some((p) => /^(server\.js$|server\/|\.env|vite\.config\.ts$|package\.json$)/i.test(p));
}

function buildCommitSummary(files) {
  const names = files.map((f) => path.basename(f));
  const preview = names.slice(0, 3).join(', ');
  const extra = names.length > 3 ? ` +${names.length - 3} file lainnya` : '';
  return `chore(auto-sync): update ${preview}${extra}`;
}

async function applyRemotePull({ quietWhenUpToDate = false, quickTimeoutMs = 6000, ensureServer = false } = {}) {
  let remoteHash = '';
  let headHash = '';

  try {
    const lsRemote = runGit('ls-remote origin refs/heads/main', quickTimeoutMs);
    remoteHash = (lsRemote.split(/\s+/)[0] || '').trim();
    if (!remoteHash) {
      if (!quietWhenUpToDate) log('Tidak mendapat respons hash dari GitHub (mungkin offline).');
      return { updated: false, offline: true };
    }
    headHash = runGit('rev-parse HEAD', 3000);
  } catch {
    if (!quietWhenUpToDate) log('Lewati pemeriksaan GitHub (jaringan offline atau timeout).');
    return { updated: false, offline: true };
  }

  if (remoteHash === headHash || isAlreadyAncestor(remoteHash)) {
    if (!quietWhenUpToDate) log('Aplikasi SIVAKSIN sudah sinkron dengan versi terbaru di GitHub.');
    if (ensureServer && getPortPids(SERVER_PORT).length === 0) {
      await startServerAndWarmup();
    }
    return { updated: false };
  }

  log(`Terdeteksi pembaruan baru dari AI Studio / GitHub (${remoteHash.slice(0, 7)})! Mengambil pembaruan...`);

  const snapshots = snapshotProtectedFiles();
  const beforePkgRaw = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8');

  try {
    runGit('fetch origin main', 25000);
    const behindCount = Number(runGit('rev-list --count HEAD..origin/main', 3000) || '0');
    if (behindCount === 0) {
      return { updated: false };
    }

    const incomingPathsRaw = runGit('diff --name-only HEAD..origin/main', 5000);
    const incomingPaths = incomingPathsRaw ? incomingPathsRaw.split(/\r?\n/).filter(Boolean) : [];

    let canFf = false;
    try {
      execSync('git merge-base --is-ancestor HEAD origin/main', { cwd: ROOT, stdio: 'ignore', timeout: 3000 });
      canFf = true;
    } catch {
      canFf = false;
    }

    let createdMergeCommit = false;
    if (canFf) {
      runGit('merge --ff-only origin/main', 20000);
    } else {
      try {
        runGit('merge origin/main --no-commit --no-ff -X theirs', 25000);
        createdMergeCommit = true;
      } catch (mergeErr) {
        try {
          runGit('merge --abort', 5000);
        } catch {
          // Ignore
        }
        log(`Gagal merge otomatis dari GitHub: ${mergeErr.message}`);
        return { updated: false, error: mergeErr.message };
      }
    }

    const { modifiedByGuard, depsChanged } = protectAfterMerge(snapshots, beforePkgRaw);

    if (createdMergeCommit || modifiedByGuard) {
      runGit('add -A', 10000);
      const stagedSafe = unstageForbiddenFiles();
      if (createdMergeCommit || stagedSafe.length > 0) {
        runGit('commit -m "chore(sync): tarik pembaruan AI Studio & pertahankan server lokal RS"', 10000);
        try {
          runGit('push origin main', 25000);
          log('Penyesuaian konfigurasi lokal kembali disinkronkan ke GitHub.');
        } catch {
          log('Pembaruan lokal tersimpan, push balik ke GitHub akan dilanjutkan saat koneksi siap.');
        }
      }
    }

    if (depsChanged) {
      log('Menginstal dependensi baru dari package.json...');
      execSync('npm install --no-audit --no-fund', { cwd: ROOT, stdio: 'inherit', timeout: 180000 });
    }

    const distIndex = path.join(ROOT, 'dist', 'index.html');
    const needBuild = pathsRequireBuild(incomingPaths) || !fs.existsSync(distIndex);
    const needRestart = needBuild || pathsRequireServerRestart(incomingPaths);
    const wasRunning = getPortPids(SERVER_PORT).length > 0;

    if (needBuild) {
      if (wasRunning) stopPortServer(SERVER_PORT);
      runViteBuild();
    } else if (needRestart && wasRunning) {
      stopPortServer(SERVER_PORT);
    }

    if (wasRunning || ensureServer) {
      if (getPortPids(SERVER_PORT).length === 0) {
        await startServerAndWarmup();
      }
    }

    log(`Sinkronisasi dari GitHub / AI Studio selesai (${incomingPaths.length} file diperbarui).`);
    return { updated: true };
  } catch (err) {
    log(`Terjadi kesalahan saat menarik pembaruan GitHub: ${err.message}`);
    try {
      runGit('merge --abort', 5000);
    } catch {
      // Ignore
    }
    return { updated: false, error: err.message };
  }
}

async function pushLocalChangesIfReady({ forceImmediate = false } = {}) {
  const dirtyPaths = parseDirtyStatusPaths();
  let committedNow = false;

  if (dirtyPaths.length > 0) {
    const newestMtime = getNewestMtimeMs(dirtyPaths);
    if (!forceImmediate && newestMtime > 0 && Date.now() - newestMtime < QUIET_PUSH_WINDOW_MS) {
      return { pushed: false, waitingDebounce: true };
    }

    runGit('add -A', 10000);
    const safeStaged = unstageForbiddenFiles();
    if (safeStaged.length > 0) {
      const msg = buildCommitSummary(safeStaged);
      execSync(`git commit -m "${msg.replace(/"/g, '\\"')}"`, {
        cwd: ROOT,
        encoding: 'utf8',
        timeout: 15000,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      committedNow = true;
      log(`[Auto-Push] Commit perubahan lokal: ${msg}`);

      // Pastikan dist/ terbarui juga jika kode UI berubah & server berjalan
      const distIndex = path.join(ROOT, 'dist', 'index.html');
      const distStale =
        !fs.existsSync(distIndex) ||
        fs.statSync(distIndex).mtimeMs + 2000 < newestMtime;
      const serverRunning = getPortPids(SERVER_PORT).length > 0;

      if (pathsRequireBuild(safeStaged) && distStale && serverRunning) {
        stopPortServer(SERVER_PORT);
        try {
          runViteBuild();
        } catch (buildErr) {
          log(`[Peringatan] Build otomatis gagal (server tetap akan dinyalakan): ${buildErr.message}`);
        }
        await startServerAndWarmup();
      } else if (pathsRequireServerRestart(safeStaged) && serverRunning) {
        stopPortServer(SERVER_PORT);
        await startServerAndWarmup();
      }
    }
  }

  let aheadCount = 0;
  try {
    aheadCount = Number(runGit('rev-list --count origin/main..HEAD', 4000) || '0');
  } catch {
    aheadCount = committedNow ? 1 : 0;
  }

  if (aheadCount === 0) {
    return { pushed: false };
  }

  let remoteHash = '';
  try {
    const lsRemote = runGit('ls-remote origin refs/heads/main', 6000);
    remoteHash = (lsRemote.split(/\s+/)[0] || '').trim();
  } catch {
    log('[Auto-Push] Jaringan offline, commit lokal disimpan dan akan otomatis di-push saat online.');
    return { pushed: false, offline: true };
  }

  if (remoteHash && !isAlreadyAncestor(remoteHash)) {
    log('[Auto-Push] Remote GitHub juga memiliki pembaruan baru, menggabungkan perubahan dengan aman...');
    const snapshots = snapshotProtectedFiles();
    const beforePkgRaw = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8');
    try {
      runGit('fetch origin main', 20000);
      runGit('merge origin/main --no-commit --no-ff -X ours', 20000);
      const { depsChanged } = protectAfterMerge(snapshots, beforePkgRaw);
      runGit('add -A', 10000);
      unstageForbiddenFiles();
      runGit('commit -m "chore(auto-sync): gabungkan pembaruan lokal & AI Studio"', 10000);
      if (depsChanged) {
        execSync('npm install --no-audit --no-fund', { cwd: ROOT, stdio: 'inherit', timeout: 180000 });
      }
      if (getPortPids(SERVER_PORT).length > 0) {
        stopPortServer(SERVER_PORT);
        runViteBuild();
        await startServerAndWarmup();
      }
    } catch (err) {
      try {
        runGit('merge --abort', 5000);
      } catch {
        // Ignore
      }
      log(`[Auto-Push] Gagal menggabungkan pembaruan remote: ${err.message}`);
      return { pushed: false, error: err.message };
    }
  }

  try {
    runGit('push origin main', 25000);
    const shortSha = runGit('rev-parse --short HEAD', 3000);
    log(`[Auto-Push] Berhasil mengunggah pembaruan ke GitHub (commit ${shortSha}).`);
    return { pushed: true, sha: shortSha };
  } catch (err) {
    log(`[Auto-Push] Gagal push ke GitHub (akan dicoba ulang otomatis): ${err.message}`);
    return { pushed: false, error: err.message };
  }
}

async function runWatchTick() {
  if (cycleActive) return;
  if (hasActiveGitOperation()) return;
  cycleActive = true;
  try {
    const pushRes = await pushLocalChangesIfReady({ forceImmediate: false });
    if (!pushRes.waitingDebounce) {
      await applyRemotePull({ quietWhenUpToDate: true, quickTimeoutMs: 5000, ensureServer: false });
    }
  } finally {
    cycleActive = false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Penggunaan: node scripts/sync-github.js [--watch | --push | --pull | --startup | --ensure-server]');
    return;
  }

  const isStartup = args.includes('--startup');
  const isWatch = args.includes('--watch');
  const isPush = args.includes('--push');
  const isEnsureServer = args.includes('--ensure-server') || args.includes('--pull');

  if (isWatch) {
    if (!acquireWatchLock()) {
      console.log('Auto-Sync GitHub SIVAKSIN sudah berjalan di latar belakang.');
      process.exit(0);
    }
    log('Auto-Sync 2-Arah GitHub <-> SIVAKSIN aktif (Auto-Push lokal & Auto-Pull AI Studio setiap 15 detik)...');
    await runWatchTick();
    setInterval(runWatchTick, WATCH_INTERVAL_MS);
    return;
  }

  if (isPush) {
    const res = await pushLocalChangesIfReady({ forceImmediate: true });
    if (!res.pushed && !res.error) {
      log('Tidak ada perubahan baru yang perlu di-push ke GitHub.');
    }
    return;
  }

  await applyRemotePull({
    quietWhenUpToDate: isStartup,
    quickTimeoutMs: isStartup ? 4000 : 10000,
    ensureServer: isEnsureServer,
  });
}

main().catch((err) => {
  log(`[AutoSync Fatal]: ${err.message}`);
  process.exit(1);
});
