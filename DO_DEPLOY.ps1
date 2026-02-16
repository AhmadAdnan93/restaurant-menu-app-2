# Restaurant Menu - One-Click Deploy
# Run: .\DO_DEPLOY.ps1

Write-Host "`n=== Restaurant Menu App - Deploy ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get Vercel Token
if (-not $env:VERCEL_TOKEN) {
    Write-Host "Step 1: Create Vercel Token" -ForegroundColor Yellow
    Write-Host "  Opening https://vercel.com/account/tokens ..." -ForegroundColor Gray
    Start-Process "https://vercel.com/account/tokens"
    Write-Host ""
    $token = Read-Host "  Paste your Vercel token here"
    if ($token) { $env:VERCEL_TOKEN = $token }
}

if (-not $env:VERCEL_TOKEN) {
    Write-Host "`nNo token provided. Exiting." -ForegroundColor Red
    exit 1
}

# Step 2: Deploy to Vercel
Write-Host "`nStep 2: Deploying to Vercel..." -ForegroundColor Yellow
node deploy-now.js
if ($LASTEXITCODE -ne 0) { exit 1 }

# Step 3: Railway
Write-Host "`nStep 3: Deploy Backend on Railway" -ForegroundColor Yellow
Write-Host "  Opening Railway..." -ForegroundColor Gray
Start-Process "https://railway.app/new?repository=https://github.com/AhmadSulieman93/restaurant-menu-app"

Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Green
Write-Host "1. On Railway: Set Root Directory = backend/RestaurantMenu.API"
Write-Host "2. Add variables (see DEPLOY_COMPLETE.md)"
Write-Host "3. Generate domain, then add BaseUrl and Frontend__BaseUrl"
Write-Host "4. In Vercel: Add NEXT_PUBLIC_API_URL and NEXT_PUBLIC_APP_URL"
Write-Host ""
