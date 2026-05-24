# Installs Railway CLI on Windows by downloading the binary from GitHub
# Run with: powershell -ExecutionPolicy Bypass -File scripts\install_railway.ps1

Write-Host ""
Write-Host "============================================================"
Write-Host "  Installing Railway CLI from GitHub..."
Write-Host "============================================================"
Write-Host ""

$installDir = "$env:USERPROFILE\.railway\bin"
$exePath    = "$installDir\railway.exe"

# Create install directory
if (!(Test-Path $installDir)) {
    New-Item -ItemType Directory -Force -Path $installDir | Out-Null
}

# Get latest release download URL from GitHub API
Write-Host "[1/3] Fetching latest release info..."
try {
    $release = Invoke-RestMethod "https://api.github.com/repos/railwayapp/cli/releases/latest"
    $asset   = $release.assets | Where-Object { $_.name -like "*windows*x86_64*" -or $_.name -like "*x86_64*windows*" } | Select-Object -First 1

    if (-not $asset) {
        # Fallback: look for any .exe asset
        $asset = $release.assets | Where-Object { $_.name -like "*.exe" } | Select-Object -First 1
    }

    if (-not $asset) {
        Write-Host "[ERROR] Could not find Windows binary in latest release."
        Write-Host "        Assets available:"
        $release.assets | ForEach-Object { Write-Host "          - $($_.name)" }
        exit 1
    }

    $downloadUrl = $asset.browser_download_url
    Write-Host "[OK] Found: $($asset.name)"
} catch {
    Write-Host "[ERROR] Could not reach GitHub API: $_"
    exit 1
}

# Download the binary
Write-Host ""
Write-Host "[2/3] Downloading Railway CLI..."
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $exePath -UseBasicParsing
    Write-Host "[OK] Downloaded to $exePath"
} catch {
    Write-Host "[ERROR] Download failed: $_"
    exit 1
}

# Add to PATH for this session and permanently
Write-Host ""
Write-Host "[3/3] Adding to PATH..."
$env:PATH = "$installDir;$env:PATH"

$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notlike "*$installDir*") {
    [Environment]::SetEnvironmentVariable("PATH", "$installDir;$currentPath", "User")
    Write-Host "[OK] Added to user PATH permanently."
} else {
    Write-Host "[OK] Already in PATH."
}

# Verify
Write-Host ""
try {
    $version = & $exePath --version 2>&1
    Write-Host "============================================================"
    Write-Host "  Railway CLI installed: $version"
    Write-Host "============================================================"
    Write-Host ""
    Write-Host "  Now run the deploy script:"
    Write-Host "  scripts\railway_deploy.bat"
    Write-Host ""
} catch {
    Write-Host "[ERROR] Install may have failed — could not run railway.exe"
    exit 1
}
