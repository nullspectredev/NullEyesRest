const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { t } = require('./i18n');

// Proper Wayland support (niri) with X11 fallback
app.commandLine.appendSwitch('ozone-platform-hint', 'auto');

const DEFAULTS = {
  intervalMinutes: 20,
  restSeconds: 20,
  phrase: 'Yes, I got some rest',
  language: 'en'
};

const tr = (key, vars) => t(config?.language || 'en', key, vars);

const configPath = () => path.join(app.getPath('userData'), 'config.json');

function loadConfig() {
  try {
    return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(configPath(), 'utf8')) };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveConfig(cfg) {
  fs.mkdirSync(path.dirname(configPath()), { recursive: true });
  fs.writeFileSync(configPath(), JSON.stringify(cfg, null, 2));
}

let config;
let breakTimer = null;
let nextBreakAt = null;
let overlayWin = null;
let settingsWin = null;
let toastWin = null;
let toastTimer = null;
let tray = null;
let overlayUnlocked = false;

function scheduleNextBreak() {
  if (breakTimer) clearTimeout(breakTimer);
  const ms = Math.max(1, config.intervalMinutes) * 60 * 1000;
  nextBreakAt = Date.now() + ms;
  breakTimer = setTimeout(openOverlay, ms);
  refreshTrayMenu();
}

function openOverlay() {
  if (overlayWin) return;
  overlayUnlocked = false;
  if (breakTimer) { clearTimeout(breakTimer); breakTimer = null; }
  nextBreakAt = null;

  const { width, height } = screen.getPrimaryDisplay().bounds;
  overlayWin = new BrowserWindow({
    width, height,
    fullscreen: true,
    kiosk: true,
    frame: false,
    closable: false,
    minimizable: false,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    backgroundColor: '#04060f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  overlayWin.setAlwaysOnTop(true, 'screen-saver');
  overlayWin.loadFile(path.join(__dirname, 'renderer', 'overlay.html'));

  // The only way out is the passphrase
  overlayWin.on('close', (e) => {
    if (!overlayUnlocked) e.preventDefault();
  });
  overlayWin.on('closed', () => { overlayWin = null; });
  overlayWin.on('blur', () => {
    if (overlayWin && !overlayUnlocked) overlayWin.focus();
  });
  refreshTrayMenu();
}

function showToast(message) {
  const { workArea } = screen.getPrimaryDisplay();
  const W = 380, H = 96, M = 16;
  if (toastWin) { clearTimeout(toastTimer); toastWin.destroy(); toastWin = null; }
  toastWin = new BrowserWindow({
    width: W, height: H,
    x: workArea.x + workArea.width - W - M,
    y: workArea.y + workArea.height - H - M,
    frame: false,
    transparent: true,
    resizable: false,
    focusable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });
  toastWin.loadFile(path.join(__dirname, 'renderer', 'toast.html'), { query: { msg: message } });
  toastWin.on('closed', () => { toastWin = null; });
  toastTimer = setTimeout(() => { if (toastWin) toastWin.close(); }, 6000);
}

function openSettings() {
  if (settingsWin) { settingsWin.focus(); return; }
  settingsWin = new BrowserWindow({
    width: 440, height: 820,
    frame: false,
    resizable: false,
    backgroundColor: '#04060f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });
  settingsWin.loadFile(path.join(__dirname, 'renderer', 'settings.html'));
  settingsWin.on('closed', () => { settingsWin = null; });
}

function refreshTrayMenu() {
  if (!tray) return;
  const nextLabel = nextBreakAt
    ? tr('trayNext', { time: new Date(nextBreakAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    : tr('trayInProgress');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'NullEyesRest', enabled: false },
    { label: nextLabel, enabled: false },
    { type: 'separator' },
    { label: tr('trayBreakNow'), click: openOverlay },
    { label: tr('traySettings'), click: openSettings },
    { type: 'separator' },
    { label: tr('trayQuit'), click: () => { app.exit(0); } }
  ]));
}

function createTray() {
  try {
    const icon = nativeImage
      .createFromPath(path.join(__dirname, 'assets', 'logo.png'))
      .resize({ width: 22, height: 22 });
    tray = new Tray(icon);
    tray.setToolTip('NullEyesRest');
    refreshTrayMenu();
  } catch {
    // No tray host available (bare niri without waybar etc.) — app still works
  }
}

// ---------- IPC ----------
ipcMain.handle('get-config', () => config);

ipcMain.handle('get-status', () => ({
  nextBreakAt,
  breakActive: !!overlayWin
}));

ipcMain.handle('save-config', (_e, next) => {
  config = {
    intervalMinutes: Math.max(1, parseInt(next.intervalMinutes, 10) || DEFAULTS.intervalMinutes),
    restSeconds: Math.max(5, parseInt(next.restSeconds, 10) || DEFAULTS.restSeconds),
    phrase: String(next.phrase || '').trim() || DEFAULTS.phrase,
    language: ['en', 'ru'].includes(next.language) ? next.language : DEFAULTS.language
  };
  saveConfig(config);
  scheduleNextBreak();
  showToast(tr('toastSaved', { n: config.intervalMinutes }));
  return config;
});

ipcMain.handle('try-unlock', (_e, phrase) => {
  const ok = String(phrase).trim() === config.phrase;
  if (ok && overlayWin) {
    overlayUnlocked = true;
    overlayWin.close();
    scheduleNextBreak();
    showToast(tr('toastUnlocked', { n: config.intervalMinutes }));
  }
  return ok;
});

ipcMain.on('close-settings', () => { if (settingsWin) settingsWin.close(); });
ipcMain.on('break-now', () => { if (settingsWin) settingsWin.close(); openOverlay(); });

// ---------- App lifecycle ----------
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => openSettings());

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    config = loadConfig();
    createTray();
    scheduleNextBreak();
    showToast(tr('toastRunning', { n: config.intervalMinutes }));
  });

  app.on('window-all-closed', () => { /* keep running in background */ });
}
