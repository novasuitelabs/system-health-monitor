# System Health Monitor - Release Process

## Automated Update System

The app now includes a complete auto-updater system powered by electron-updater. Here's how it works:

### For Users:
1. **Check for Updates**: Go to Settings → Updates → "Check for Updates"
2. **Automatic Downloads**: Updates download in the background when available
3. **Install**: Click "Restart & Install" when the download completes
4. **Seamless Experience**: The app automatically restarts with the new version

### For Developers:
1. **Version Bumping**: Update version in `package.json`
2. **Build Release**: Run `npm run dist` to create installer
3. **GitHub Releases**: Upload the installer to GitHub Releases
4. **Auto-Discovery**: Users will be notified of the new version automatically

### Update Configuration:
- **Provider**: GitHub Releases
- **Repository**: novasuitelabs/system-health-monitor
- **Channel**: Latest (stable releases only)
- **Update Check**: Manual in Settings (can be automated)

### Development vs Production:
- **Development**: Updates are disabled, shows "Not available in development mode"
- **Production**: Full update functionality enabled

### Security:
- All updates are cryptographically signed
- Downloads from GitHub Releases only
- User consent required before installation

## Release Checklist:
1. [ ] Update version in package.json
2. [ ] Test application thoroughly
3. [ ] Build release: `npm run dist`
4. [ ] Create GitHub Release with changelog
5. [ ] Upload installer files
6. [ ] Verify auto-update detection
7. [ ] Test installation process

## Files Involved:
- `src/main/main.js` - Auto-updater configuration
- `src/main/preload.js` - Update API exposure
- `src/renderer/App.tsx` - Update UI components
- `package.json` - Update settings and version
