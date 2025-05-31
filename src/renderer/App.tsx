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

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      const [stats, info, startup] = await Promise.all([
        window.electronAPI.getSystemStats(),
        window.electronAPI.getSystemInfo(),
        window.electronAPI.getStartupPrograms()
      ]);
      
      setSystemStats(stats);
      setSystemInfo(info);
      setStartupPrograms(startup);
      setLoading(false);
    } catch (error) {
      console.error('Error loading system data:', error);
      setLoading(false);
    }
  };

  const loadSystemStats = async () => {
    try {
      const stats = await window.electronAPI.getSystemStats();
      setSystemStats(stats);
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const handleCleanup = async () => {
    try {
      const result = await window.electronAPI.cleanTempFiles();
      setCleanupResult(result);
    } catch (error) {
      console.error('Error cleaning temp files:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderOverview = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">System Overview</h1>
        <p className="page-subtitle">Real-time monitoring of your system's health and performance</p>
      </div>

      {loading ? (
        <div className="loading">Loading system information...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
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
                  style={{ width: `${systemStats?.cpu.usage || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="stat-card">
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
                  style={{ width: `${systemStats?.memory.usage || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="stat-card">
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
                {systemStats?.disks.length === 1 ? 'Drive' : 'Drives'} detected
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Operating System</span>
                <div className="stat-icon" style={{ background: 'linear-gradient(45deg, #8b5cf6, #7c3aed)' }}>
                  🖥️
                </div>
              </div>
              <div className="stat-value">{systemInfo?.os.platform || 'Unknown'}</div>
              <div className="stat-description">
                {systemInfo?.os.distro} {systemInfo?.os.release}
              </div>
            </div>
          </div>

          <div className="processes-table">
            <div className="table-header">
              <h3 className="table-title">Top Processes</h3>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Process Name</th>
                  <th>CPU %</th>
                  <th>Memory</th>
                  <th>PID</th>
                </tr>
              </thead>
              <tbody>
                {systemInfo?.processes.slice(0, 10).map((process, index) => (
                  <tr key={index}>
                    <td>{process.name}</td>
                    <td>{process.cpu?.toFixed(1) || '0.0'}%</td>
                    <td>{formatBytes(process.mem_rss || 0)}</td>
                    <td>{process.pid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );

  const renderOptimization = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">System Optimization</h1>
        <p className="page-subtitle">Clean and optimize your system for better performance</p>
      </div>

      <div className="cleanup-section">
        <div className="cleanup-header">
          <h3 className="cleanup-title">Disk Cleanup</h3>
          <button className="action-button" onClick={handleCleanup}>
            🧹 Clean Temp Files
          </button>
        </div>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          Remove temporary files, cache, and other unnecessary data to free up disk space.
        </p>
        
        {cleanupResult && (
          <div className="cleanup-result">
            <strong>Cleanup Complete!</strong><br />
            Files deleted: {cleanupResult.filesDeleted}<br />
            Space freed: {cleanupResult.spaceFreed}
          </div>
        )}
      </div>

      <div className="processes-table">
        <div className="table-header">
          <h3 className="table-title">Startup Programs</h3>
        </div>
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
          <label style={{ display: 'block', marginBottom: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
            <input type="checkbox" defaultChecked style={{ marginRight: '8px' }} />
            Enable real-time monitoring
          </label>
          <label style={{ display: 'block', marginBottom: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
            <input type="checkbox" defaultChecked style={{ marginRight: '8px' }} />
            Show system notifications
          </label>
          <label style={{ display: 'block', marginBottom: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
            <input type="checkbox" style={{ marginRight: '8px' }} />
            Start with Windows
          </label>
        </div>
      </div>

      <div className="cleanup-section">
        <h3 className="cleanup-title">About</h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.6' }}>
          System Health Monitor v1.0.0<br />
          A modern, open-source system monitoring and optimization tool for Windows.<br />
          Built with Electron, React, and TypeScript.
        </p>
        <div style={{ marginTop: '16px' }}>
          <button className="action-button">Check for Updates</button>
          <button className="action-button">View on GitHub</button>
        </div>
      </div>
    </div>
  );

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
