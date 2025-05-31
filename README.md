# System Health Monitor ⚡

A modern, open-source system monitoring and optimization tool for Windows built with Electron, React, and TypeScript.

![System Health Monitor](https://img.shields.io/badge/Platform-Windows-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Electron](https://img.shields.io/badge/Electron-Latest-lightblue)
![React](https://img.shields.io/badge/React-19.1.0-blue)

## ✨ Features

### 📊 **Real-time System Monitoring**
- CPU usage and performance metrics
- Memory usage tracking
- Disk space monitoring
- Running processes overview
- Network statistics

### 🚀 **System Optimization**
- Temporary file cleanup
- Startup program management
- Performance optimization suggestions
- System diagnostics

### 🎨 **Modern Interface**
- Beautiful glassmorphism design
- Dark theme optimized for long usage
- Real-time charts and visualizations
- Intuitive navigation

### 🔧 **Windows Integration**
- Native Windows system calls
- PowerShell integration
- System tray support
- Auto-start capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 16 or later
- Windows 10/11
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/novasuitelabs/system-health-monitor.git
   cd system-health-monitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

### 📦 Building Installer

To create a Windows installer:

```bash
npm run dist
```

This will create an installer in the `release` folder.

## 🛠️ Development

### Project Structure
```
system-health-monitor/
├── src/
│   ├── main/          # Electron main process
│   │   ├── main.js    # Main application logic
│   │   └── preload.js # Preload script for IPC
│   └── renderer/      # React frontend
│       ├── App.tsx    # Main React component
│       ├── index.tsx  # React entry point
│       ├── index.html # HTML template
│       └── styles.css # Application styles
├── dist/              # Built files
├── .github/           # GitHub configuration
└── package.json       # Project configuration
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm start` - Start the built application
- `npm run pack` - Package the app (without installer)
- `npm run dist` - Create distribution packages

### 🔧 Tech Stack

- **Frontend**: React 19, TypeScript, CSS3
- **Backend**: Electron, Node.js
- **System Info**: systeminformation library
- **Charts**: Chart.js with react-chartjs-2
- **Build**: Webpack, electron-builder

## 📋 Features in Detail

### System Overview
- Real-time CPU usage monitoring
- Memory usage with detailed breakdown
- Storage information for all drives
- Top running processes list
- Operating system information

### Optimization Tools
- **Disk Cleanup**: Remove temporary files, browser cache, and system junk
- **Startup Manager**: Control which programs start with Windows
- **Performance Tuning**: Optimize system settings for better performance

### Settings & Customization
- Enable/disable real-time monitoring
- Configure notification preferences
- Auto-start with Windows option
- Update checking

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 🐛 Bug Reports

Found a bug? Please create an issue with:
- System information (Windows version, etc.)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/novasuitelabs/system-health-monitor?tab=MIT-1-ov-file) file for details.

## 🙏 Acknowledgments

- [systeminformation](https://github.com/sebhildebrandt/systeminformation) for system data
- [Electron](https://www.electronjs.org/) for the desktop framework
- [React](https://reactjs.org/) for the UI framework
- [Chart.js](https://www.chartjs.org/) for beautiful charts

## 🔒 Security

This application requires system-level access to monitor your computer. All data is processed locally and never sent to external servers. The application is open-source so you can verify the code yourself.

## 📞 Support

- 📧 Email: labs.ns@xxavvgroup.com
- 🐛 Issues: [GitHub Issues](https://github.com/novasuitelabs/system-health-monitor/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/novasuitelabs/system-health-monitor/discussions)

---

Made with ❤️ for the Windows community
