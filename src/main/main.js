const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const si = require('systeminformation');
const fs = require('fs');
const { exec } = require('child_process');

let mainWindow;
let settingsPath;

// Settings handling
function getSettingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function loadSettings() {
  if (!settingsPath) {
    settingsPath = getSettingsPath();
  }
  
  try {
    return fs.existsSync(settingsPath) 
      ? JSON.parse(fs.readFileSync(settingsPath, 'utf8')) 
      : { startWithWindows: false, showNotifications: true };
  } catch (e) {
    console.error('Failed to read settings file:', e);
    return { startWithWindows: false, showNotifications: true };
  }
}

function saveSettings(settings) {
  if (!settingsPath) {
    settingsPath = getSettingsPath();
  }
  
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (e) {
    console.error('Failed to write settings file:', e);
    return false;
  }
}

// Helper function to manage startup with Windows
function setAutoLaunch(enabled) {
  const appFolder = path.dirname(process.execPath);
  const exeName = path.basename(process.execPath);
  const regKey = `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run`;
  
  if (isDev) {
    console.log('Auto-launch not available in development mode');
    return Promise.resolve({ success: true, isDev: true });
  }
  
  return new Promise((resolve) => {
    if (enabled) {
      exec(`reg add "${regKey}" /v "System Health Monitor" /t REG_SZ /d "${path.join(appFolder, exeName)}" /f`, (error) => {
        if (error) {
          console.error('Error setting registry key for auto-launch:', error);
          resolve({ success: false, error: error.message });
        } else {
          console.log('Auto-launch enabled');
          resolve({ success: true, enabled: true });
        }
      });
    } else {
      exec(`reg delete "${regKey}" /v "System Health Monitor" /f`, (error) => {
        if (error && !error.message.includes('not found')) {
          console.error('Error removing registry key for auto-launch:', error);
          resolve({ success: false, error: error.message });
        } else {
          console.log('Auto-launch disabled');
          resolve({ success: true, enabled: false });
        }
      });
    }
  });
}

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
    // In a real implementation, this would use native Windows commands or Node.js fs
    // For example, clearing %TEMP%, browser caches, etc.
    
    // For demo purposes, we'll simulate the operation with more realistic data
    // Simulate a slight delay to make it feel like work is being done
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const filesDeleted = Math.floor(Math.random() * 1000) + 500; // More realistic number
    const spaceFreed = (Math.random() * 2000 + 300).toFixed(2) + ' MB';
    
    return {
      success: true,
      filesDeleted: filesDeleted,
      spaceFreed: spaceFreed,
      details: [
        { location: 'Temporary Files', count: Math.floor(filesDeleted * 0.6), size: (parseFloat(spaceFreed) * 0.5).toFixed(2) + ' MB' },
        { location: 'Browser Cache', count: Math.floor(filesDeleted * 0.3), size: (parseFloat(spaceFreed) * 0.3).toFixed(2) + ' MB' },
        { location: 'Windows Update Cache', count: Math.floor(filesDeleted * 0.1), size: (parseFloat(spaceFreed) * 0.2).toFixed(2) + ' MB' }
      ]
    };
  } catch (error) {
    console.error('Error cleaning temp files:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-startup-programs', async () => {
  try {
    // This would get actual startup programs from Windows registry
    // For demo purposes, return some realistic example data
    return [
      { id: 'msft-teams', name: 'Microsoft Teams', enabled: true, impact: 'High', publisher: 'Microsoft Corporation', location: 'Registry: HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' },
      { id: 'spotify', name: 'Spotify', enabled: true, impact: 'Medium', publisher: 'Spotify AB', location: 'Registry: HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' },
      { id: 'adobe-updater', name: 'Adobe Updater', enabled: false, impact: 'Low', publisher: 'Adobe Inc.', location: 'Startup Folder' },
      { id: 'win-security', name: 'Windows Security', enabled: true, impact: 'Low', publisher: 'Microsoft Corporation', location: 'Registry: HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run' },
      { id: 'steam', name: 'Steam', enabled: true, impact: 'High', publisher: 'Valve Corporation', location: 'Registry: HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' },
      { id: 'discord', name: 'Discord', enabled: true, impact: 'Medium', publisher: 'Discord Inc.', location: 'Registry: HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' },
      { id: 'onedrive', name: 'Microsoft OneDrive', enabled: true, impact: 'Medium', publisher: 'Microsoft Corporation', location: 'Registry: HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' }
    ];
  } catch (error) {
    console.error('Error getting startup programs:', error);
    return [];
  }
});

ipcMain.handle('update-startup-program', async (event, id, enabled) => {
  try {
    // This would update the actual startup entry in Windows registry
    // For demo purposes, simulate success
    console.log(`Updated startup program ${id} to ${enabled ? 'enabled' : 'disabled'}`);
    return { success: true };
  } catch (error) {
    console.error(`Error updating startup program ${id}:`, error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('run-performance-optimization', async (event, type) => {
  try {
    // This would run actual system optimizations
    // For demo purposes, simulate different optimization types
    console.log(`Running performance optimization: ${type}`);
    
    // Simulate a delay based on optimization type
    let delay = 1000;
    switch (type) {
      case 'memory':
        delay = 2000;
        break;
      case 'network':
        delay = 1500;
        break;
      case 'disk':
        delay = 2500;
        break;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return { 
      success: true, 
      type: type,
      details: getOptimizationDetails(type)
    };
  } catch (error) {
    console.error(`Error running performance optimization ${type}:`, error);
    return { success: false, error: error.message };
  }
});

function getOptimizationDetails(type) {
  switch (type) {
    case 'memory':
      return {
        before: Math.floor(Math.random() * 20) + 70, // 70-90% usage before
        after: Math.floor(Math.random() * 20) + 40, // 40-60% usage after
        description: 'Optimized memory usage by clearing unused cache and compacting working sets'
      };
    case 'network':
      return {
        before: Math.floor(Math.random() * 30) + 60, // 60-90ms latency before
        after: Math.floor(Math.random() * 20) + 30, // 30-50ms latency after
        description: 'Optimized network configuration and DNS settings'
      };
    case 'disk':
      return {
        before: Math.floor(Math.random() * 20) + 70, // 70-90% fragmentation before
        after: Math.floor(Math.random() * 10) + 10, // 10-20% fragmentation after
        description: 'Optimized disk performance by defragmenting system files and optimizing storage'
      };
    default:
      return {
        description: 'General system performance optimization completed'
      };
  }
}

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

// Settings IPC handlers
ipcMain.handle('get-settings', () => {
  return loadSettings();
});

ipcMain.handle('save-setting', (event, key, value) => {
  const settings = loadSettings();
  settings[key] = value;
  return saveSettings(settings);
});

ipcMain.handle('get-start-with-windows', async () => {
  const settings = loadSettings();
  return { enabled: settings.startWithWindows };
});

ipcMain.handle('set-start-with-windows', async (event, enabled) => {
  try {
    const result = await setAutoLaunch(enabled);
    if (result.success) {
      // Only update settings if registry changes succeeded
      const settings = loadSettings();
      settings.startWithWindows = enabled;
      saveSettings(settings);
    }
    return result;
  } catch (error) {
    console.error('Error setting auto-launch:', error);
    return { success: false, error: error.message };
  }
});
