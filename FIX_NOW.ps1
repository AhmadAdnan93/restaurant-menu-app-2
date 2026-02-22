# FIX LOGIN NOW - Run this with your Railway URL
# Usage: .\FIX_NOW.ps1 "https://your-app.up.railway.app"
# Or just: .\FIX_NOW.ps1  (then paste when asked)

param([string]$RailwayUrl)

if (-not $RailwayUrl) {
    $RailwayUrl = Read-Host "Paste your Railway URL (e.g. https://xxx.up.railway.app)"
}
$RailwayUrl = $RailwayUrl.Trim().TrimEnd('/')
if ([string]::IsNullOrWhiteSpace($RailwayUrl)) {
    Write-Host "No URL. Get it from Railway: Project -> Your Service -> Settings -> Networking -> Domain" -ForegroundColor Red
    exit 1
}
if ($RailwayUrl -match "YOUR-RAILWAY-URL|your-railway-url|your-app") {
    Write-Host "ERROR: You used the placeholder. Paste your REAL Railway URL from the Railway dashboard!" -ForegroundColor Red
    Write-Host "Example: https://restaurant-menu-app-production-abc123.up.railway.app" -ForegroundColor Gray
    exit 1
}

$BackendApiUrl = "$RailwayUrl/api"
$AppUrl = "https://resturent-app-taupe.vercel.app"

Write-Host "Adding BACKEND_API_URL to Vercel..." -ForegroundColor Cyan
$BackendApiUrl | npx vercel env add BACKEND_API_URL production --yes --force
Write-Host "Adding NEXT_PUBLIC_APP_URL for QR codes..." -ForegroundColor Cyan
$AppUrl | npx vercel env add NEXT_PUBLIC_APP_URL production --yes --force

Write-Host "Redeploying Vercel..." -ForegroundColor Cyan
npx vercel --prod --yes

Write-Host ""
Write-Host "=== DONE! Test now ===" -ForegroundColor Green
Write-Host "https://resturent-app-taupe.vercel.app/login" -ForegroundColor White
Write-Host "admin@restaurantmenu.com / Admin@123" -ForegroundColor Gray
Start-Process "https://resturent-app-taupe.vercel.app/login"
