const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
  cleanTempFiles: () => ipcRenderer.invoke('clean-temp-files'),
  getStartupPrograms: () => ipcRenderer.invoke('get-startup-programs'),
  updateStartupProgram: (id, enabled) => ipcRenderer.invoke('update-startup-program', id, enabled),
  runPerformanceOptimization: (type) => ipcRenderer.invoke('run-performance-optimization', type),
  
  // Settings-related functions
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSetting: (key, value) => ipcRenderer.invoke('save-setting', key, value),
  getStartWithWindows: () => ipcRenderer.invoke('get-start-with-windows'),
  setStartWithWindows: (enabled) => ipcRenderer.invoke('set-start-with-windows', enabled),
  
  // Update-related functions
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  restartAndInstallUpdate: () => ipcRenderer.invoke('restart-and-install-update'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Update event listeners
  onUpdateChecking: (callback) => ipcRenderer.on('update-checking', callback),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', callback),
  onUpdateError: (callback) => ipcRenderer.on('update-error', callback),
  onUpdateDownloadProgress: (callback) => ipcRenderer.on('update-download-progress', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  
  // Remove event listeners
  removeAllUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update-checking');
    ipcRenderer.removeAllListeners('update-available');
    ipcRenderer.removeAllListeners('update-not-available');
    ipcRenderer.removeAllListeners('update-error');
    ipcRenderer.removeAllListeners('update-download-progress');
    ipcRenderer.removeAllListeners('update-downloaded');
  }
});
