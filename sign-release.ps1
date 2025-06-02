# PowerShell script for signing release
# Manual signing script for existing System Health Monitor release
# Use this to sign your current v1.1.0 release

Write-Host "🔐 System Health Monitor - Manual Cosign Signing" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

$releaseDir = "release"
$executablePath = Join-Path $releaseDir "win-unpacked\System Health Monitor.exe"
$installerPath = Join-Path $releaseDir "System Health Monitor Setup 1.1.0.exe"

# Check if files exist
if (-not (Test-Path $executablePath)) {
    Write-Error "❌ Executable not found: $executablePath"
    Write-Host "Run 'npm run dist' first to build the application"
    exit 1
}

if (-not (Test-Path $installerPath)) {
    Write-Error "❌ Installer not found: $installerPath"
    Write-Host "Run 'npm run dist' first to build the application"
    exit 1
}

Write-Host "📁 Found files to sign:" -ForegroundColor Cyan
Write-Host "  - Executable: $executablePath" -ForegroundColor White
Write-Host "  - Installer: $installerPath" -ForegroundColor White
Write-Host ""

# Confirm signing
$confirm = Read-Host "Do you want to sign these files with Cosign? This will open a browser for authentication. (y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "❌ Signing cancelled by user" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔐 Starting signing process..." -ForegroundColor Green

try {
    # Sign the executable
    Write-Host "✍️ Signing executable..." -ForegroundColor Yellow
    & cosign-windows-amd64 sign-blob --yes $executablePath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Executable signed successfully!" -ForegroundColor Green
    } else {
        throw "Failed to sign executable"
    }
    
    # Sign the installer
    Write-Host "✍️ Signing installer..." -ForegroundColor Yellow
    & cosign-windows-amd64 sign-blob --yes $installerPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Installer signed successfully!" -ForegroundColor Green
    } else {
        throw "Failed to sign installer"
    }
    
    Write-Host ""
    Write-Host "🎉 All files signed successfully!" -ForegroundColor Green
    Write-Host "📄 Signature files (.sig) have been created alongside your executables" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Include the .sig files in your GitHub release" -ForegroundColor White
    Write-Host "  2. Users can verify signatures with: cosign verify-blob --signature <file>.sig <file>" -ForegroundColor White
    Write-Host "  3. This helps establish trust and reduces SmartScreen warnings" -ForegroundColor White
    
} catch {
    Write-Error "❌ Signing failed: $_"
    exit 1
}

# List created signature files
Write-Host ""
Write-Host "📄 Created signature files:" -ForegroundColor Cyan
Get-ChildItem $releaseDir -Filter "*.sig" -Recurse | ForEach-Object {
    Write-Host "  - $($_.FullName)" -ForegroundColor White
}
