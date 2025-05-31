#!/bin/bash
# Release script for System Health Monitor

echo "🚀 System Health Monitor - Release Builder"
echo "==========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: $CURRENT_VERSION"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf release/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Create distribution
echo "📦 Creating distribution packages..."
npm run dist

if [ $? -ne 0 ]; then
    echo "❌ Distribution build failed!"
    exit 1
fi

echo "✅ Release build completed successfully!"
echo ""
echo "📁 Release files are in the 'release' folder:"
ls -la release/

echo ""
echo "🎉 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Test the installer in release/ folder"
echo "2. Create a GitHub Release"
echo "3. Upload the installer files"
echo "4. Update release notes"
