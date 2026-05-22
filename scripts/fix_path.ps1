# Ensure global npm bin is in PATH and verify opencode CLI availability

# Resolve global npm bin (Windows standard path)
$bin = Join-Path $env:APPDATA "npm"
if (-not (Test-Path $bin)) {
  Write-Error "Global npm bin path not found: $bin"
  exit 1
}

# Add to PATH for the user if not already present
if (-not ($env:PATH -like "*$bin*")) {
  $newPath = "$env:PATH;$bin"
  [Environment]::SetEnvironmentVariable("PATH", $newPath, [EnvironmentVariableTarget]::User)
  Write-Host "PATH updated to include: $bin"
} else {
  Write-Host "PATH already contains: $bin"
}

# Reload PATH in this session for immediate effect (best-effort)
try {
  $env:PATH = [Environment]::GetEnvironmentVariable("PATH", [EnvironmentVariableTarget]::User)
} catch {
  # If reload fails, proceed; user may need to restart shell
}

# Verify CLI presence and show version
Write-Host "Checking for opencode CLI..."
if (Get-Command opencode -ErrorAction SilentlyContinue) {
  Write-Host "opencode found:" (Get-Command opencode).Source
  if (Test-Path (Get-Command opencode -ErrorAction SilentlyContinue).Source) {
    & opencode --version
  }
} else {
  Write-Host "opencode not found in PATH yet. Trying opencode-ai..."
  if (Get-Command opencode-ai -ErrorAction SilentlyContinue) {
    Write-Host "opencode-ai found:" (Get-Command opencode-ai).Source
    & opencode-ai --version
  } else {
    Write-Host "Neither opencode nor opencode-ai CLI is accessible. You may need to restart your terminal or reinstall."
  }
}
