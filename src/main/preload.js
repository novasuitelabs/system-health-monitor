const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
  cleanTempFiles: () => ipcRenderer.invoke('clean-temp-files'),
  getStartupPrograms: () => ipcRenderer.invoke('get-startup-programs'),
});
