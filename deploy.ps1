# Push local changes to GitHub. GitHub Pages rebuilds the live site.
#   .\deploy.ps1
#   .\deploy.ps1 -Watch
# Live: https://abmai-me.github.io/Khadijatul-Kubra-web/

param(
  [string]$Message,
  [switch]$Watch
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$env:GIT_AUTHOR_NAME = if ($env:GIT_AUTHOR_NAME) { $env:GIT_AUTHOR_NAME } else { "A B M ASHRAFUL ISLAM" }
$env:GIT_AUTHOR_EMAIL = if ($env:GIT_AUTHOR_EMAIL) { $env:GIT_AUTHOR_EMAIL } else { "33477187+abmai-me@users.noreply.github.com" }
$env:GIT_COMMITTER_NAME = $env:GIT_AUTHOR_NAME
$env:GIT_COMMITTER_EMAIL = $env:GIT_AUTHOR_EMAIL

function Publish-Site([string]$CommitMessage) {
  git add -A
  $status = git status --porcelain
  if (-not $status) { return $false }
  if (-not $CommitMessage) { $CommitMessage = "Update site $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" }
  git commit -m $CommitMessage
  git push origin main
  Write-Host "Pushed $(Get-Date -Format 'HH:mm:ss'). Live in about 1 minute:" -ForegroundColor Green
  Write-Host "https://abmai-me.github.io/Khadijatul-Kubra-web/"
  return $true
}

if ($Watch) {
  Write-Host "Watching for changes. Pushing to GitHub whenever files change."
  Write-Host "https://abmai-me.github.io/Khadijatul-Kubra-web/"
  while ($true) {
    try {
      Publish-Site $null | Out-Null
    } catch {
      Write-Host "Push failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Start-Sleep -Seconds 5
  }
}

$pushed = Publish-Site $Message
if (-not $pushed) {
  Write-Host "No local changes to upload." -ForegroundColor Yellow
}
Write-Host "GitHub: https://github.com/abmai-me/Khadijatul-Kubra-web"
Write-Host "Live:   https://abmai-me.github.io/Khadijatul-Kubra-web/"
