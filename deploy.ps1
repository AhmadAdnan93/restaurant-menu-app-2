# Restaurant Menu App - One-Click Deploy Script
# Run this in PowerShell: .\deploy.ps1

$ErrorActionPreference = "Stop"

Write-Host "`n=== Restaurant Menu App Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Read connection string from appsettings
$appsettingsPath = "backend\RestaurantMenu.API\appsettings.json"
$connectionString = $null
if (Test-Path $appsettingsPath) {
    $config = Get-Content $appsettingsPath -Raw | ConvertFrom-Json
    $connectionString = $config.ConnectionStrings.DefaultConnection
}
if (-not $connectionString) {
    Write-Host "ERROR: Could not read connection string from appsettings.json" -ForegroundColor Red
    exit 1
}

# Step 1: Vercel Login (if needed)
Write-Host "Step 1: Checking Vercel login..." -ForegroundColor Yellow
$vercelWhoami = npx vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Vercel login required. Opening browser..." -ForegroundColor Yellow
    Start-Process "https://vercel.com/login"
    npx vercel login
    if ($LASTEXITCODE -ne 0) { Write-Host "Login failed. Please run: npx vercel login" -ForegroundColor Red; exit 1 }
}

# Step 2: Deploy to Vercel (we need backend URL first - will use placeholder, user updates later)
Write-Host "`nStep 2: Deploying frontend to Vercel..." -ForegroundColor Yellow
# Deploy without env vars first to get URL, then we'll need to redeploy with backend URL
# For now use placeholder - user will set NEXT_PUBLIC_API_URL in Vercel dashboard after Railway deploy
$env:VERCEL_ORG_ID = ""
$env:VERCEL_PROJECT_ID = ""

npx vercel deploy --prod --yes 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Vercel deploy failed. Trying without --yes..." -ForegroundColor Yellow
    npx vercel deploy --prod 2>&1
}
$vercelOutput = npx vercel deploy --prod 2>&1
Write-Host $vercelOutput

# Extract URL from output
$frontendUrl = ($vercelOutput | Select-String "https://[^\s]+\.vercel\.app" | ForEach-Object { $_.Matches.Value }) | Select-Object -First 1

Write-Host "`nStep 3: Deploy backend to Railway..." -ForegroundColor Yellow
Write-Host "Opening Railway - please deploy from GitHub manually (see instructions below)" -ForegroundColor Cyan
Start-Process "https://railway.app/new?repository=https://github.com/AhmadSulieman93/restaurant-menu-app"

Write-Host "`n=== DEPLOYMENT SUMMARY ===" -ForegroundColor Green
Write-Host "Frontend (Vercel): Check output above for your URL"
Write-Host "Backend (Railway): Complete deployment at the opened page"
Write-Host "`nRailway Variables to add:"
Write-Host "  ConnectionStrings__DefaultConnection = (from appsettings.json)"
Write-Host "  CORS_ORIGINS = $frontendUrl"
Write-Host "  BaseUrl = (your Railway URL)"
Write-Host "  Frontend__BaseUrl = $frontendUrl"
Write-Host "  ASPNETCORE_ENVIRONMENT = Production"
Write-Host "`nThen add to Vercel: NEXT_PUBLIC_API_URL = https://YOUR-RAILWAY-URL/api"
Write-Host ""
