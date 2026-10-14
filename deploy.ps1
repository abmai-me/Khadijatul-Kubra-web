# One-click: push local changes → GitHub → live site
# Usage: .\deploy.ps1
# Optional: .\deploy.ps1 "Your commit message"

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$msg = $args[0]
if (-not $msg) { $msg = "Update site $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }

git add -A
$status = git status --porcelain
if (-not $status) {
  Write-Host "No local changes to upload." -ForegroundColor Yellow
  Write-Host "Live site: https://abmai-me.github.io/Khadijatul-Kubra-web/"
  exit 0
}

$env:GIT_AUTHOR_NAME = if ($env:GIT_AUTHOR_NAME) { $env:GIT_AUTHOR_NAME } else { "A B M ASHRAFUL ISLAM" }
$env:GIT_AUTHOR_EMAIL = if ($env:GIT_AUTHOR_EMAIL) { $env:GIT_AUTHOR_EMAIL } else { "33477187+abmai-me@users.noreply.github.com" }
$env:GIT_COMMITTER_NAME = $env:GIT_AUTHOR_NAME
$env:GIT_COMMITTER_EMAIL = $env:GIT_AUTHOR_EMAIL

git commit -m $msg
git push origin main

Write-Host ""
Write-Host "Pushed. Live site updates in ~1-2 minutes:" -ForegroundColor Green
Write-Host "https://abmai-me.github.io/Khadijatul-Kubra-web/"
Start-Process "https://abmai-me.github.io/Khadijatul-Kubra-web/"
