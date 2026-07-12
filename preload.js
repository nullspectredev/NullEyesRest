const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('neye', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  getStatus: () => ipcRenderer.invoke('get-status'),
  saveConfig: (cfg) => ipcRenderer.invoke('save-config', cfg),
  tryUnlock: (phrase) => ipcRenderer.invoke('try-unlock', phrase),
  closeSettings: () => ipcRenderer.send('close-settings'),
  breakNow: () => ipcRenderer.send('break-now')
});
