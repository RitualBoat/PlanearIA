"""Set up a persistent PowerShell alias for opencode.

On Windows, npm may install the CLI wrapper as opencode.ps1 without a corresponding
opencode.cmd wrapper. Since PowerShell does not treat .ps1 as a native command
extension in PATH, typing `opencode` may fail even though opencode.ps1 exists in
the global npm bin folder.

This script creates a small profile function that forwards calls to the actual
PS1 wrapper located in the npm global bin directory.
"""

$wrapper = Join-Path $env:APPDATA "npm" | Join-Path -ChildPath "opencode.ps1"
if (-not (Test-Path $wrapper)) {
  Write-Error "opencode.ps1 wrapper not found at $wrapper. Run npm i -g opencode-ai to install."
  exit 1
}

$profilePath = $PROFILE
if (-not (Test-Path $profilePath)) {
  # Create an empty profile if it doesn't exist
  New-Item -Type File -Path $profilePath -Force | Out-Null
  Write-Host "Created new PowerShell profile at $profilePath"
}

$aliasLine = 'function opencode { & "' + $wrapper + '" $args }'
if (Select-String -Path $profilePath -Pattern 'function opencode' -Quiet) {
  Write-Host "Profile already contains opencode alias. Skipping."
} else {
  Add-Content -Path $profilePath -Value `n$aliasLine
  Write-Host "Added opencode alias to profile. Open a new PowerShell window to use it."
}
