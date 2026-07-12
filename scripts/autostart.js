#!/usr/bin/env node
/**
 * Installs / removes NullEyesRest autostart.
 *   npm run autostart          — install
 *   npm run autostart:remove   — remove
 *
 * Linux: writes an XDG autostart .desktop file AND (if found) adds a
 *        spawn-at-startup line to ~/.config/niri/config.kdl, since niri
 *        does not read XDG autostart on its own.
 * Windows: adds a value to HKCU\...\Run.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const remove = process.argv.includes('--remove');
const projectDir = path.resolve(__dirname, '..');
const electronBin = path.join(
  projectDir, 'node_modules', '.bin',
  process.platform === 'win32' ? 'electron.cmd' : 'electron'
);

if (!fs.existsSync(electronBin)) {
  console.error('Electron not found. Run "npm install" first.');
  process.exit(1);
}

const MARKER = '// NullEyesRest autostart';

function linux() {
  // 1) XDG autostart (works on GNOME/KDE/etc.)
  const autostartDir = path.join(os.homedir(), '.config', 'autostart');
  const desktopFile = path.join(autostartDir, 'nulleyesrest.desktop');

  if (remove) {
    if (fs.existsSync(desktopFile)) { fs.unlinkSync(desktopFile); console.log(`Removed ${desktopFile}`); }
  } else {
    fs.mkdirSync(autostartDir, { recursive: true });
    fs.writeFileSync(desktopFile, [
      '[Desktop Entry]',
      'Type=Application',
      'Name=NullEyesRest',
      'Comment=Eye rest reminder',
      `Exec="${electronBin}" "${projectDir}"`,
      `Icon=${path.join(projectDir, 'assets', 'logo.png')}`,
      'X-GNOME-Autostart-enabled=true',
      ''
    ].join('\n'));
    console.log(`Wrote ${desktopFile}`);
  }

  // 2) niri: spawn-at-startup in config.kdl
  const niriCfg = path.join(os.homedir(), '.config', 'niri', 'config.kdl');
  if (!fs.existsSync(niriCfg)) {
    if (!remove) console.log('niri config not found — skipped spawn-at-startup step.');
    return;
  }
  let cfg = fs.readFileSync(niriCfg, 'utf8');
  const line = `spawn-at-startup "${electronBin}" "${projectDir}" ${MARKER}`;

  if (remove) {
    const cleaned = cfg.split('\n').filter((l) => !l.includes(MARKER)).join('\n');
    if (cleaned !== cfg) {
      fs.writeFileSync(niriCfg, cleaned);
      console.log(`Removed spawn-at-startup line from ${niriCfg}`);
    }
  } else if (cfg.includes(MARKER)) {
    console.log('niri spawn-at-startup already present.');
  } else {
    fs.copyFileSync(niriCfg, niriCfg + '.bak-nulleyesrest');
    fs.writeFileSync(niriCfg, cfg.replace(/\n*$/, '\n') + line + '\n');
    console.log(`Added spawn-at-startup to ${niriCfg} (backup: config.kdl.bak-nulleyesrest)`);
  }
}

function windows() {
  const KEY = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
  if (remove) {
    try {
      execFileSync('reg', ['delete', KEY, '/v', 'NullEyesRest', '/f'], { stdio: 'inherit' });
    } catch { /* not installed */ }
  } else {
    execFileSync('reg', [
      'add', KEY, '/v', 'NullEyesRest', '/t', 'REG_SZ',
      '/d', `"${electronBin}" "${projectDir}"`, '/f'
    ], { stdio: 'inherit' });
    console.log('Added NullEyesRest to Windows startup (registry Run key).');
  }
}

if (process.platform === 'linux') linux();
else if (process.platform === 'win32') windows();
else console.log(`Autostart not implemented for platform: ${process.platform}`);

console.log(remove ? 'Autostart removed.' : 'Autostart installed.');
