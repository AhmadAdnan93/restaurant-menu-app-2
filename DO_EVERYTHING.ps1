# Do everything for Supabase setup
# Run: .\DO_EVERYTHING.ps1

$ErrorActionPreference = "Stop"

Write-Host "`n=== SUPABASE SETUP - Do Everything ===" -ForegroundColor Cyan

# Get credentials
Write-Host "`nPaste your Supabase credentials (from Dashboard -> Settings -> API & Database):`n" -ForegroundColor Yellow

$url = Read-Host "1. Project URL (e.g. https://xxxxx.supabase.co)"
$key = Read-Host "2. service_role key"
$dbPass = Read-Host "3. Database password (Settings -> Database -> Database password)" -AsSecureString
$dbPassText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPass))

if ([string]::IsNullOrWhiteSpace($url) -or [string]::IsNullOrWhiteSpace($key)) {
    Write-Host "`nURL and key are required. Exiting." -ForegroundColor Red
    exit 1
}

# Save to .env.local for Next.js and script
$envContent = @"
NEXT_PUBLIC_USE_SUPABASE=true
NEXT_PUBLIC_SUPABASE_URL=$url
SUPABASE_SERVICE_ROLE_KEY=$key
SUPABASE_DB_PASSWORD=$dbPassText
"@
$envContent | Out-File -FilePath ".env.local" -Encoding utf8
Write-Host "`nCreated .env.local" -ForegroundColor Green

# Set env for this session
$env:NEXT_PUBLIC_SUPABASE_URL = $url
$env:SUPABASE_SERVICE_ROLE_KEY = $key
$env:SUPABASE_DB_PASSWORD = $dbPassText

# Install pg for migration
Write-Host "`nInstalling pg..." -ForegroundColor Yellow
npm install pg --save-dev 2>&1 | Out-Null

# Run all-in-one script
Write-Host "`nRunning setup (migration + bucket + admin user)..." -ForegroundColor Yellow
node scripts/run-all-supabase.mjs

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=== NEXT: Add to Vercel ===" -ForegroundColor Cyan
    Write-Host "1. Go to vercel.com -> Your Project -> Settings -> Environment Variables" -ForegroundColor White
    Write-Host "2. Add these 3 variables (from .env.local):" -ForegroundColor White
    Write-Host "   NEXT_PUBLIC_USE_SUPABASE = true" -ForegroundColor Green
    Write-Host "   NEXT_PUBLIC_SUPABASE_URL = $url" -ForegroundColor Green
    Write-Host "   SUPABASE_SERVICE_ROLE_KEY = (copy from .env.local)" -ForegroundColor Green
    Write-Host "3. Redeploy (Deployments -> ... -> Redeploy)" -ForegroundColor White
}
