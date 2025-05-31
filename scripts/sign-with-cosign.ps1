#!/usr/bin/env pwsh
# Cosign signing script for System Health Monitor
# This script signs the built executable using Sigstore/Cosign

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verify
)

Write-Host "🔐 Starting Cosign signing process..." -ForegroundColor Green

# Check if Cosign is installed
try {
    $cosignVersion = & cosign-windows-amd64 version 2>&1
    Write-Host "✅ Cosign found: $($cosignVersion[0])" -ForegroundColor Green
} catch {
    Write-Error "❌ Cosign not found. Please install it first with: winget install sigstore.cosign"
    exit 1
}

# Check if file exists
if (-not (Test-Path $FilePath)) {
    Write-Error "❌ File not found: $FilePath"
    exit 1
}

Write-Host "📁 Signing file: $FilePath" -ForegroundColor Cyan

try {
    if ($Verify) {
        # Verify existing signature
        Write-Host "🔍 Verifying signature..." -ForegroundColor Yellow
        & cosign-windows-amd64 verify --certificate-identity-regexp ".*" --certificate-oidc-issuer-regexp ".*" $FilePath
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Signature verification successful!" -ForegroundColor Green
        } else {
            Write-Host "❌ Signature verification failed!" -ForegroundColor Red
            exit 1
        }
    } else {
        # Sign the file
        Write-Host "✍️ Signing with Cosign..." -ForegroundColor Yellow
        Write-Host "📝 This will open a browser for OIDC authentication..." -ForegroundColor Cyan
        
        # Use keyless signing with OIDC
        & cosign-windows-amd64 sign-blob --yes $FilePath
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ File signed successfully!" -ForegroundColor Green
            Write-Host "📄 Signature files created alongside your executable" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Signing failed!" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Error "❌ Error during signing process: $_"
    exit 1
}

Write-Host "🎉 Cosign process completed!" -ForegroundColor Green
