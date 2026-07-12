// NullEyesRest UI strings (used by both main process and renderer pages)
const STRINGS = {
  en: {
    // Overlay
    overlayTitle: 'Time to rest your eyes',
    overlaySubtitle: 'Step away from the screen and look at something far away (about 20 feet / 6 meters) for {sec} seconds. Blink slowly. Relax your shoulders.',
    overlayHint: 'If you have rested, type:',
    overlayPlaceholder: 'Type the phrase here…',
    overlayUnlock: 'Unlock',
    overlayError: 'That is not the phrase. Rest a little more, then try again.',
    // Settings
    settingsSub: 'Settings',
    nextBreakIn: 'Next eye break in',
    breakNow: 'NOW',
    intervalLabel: 'Break every (minutes)',
    restLabel: 'Rest duration (seconds)',
    phraseLabel: 'Unlock phrase',
    phraseNote: 'You will have to type this exactly to close the break screen.',
    languageLabel: 'Language',
    save: 'Save',
    takeBreak: 'Take a break now',
    saved: '✓ Saved — timer restarted',
    // Toasts
    toastRunning: 'NullEyesRest is running — next eye break in {n} min.',
    toastSaved: 'Settings saved — next eye break in {n} min.',
    toastUnlocked: 'Nice! Next eye break in {n} min.',
    // Tray
    trayNext: 'Next break: {time}',
    trayInProgress: 'Break in progress…',
    trayBreakNow: 'Take a break now',
    traySettings: 'Settings',
    trayQuit: 'Quit'
  },
  ru: {
    // Оверлей
    overlayTitle: 'Время дать глазам отдохнуть',
    overlaySubtitle: 'Отойдите от экрана и посмотрите на что-нибудь вдалеке (примерно 6 метров) в течение {sec} секунд. Медленно моргайте. Расслабьте плечи.',
    overlayHint: 'Если вы отдохнули, напишите:',
    overlayPlaceholder: 'Введите фразу здесь…',
    overlayUnlock: 'Открыть',
    overlayError: 'Это не та фраза. Отдохните ещё немного и попробуйте снова.',
    // Настройки
    settingsSub: 'Настройки',
    nextBreakIn: 'До следующего перерыва',
    breakNow: 'СЕЙЧАС',
    intervalLabel: 'Перерыв каждые (минут)',
    restLabel: 'Длительность отдыха (секунд)',
    phraseLabel: 'Фраза разблокировки',
    phraseNote: 'Чтобы закрыть экран перерыва, нужно ввести её точно.',
    languageLabel: 'Язык',
    save: 'Сохранить',
    takeBreak: 'Сделать перерыв сейчас',
    saved: '✓ Сохранено — таймер перезапущен',
    // Тосты
    toastRunning: 'NullEyesRest запущен — следующий перерыв через {n} мин.',
    toastSaved: 'Настройки сохранены — следующий перерыв через {n} мин.',
    toastUnlocked: 'Отлично! Следующий перерыв через {n} мин.',
    // Трей
    trayNext: 'Следующий перерыв: {time}',
    trayInProgress: 'Идёт перерыв…',
    trayBreakNow: 'Сделать перерыв сейчас',
    traySettings: 'Настройки',
    trayQuit: 'Выйти'
  }
};

function t(lang, key, vars = {}) {
  let s = (STRINGS[lang] || STRINGS.en)[key] || STRINGS.en[key] || key;
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { STRINGS, t };
} else {
  window.i18n = { STRINGS, t };
}
