# Supabase Setup - Run this script and follow the prompts
# It will guide you through Steps 2-6

Write-Host "`n=== SUPABASE SETUP ===" -ForegroundColor Cyan
Write-Host "`nSTEP 2: Run the SQL migration in Supabase" -ForegroundColor Yellow
Write-Host "1. Open: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Select your project" -ForegroundColor White
Write-Host "3. Click 'SQL Editor' in the left sidebar" -ForegroundColor White
Write-Host "4. Click 'New query'" -ForegroundColor White
Write-Host "5. Open the file: supabase/migrations/001_initial_schema.sql" -ForegroundColor White
Write-Host "6. Copy ALL its contents and paste into the SQL Editor" -ForegroundColor White
Write-Host "7. Click RUN (or Ctrl+Enter)" -ForegroundColor White
Write-Host "`nPress Enter when done..." -ForegroundColor Gray
Read-Host

Write-Host "`nSTEP 3 & 4: Run setup script (creates bucket + admin user)" -ForegroundColor Yellow
$url = Read-Host "Paste your Supabase Project URL (e.g. https://xxx.supabase.co)"
$key = Read-Host "Paste your Supabase service_role key"
$email = Read-Host "Admin email (press Enter for ahmad_selwawe93@yahoo.com)"
$password = Read-Host "Admin password (press Enter for Ahmad@123)"

if ([string]::IsNullOrWhiteSpace($email)) { $email = "ahmad_selwawe93@yahoo.com" }
if ([string]::IsNullOrWhiteSpace($password)) { $password = "Ahmad@123" }

$env:NEXT_PUBLIC_SUPABASE_URL = $url
$env:SUPABASE_SERVICE_ROLE_KEY = $key
$env:ADMIN_EMAIL = $email
$env:ADMIN_PASSWORD = $password

node scripts/setup-supabase.mjs

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSTEP 5: Add these to Vercel" -ForegroundColor Yellow
    Write-Host "Go to: vercel.com -> Your Project -> Settings -> Environment Variables" -ForegroundColor White
    Write-Host "Add:" -ForegroundColor White
    Write-Host "  NEXT_PUBLIC_USE_SUPABASE = true" -ForegroundColor Green
    Write-Host "  NEXT_PUBLIC_SUPABASE_URL = $url" -ForegroundColor Green
    Write-Host "  SUPABASE_SERVICE_ROLE_KEY = (your key)" -ForegroundColor Green
    Write-Host "`nSTEP 6: Redeploy in Vercel (Deployments -> Redeploy)" -ForegroundColor Yellow
    Write-Host "`nDone! Log in with $email / $password" -ForegroundColor Cyan
}
