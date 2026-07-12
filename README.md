<div align="center">
  <img src="assets/logo.png" width="110" alt="Null logo" />

  # NullEyesRest

  **Fullscreen eye-rest reminder (20-20-20 rule) by Null**

  *Every 20 minutes it takes over your screen and makes you look into the distance for 20 seconds.
  The only way to close it is to type the unlock phrase.*
</div>

---

## ✨ Features

- ⏰ **Automatic breaks** — a fullscreen overlay opens on a timer (default: every 20 minutes)
- 🔒 **Phrase lock** — the overlay cannot be closed with Alt+F4, Esc, or the mouse; you must type the unlock phrase (default: `Yes, I got some rest`)
- ⏳ **Forced rest** — the input field appears only *after* a 20-second neon countdown ring finishes
- 🖥️ **Live timer** — the settings window shows a countdown to the next break
- 🔔 **Toast notifications** — on startup and after every break ("next break in N min")
- 🌐 **English / Russian UI** — switchable in settings
- 💾 **Persistent settings** — interval, rest duration, phrase and language survive restarts
- 🚀 **Autostart** — one command installs autostart (niri `spawn-at-startup`, XDG autostart, Windows registry)
- 🎨 **iOS-style dark UI** in the Null neon palette (cyan → blue → purple on deep navy)
- 🐧🪟 **Cross-platform** — Linux (Wayland/niri and X11) and Windows, plain Electron + HTML/CSS/JS

## 📦 Requirements

- [Node.js](https://nodejs.org/) 18+ (npm included)
- Linux (Wayland or X11) or Windows 10/11

## 🚀 Install & run

```bash
git clone https://github.com/nullspectredev/NullEyesRest.git
cd NullEyesRest
npm install
npm start
```

On start you'll see a toast in the corner: *"NullEyesRest is running — next eye break in 20 min."*
The app keeps running in the background (with a tray icon if your bar supports tray).

Other launch commands:

| Command | What it does |
|---|---|
| `npm start` | Run attached to the terminal |
| `npm run start:quiet` | Same, but hides harmless Fontconfig/GLib warnings (Linux) |
| `npm run start:bg` | Run detached in the background — survives closing the terminal (Linux) |

> ⚠️ `npm start` ties the app to your terminal — close the terminal and the app dies.
> Use `npm run start:bg` for manual background launches, or just install autostart (below).

## 🔁 Autostart

```bash
npm run autostart          # install
npm run autostart:remove   # remove
```

What it does:

- **Linux:** writes `~/.config/autostart/nulleyesrest.desktop` (GNOME/KDE/etc.) **and**, if `~/.config/niri/config.kdl` exists, appends a `spawn-at-startup` line (a backup `config.kdl.bak-nulleyesrest` is created first)
- **Windows:** adds a `NullEyesRest` value to `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`

## ⚙️ Settings

Open settings any of these ways:

- **tray icon → Settings** (needs a tray host, e.g. waybar)
- run **`npm start` again** while the app is already running — the second instance opens the Settings window

| Setting | Default |
|---|---|
| Break every (minutes) | `20` |
| Rest duration (seconds) | `20` |
| Unlock phrase | `Yes, I got some rest` |
| Language | `English` (English / Русский) |

Settings are saved to the Electron user-data dir (`~/.config/nulleyesrest/config.json` on Linux,
`%APPDATA%\nulleyesrest\config.json` on Windows) and survive restarts.
Saving restarts the break timer.

## 🧠 How it works

1. A background timer counts down the configured interval.
2. When it fires, a **fullscreen, always-on-top, kiosk window** opens. It has no frame, ignores Esc/F11/Ctrl+W, refuses to close, and grabs focus back if it loses it.
3. A neon **countdown ring** runs for the rest duration — no input is shown yet, so you actually rest.
4. After the countdown: *"If you have rested, type: **Yes, I got some rest**"*.
5. Type the exact phrase → the overlay unlocks, the timer restarts, and a toast tells you when the next break is.

Project layout:

```
main.js               # main process: timer, windows, tray, config
preload.js            # secure IPC bridge (contextIsolation)
i18n.js               # EN/RU UI strings
renderer/
  overlay.html        # fullscreen break screen
  settings.html       # settings window + live "next break" timer
  toast.html          # corner notifications
  style.css           # shared iOS-style neon theme
scripts/autostart.js  # cross-platform autostart installer
assets/logo.png       # Null logo
```

---

## 🇷🇺 Русский

**NullEyesRest** — напоминалка для отдыха глаз (правило 20-20-20). Каждые 20 минут открывает окно на весь экран и заставляет посмотреть вдаль 20 секунд. Закрыть окно можно только введя ключевую фразу.

### Установка и запуск

```bash
git clone https://github.com/nullspectredev/NullEyesRest.git
cd NullEyesRest
npm install
npm start
```

- `npm run start:bg` — запуск в фоне, не привязан к терминалу (Linux)
- `npm run autostart` — добавить в автозапуск (niri / XDG / реестр Windows)
- `npm run autostart:remove` — убрать из автозапуска

### Настройки

Открыть настройки: иконка в трее → Settings, **или** просто выполнить `npm start` ещё раз, пока приложение работает.

Можно поменять: интервал перерывов (по умолчанию 20 мин), длительность отдыха (20 сек), фразу разблокировки (`Yes, I got some rest`) и **язык интерфейса (English / Русский)**. Всё сохраняется между перезапусками.

### Как это работает

Открывается полноэкранное окно поверх всего, которое нельзя закрыть крестиком, Esc или Alt+F4. Сначала идёт отсчёт отдыха (поле ввода появляется только после него), затем нужно ввести точную фразу — только тогда окно закроется и таймер запустится заново.

---

<div align="center">
  Made with 💙 by <b>Null</b>
</div>
