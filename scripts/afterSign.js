const { execSync } = require('child_process');
const path = require('path');

/**
 * Electron Builder afterSign hook for Cosign signing
 * This runs after electron-builder creates the executable but before packaging
 */
async function afterSign(context) {
  console.log('🔐 Starting Cosign signing process...');
  
  const { electronPlatformName, appOutDir } = context;
  
  // Only sign on Windows
  if (electronPlatformName !== 'win32') {
    console.log('⏭️ Skipping signing - not Windows platform');
    return;
  }

  const executablePath = path.join(appOutDir, 'System Health Monitor.exe');
  const signScript = path.join(__dirname, '..', 'scripts', 'sign-with-cosign.ps1');
  
  console.log(`📁 Executable path: ${executablePath}`);
  console.log(`📄 Sign script: ${signScript}`);
  
  try {
    // Check if we're in CI environment
    const isCI = process.env.CI || process.env.GITHUB_ACTIONS;
    
    if (isCI) {
      console.log('🤖 Running in CI environment - signing with stored credentials');
      // In CI, you would set up service account credentials
      // For now, we'll skip in CI and only sign locally
      console.log('⏭️ Skipping signing in CI - implement service account signing if needed');
      return;
    }
    
    // Run the PowerShell signing script
    console.log('✍️ Executing signing script...');
    execSync(`pwsh -ExecutionPolicy Bypass -File "${signScript}" -FilePath "${executablePath}"`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('✅ Cosign signing completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during signing:', error.message);
    
    // Don't fail the build if signing fails - just warn
    console.warn('⚠️ Build will continue without signature');
  }
}

module.exports = afterSign;
