const { app, BrowserWindow, ipcMain } = require('electron');
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

app.whenReady().then(createWindow);

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
