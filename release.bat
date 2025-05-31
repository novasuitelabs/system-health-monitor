@echo off
:: Release script for System Health Monitor (Windows)

echo 🚀 System Health Monitor - Release Builder
echo ===========================================

:: Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    exit /b 1
)

:: Get current version
for /f "delims=" %%i in ('node -p "require('./package.json').version"') do set CURRENT_VERSION=%%i
echo 📦 Current version: %CURRENT_VERSION%

:: Clean previous builds
echo 🧹 Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist release rmdir /s /q release

:: Install dependencies
echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Dependency installation failed!
    exit /b 1
)

:: Build the application
echo 🔨 Building application...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed!
    exit /b 1
)

:: Create distribution
echo 📦 Creating distribution packages...
call npm run dist
if errorlevel 1 (
    echo ❌ Distribution build failed!
    exit /b 1
)

echo ✅ Release build completed successfully!
echo.
echo 📁 Release files are in the 'release' folder:
dir release

echo.
echo 🎉 Ready for deployment!
echo.
echo Next steps:
echo 1. Test the installer in release\ folder
echo 2. Create a GitHub Release
echo 3. Upload the installer files
echo 4. Update release notes

pause
