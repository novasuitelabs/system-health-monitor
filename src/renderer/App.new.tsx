import React, { useState, useEffect } from 'react';

interface SystemStats {
  cpu: {
    usage: number;
    cores: any[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disks: any[];
  network: any[];
}

interface SystemInfo {
  cpu: any;
  memory: any;
  os: any;
  disks: any[];
  processes: any[];
}

interface StartupProgram {
  name: string;
  enabled: boolean;
  impact: string;
}

declare global {
  interface Window {
    electronAPI: {
      getSystemInfo: () => Promise<SystemInfo | null>;
      getSystemStats: () => Promise<SystemStats | null>;
      cleanTempFiles: () => Promise<any>;
      getStartupPrograms: () => Promise<StartupProgram[]>;
      
      // Update-related functions
      checkForUpdates: () => Promise<any>;
      restartAndInstallUpdate: () => Promise<any>;
      getAppVersion: () => Promise<any>;
      
      // Update event listeners
      onUpdateChecking: (callback: () => void) => void;
      onUpdateAvailable: (callback: (event: any, info: any) => void) => void;
      onUpdateNotAvailable: (callback: (event: any, info: any) => void) => void;
      onUpdateError: (callback: (event: any, error: string) => void) => void;
      onUpdateDownloadProgress: (callback: (event: any, progress: any) => void) => void;
      onUpdateDownloaded: (callback: (event: any, info: any) => void) => void;
      removeAllUpdateListeners: () => void;
    };
  }
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [startupPrograms, setStartupPrograms] = useState<StartupProgram[]>([]);
  const [cleanupResult, setCleanupResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isOnline, setIsOnline] = useState(true);
  
  // Update-related state
  const [updateStatus, setUpdateStatus] = useState<string>('idle');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [downloadProgress, setDownloadProgress] = useState<any>(null);
  const [appVersion, setAppVersion] = useState<string>('1.0.0');

  useEffect(() => {
    loadSystemData();
    setupUpdateListeners();
    loadAppVersion();
    
    const interval = setInterval(loadSystemStats, 3000);
    return () => {
      clearInterval(interval);
      window.electronAPI.removeAllUpdateListeners();
    };
  }, []);

  const loadSystemData = async () => {
    try {
      setError(null);
      const [stats, info, startup] = await Promise.all([
        window.electronAPI.getSystemStats(),
        window.electronAPI.getSystemInfo(),
        window.electronAPI.getStartupPrograms()
      ]);
      
      if (!stats || !info) {
        throw new Error('Failed to load system information');
      }
      
      setSystemStats(stats);
      setSystemInfo(info);
      setStartupPrograms(startup || []);
      setLastUpdate(new Date());
      setLoading(false);
      setIsOnline(true);
    } catch (error) {
      console.error('Error loading system data:', error);
      setError('Failed to load system information. Please restart the application.');
      setLoading(false);
      setIsOnline(false);
    }
  };

  const loadSystemStats = async () => {
    try {
      const stats = await window.electronAPI.getSystemStats();
      if (stats) {
        setSystemStats(stats);
        setLastUpdate(new Date());
        setIsOnline(true);
        setError(null);
      }
    } catch (error) {
      console.error('Error loading system stats:', error);
      setIsOnline(false);
    }
  };

  const handleCleanup = async () => {
    try {
      setCleanupResult({ loading: true });
      const result = await window.electronAPI.cleanTempFiles();
      setCleanupResult(result);
      
      // Refresh system stats after cleanup
      setTimeout(loadSystemStats, 1000);
    } catch (error) {
      console.error('Error cleaning temp files:', error);
      setCleanupResult({ 
        success: false, 
        error: 'Failed to clean temporary files. Please try again.' 
      });
    }
  };

  const getHealthScore = (): { score: number; status: string; color: string } => {
    if (!systemStats) return { score: 0, status: 'Unknown', color: '#6b7280' };
    
    const cpuScore = Math.max(0, 100 - systemStats.cpu.usage);
    const memoryScore = Math.max(0, 100 - systemStats.memory.usage);
    const avgScore = (cpuScore + memoryScore) / 2;
    
    if (avgScore >= 80) return { score: avgScore, status: 'Excellent', color: '#10b981' };
    if (avgScore >= 60) return { score: avgScore, status: 'Good', color: '#f59e0b' };
    if (avgScore >= 40) return { score: avgScore, status: 'Fair', color: '#f97316' };
    return { score: avgScore, status: 'Poor', color: '#ef4444' };
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderOverview = () => {
    const health = getHealthScore();
    
    return (
      <div>
        <div className="page-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">System Overview</h1>
              <p className="page-subtitle">Real-time monitoring of your system's health and performance</p>
            </div>
            <div className="health-indicator">
              <div className="health-score" style={{ color: health.color }}>
                {Math.round(health.score)}%
              </div>
              <div className="health-status" style={{ color: health.color }}>
                {health.status}
              </div>
              <div className="last-update">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
              <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
                {isOnline ? '🟢 Connected' : '🔴 Disconnected'}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button className="error-retry" onClick={loadSystemData}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading system information...</div>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card cpu-card">
                <div className="stat-header">
                  <span className="stat-title">CPU Usage</span>
                  <div className="stat-icon" style={{ background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)' }}>
                    🔥
                  </div>
                </div>
                <div className="stat-value">{systemStats?.cpu.usage.toFixed(1) || '0'}%</div>
                <div className="stat-description">
                  {systemInfo?.cpu.manufacturer} {systemInfo?.cpu.brand}
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${systemStats?.cpu.usage || 0}%`,
                      background: (systemStats?.cpu.usage || 0) > 80 ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
                    }}
                  ></div>
                </div>
                <div className="stat-cores">
                  {systemInfo?.cpu.cores} cores • {systemInfo?.cpu.physicalCores || 'Unknown'} physical
                </div>
              </div>

              <div className="stat-card memory-card">
                <div className="stat-header">
                  <span className="stat-title">Memory Usage</span>
                  <div className="stat-icon" style={{ background: 'linear-gradient(45deg, #10b981, #059669)' }}>
                    💾
                  </div>
                </div>
                <div className="stat-value">{systemStats?.memory.usage.toFixed(1) || '0'}%</div>
                <div className="stat-description">
                  {formatBytes(systemStats?.memory.used || 0)} of {formatBytes(systemStats?.memory.total || 0)}
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${systemStats?.memory.usage || 0}%`,
                      background: (systemStats?.memory.usage || 0) > 80 ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 'linear-gradient(90deg, #10b981, #059669)'
                    }}
                  ></div>
                </div>
                <div className="stat-cores">
                  {formatBytes(systemStats?.memory.free || 0)} available
                </div>
              </div>

              <div className="stat-card storage-card">
                <div className="stat-header">
                  <span className="stat-title">Storage</span>
                  <div className="stat-icon" style={{ background: 'linear-gradient(45deg, #f59e0b, #d97706)' }}>
                    💿
                  </div>
                </div>
                <div className="stat-value">
                  {systemStats?.disks.length || 0}
                </div>
                <div className="stat-description">
                  {(systemStats?.disks.length || 0) === 1 ? 'Drive' : 'Drives'} detected
                </div>
                <div className="disk-list">
                  {systemStats?.disks.slice(0, 3).map((disk: any, index: number) => (
                    <div key={index} className="disk-item">
                      <span className="disk-name">{disk.fs || `Disk ${index + 1}`}</span>
                      <span className="disk-usage">
                        {disk.use ? `${disk.use.toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stat-card system-card">
                <div className="stat-header">
                  <span className="stat-title">System Info</span>
                  <div className="stat-icon" style={{ background: 'linear-gradient(45deg, #8b5cf6, #7c3aed)' }}>
                    🖥️
                  </div>
                </div>
                <div className="stat-value">{systemInfo?.os.platform || 'Windows'}</div>
                <div className="stat-description">
                  {systemInfo?.os.distro} {systemInfo?.os.release}
                </div>
                <div className="system-details">
                  <div className="system-detail">
                    <span>Uptime:</span>
                    <span>{Math.floor((systemInfo?.os.uptime || 0) / 3600)}h</span>
                  </div>
                  <div className="system-detail">
                    <span>Arch:</span>
                    <span>{systemInfo?.os.arch}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="processes-table">
              <div className="table-header">
                <h3 className="table-title">Top Processes</h3>
                <div className="table-controls">
                  <button className="refresh-btn" onClick={loadSystemStats}>
                    🔄 Refresh
                  </button>
                </div>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Process Name</th>
                      <th>CPU %</th>
                      <th>Memory</th>
                      <th>PID</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemInfo?.processes.slice(0, 10).map((process: any, index: number) => (
                      <tr key={index} className={(process.cpu || 0) > 50 ? 'high-usage' : ''}>
                        <td className="process-name">
                          <div className="process-info">
                            <span className="process-title">{process.name}</span>
                            {(process.cpu || 0) > 50 && <span className="high-cpu-badge">HIGH CPU</span>}
                          </div>
                        </td>
                        <td className="cpu-usage">
                          <span className={(process.cpu || 0) > 50 ? 'warning' : ''}>
                            {process.cpu?.toFixed(1) || '0.0'}%
                          </span>
                        </td>
                        <td>{formatBytes(process.mem_rss || 0)}</td>
                        <td className="pid">{process.pid}</td>
                        <td>
                          <span className={`status-badge ${process.state || 'running'}`}>
                            {process.state || 'running'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderOptimization = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">System Optimization</h1>
        <p className="page-subtitle">Clean and optimize your system for better performance</p>
      </div>

      <div className="cleanup-section">
        <div className="cleanup-header">
          <h3 className="cleanup-title">Disk Cleanup</h3>
          <button className="action-button" onClick={handleCleanup} disabled={cleanupResult?.loading}>
            {cleanupResult?.loading ? '🔄 Cleaning...' : '🧹 Clean Temp Files'}
          </button>
        </div>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          Remove temporary files, cache, and other unnecessary data to free up disk space.
        </p>
        
        {cleanupResult && !cleanupResult.loading && (
          <div className={`cleanup-result ${cleanupResult.success ? 'success' : 'error'}`}>
            {cleanupResult.success ? (
              <>
                <strong>Cleanup Complete!</strong><br />
                Files deleted: {cleanupResult.filesDeleted}<br />
                Space freed: {cleanupResult.spaceFreed}
              </>
            ) : (
              <>
                <strong>Cleanup Failed</strong><br />
                {cleanupResult.error}
              </>
            )}
          </div>
        )}
      </div>

      <div className="processes-table">
        <div className="table-header">
          <h3 className="table-title">Startup Programs</h3>
          <p className="table-subtitle">Manage which programs start with Windows</p>
        </div>
        <div className="startup-list">
          {startupPrograms.map((program, index) => (
            <div key={index} className="startup-item">
              <div className="startup-info">
                <div className="startup-name">{program.name}</div>
                <div className={`startup-impact impact-${program.impact.toLowerCase()}`}>
                  Impact: {program.impact}
                </div>
              </div>
              <div 
                className={`toggle-switch ${program.enabled ? 'enabled' : ''}`}
                onClick={() => {
                  const updated = [...startupPrograms];
                  updated[index].enabled = !updated[index].enabled;
                  setStartupPrograms(updated);
                }}
              >
                <div className="toggle-slider"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your system monitor preferences</p>
      </div>

      <div className="cleanup-section">
        <h3 className="cleanup-title">Monitoring Preferences</h3>
        <div style={{ marginTop: '16px' }}>
          <label className="setting-item">
            <input type="checkbox" defaultChecked />
            <span>Enable real-time monitoring</span>
          </label>
          <label className="setting-item">
            <input type="checkbox" defaultChecked />
            <span>Show system notifications</span>
          </label>
          <label className="setting-item">
            <input type="checkbox" />
            <span>Start with Windows</span>
          </label>
        </div>
      </div>      <div className="cleanup-section">
        <h3 className="cleanup-title">Updates</h3>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Current Version:</span>
            <span style={{ color: '#10b981', fontWeight: '600' }}>v{appVersion}</span>
            {updateAvailable && (
              <span style={{ 
                background: 'rgba(239, 68, 68, 0.2)', 
                color: '#ef4444', 
                padding: '2px 8px', 
                borderRadius: '4px', 
                fontSize: '12px',
                fontWeight: '600'
              }}>
                UPDATE AVAILABLE
              </span>
            )}
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
              Status: {
                updateStatus === 'idle' ? 'Ready' :
                updateStatus === 'checking' ? 'Checking for updates...' :
                updateStatus === 'available' ? 'Update available!' :
                updateStatus === 'downloading' ? `Downloading... ${downloadProgress?.percent?.toFixed(1) || 0}%` :
                updateStatus === 'downloaded' ? 'Ready to install' :
                updateStatus === 'not-available' ? 'Up to date' :
                updateStatus === 'error' ? 'Error checking for updates' :
                'Unknown'
              }
            </span>
          </div>

          {downloadProgress && updateStatus === 'downloading' && (
            <div className="progress-bar" style={{ marginBottom: '12px' }}>
              <div 
                className="progress-fill" 
                style={{ width: `${downloadProgress.percent || 0}%` }}
              ></div>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="action-button" 
            onClick={handleCheckForUpdates}
            disabled={updateStatus === 'checking' || updateStatus === 'downloading'}
          >
            {updateStatus === 'checking' ? '🔄 Checking...' : '🔍 Check for Updates'}
          </button>
          
          {updateStatus === 'downloaded' && (
            <button 
              className="action-button" 
              onClick={handleInstallUpdate}
              style={{ background: 'linear-gradient(45deg, #10b981, #059669)' }}
            >
              🚀 Restart & Install
            </button>
          )}
        </div>
      </div>

      <div className="cleanup-section">
        <h3 className="cleanup-title">About</h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.6' }}>
          System Health Monitor v{appVersion}<br />
          A modern, open-source system monitoring and optimization tool for Windows.<br />
          Built with Electron, React, and TypeScript.
        </p>
        <div style={{ marginTop: '16px' }}>
          <button className="action-button">View on GitHub</button>
          <button className="action-button">Report Issues</button>
        </div>
      </div>
    </div>
  );

  const setupUpdateListeners = () => {
    window.electronAPI.onUpdateChecking(() => {
      setUpdateStatus('checking');
      console.log('Checking for updates...');
    });

    window.electronAPI.onUpdateAvailable((event, info) => {
      setUpdateStatus('available');
      setUpdateInfo(info);
      setUpdateAvailable(true);
      console.log('Update available:', info);
    });

    window.electronAPI.onUpdateNotAvailable((event, info) => {
      setUpdateStatus('not-available');
      setUpdateAvailable(false);
      console.log('Update not available');
    });

    window.electronAPI.onUpdateError((event, error) => {
      setUpdateStatus('error');
      console.error('Update error:', error);
    });

    window.electronAPI.onUpdateDownloadProgress((event, progress) => {
      setDownloadProgress(progress);
      setUpdateStatus('downloading');
      console.log('Download progress:', progress.percent + '%');
    });

    window.electronAPI.onUpdateDownloaded((event, info) => {
      setUpdateStatus('downloaded');
      console.log('Update downloaded, ready to install');
    });
  };

  const loadAppVersion = async () => {
    try {
      const versionInfo = await window.electronAPI.getAppVersion();
      if (versionInfo) {
        setAppVersion(versionInfo.version);
      }
    } catch (error) {
      console.error('Error loading app version:', error);
    }
  };

  const handleCheckForUpdates = async () => {
    try {
      setUpdateStatus('checking');
      const result = await window.electronAPI.checkForUpdates();
      if (result.success) {
        console.log('Update check initiated');
      } else {
        setUpdateStatus('error');
        console.log('Update check failed:', result.message);
      }
    } catch (error) {
      setUpdateStatus('error');
      console.error('Error checking for updates:', error);
    }
  };

  const handleInstallUpdate = async () => {
    try {
      await window.electronAPI.restartAndInstallUpdate();
    } catch (error) {
      console.error('Error installing update:', error);
    }
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="logo">
          <div className="logo-icon">⚡</div>
          <div className="logo-text">System Health Monitor</div>
        </div>
        
        <nav>
          <ul className="nav-menu">
            <li className="nav-item">
              <button 
                className={`nav-button ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📊 Overview
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-button ${activeTab === 'optimization' ? 'active' : ''}`}
                onClick={() => setActiveTab('optimization')}
              >
                🚀 Optimization
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                ⚙️ Settings
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <main className="main-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'optimization' && renderOptimization()}
        {activeTab === 'settings' && renderSettings()}
      </main>
    </div>
  );
};

export default App;
