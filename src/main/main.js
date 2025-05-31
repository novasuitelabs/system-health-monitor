const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const si = require('systeminformation');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../../assets/icon.png'),
    titleBarStyle: 'default',
    autoHideMenuBar: true,
    show: false
  });
  const startUrl = isDev 
    ? `file://${path.join(__dirname, '../../dist/index.html')}`
    : `file://${path.join(__dirname, '../../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  
  // Initialize auto-updater (only in production)
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
  if (mainWindow) {
    mainWindow.webContents.send('update-checking');
  }
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available.');
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.');
  if (mainWindow) {
    mainWindow.webContents.send('update-not-available', info);
  }
});

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err);
  if (mainWindow) {
    mainWindow.webContents.send('update-error', err.message);
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
  if (mainWindow) {
    mainWindow.webContents.send('update-download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }
});

// IPC handlers for system information
ipcMain.handle('get-system-info', async () => {
  try {
    const [cpu, mem, osInfo, diskLayout, processes] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.diskLayout(),
      si.processes()
    ]);

    return {
      cpu,
      memory: mem,
      os: osInfo,
      disks: diskLayout,
      processes: processes.list.slice(0, 20) // Top 20 processes
    };
  } catch (error) {
    console.error('Error getting system info:', error);
    return null;
  }
});

ipcMain.handle('get-system-stats', async () => {
  try {
    const [cpuLoad, memUsage, diskUsage, networkStats] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats()
    ]);

    return {
      cpu: {
        usage: cpuLoad.currentLoad,
        cores: cpuLoad.cpus
      },
      memory: {
        total: memUsage.total,
        used: memUsage.used,
        free: memUsage.free,
        usage: (memUsage.used / memUsage.total) * 100
      },
      disks: diskUsage,
      network: networkStats
    };
  } catch (error) {
    console.error('Error getting system stats:', error);
    return null;
  }
});

ipcMain.handle('clean-temp-files', async () => {
  try {
    // This would implement actual temp file cleaning
    // For demo purposes, we'll simulate the operation
    return {
      success: true,
      filesDeleted: Math.floor(Math.random() * 100) + 50,
      spaceFreed: (Math.random() * 500 + 100).toFixed(2) + ' MB'
    };
  } catch (error) {
    console.error('Error cleaning temp files:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-startup-programs', async () => {
  try {
    // This would get actual startup programs
    // For demo purposes, return some example data
    return [
      { name: 'Microsoft Teams', enabled: true, impact: 'High' },
      { name: 'Spotify', enabled: true, impact: 'Medium' },
      { name: 'Adobe Updater', enabled: false, impact: 'Low' },
      { name: 'Windows Security', enabled: true, impact: 'Low' },
      { name: 'Steam', enabled: true, impact: 'High' }
    ];
  } catch (error) {
    console.error('Error getting startup programs:', error);
    return [];
  }
});

// Update-related IPC handlers
ipcMain.handle('check-for-updates', async () => {
  if (isDev) {
    return { 
      success: false, 
      message: 'Updates are not available in development mode',
      version: app.getVersion()
    };
  }
  
  try {
    const result = await autoUpdater.checkForUpdates();
    return { 
      success: true, 
      message: 'Checking for updates...',
      version: app.getVersion(),
      updateInfo: result?.updateInfo || null
    };
  } catch (error) {
    console.error('Error checking for updates:', error);
    return { 
      success: false, 
      error: error.message,
      version: app.getVersion()
    };
  }
});

ipcMain.handle('restart-and-install-update', () => {
  if (!isDev) {
    autoUpdater.quitAndInstall();
  } else {
    return { success: false, message: 'Not available in development mode' };
  }
});

ipcMain.handle('get-app-version', () => {
  return {
    version: app.getVersion(),
    name: app.getName(),
    isDev: isDev
  };
});
