# Add Supabase env vars to Vercel and trigger redeploy
# Run AFTER: 1) vercel login  2) .env.local exists (from DO_EVERYTHING.ps1)

$ErrorActionPreference = "Stop"

if (-not (Test-Path .env.local)) {
    Write-Host "`n.env.local not found. Run .\DO_EVERYTHING.ps1 first.`n" -ForegroundColor Red
    exit 1
}

Write-Host "`nAdding env vars to Vercel...`n" -ForegroundColor Cyan

$vars = @("NEXT_PUBLIC_USE_SUPABASE", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY")
foreach ($name in $vars) {
    $line = Get-Content .env.local | Where-Object { $_ -match "^$name=" } | Select-Object -First 1
    if ($line -match "^[^=]+=(.*)$") {
        $value = $matches[1].Trim().Trim('"')
        Write-Host "Adding $name to production..."
        $value | npx vercel env add $name production --force 2>&1 | Out-Null
        Write-Host "Adding $name to preview..."
        $value | npx vercel env add $name preview --force 2>&1 | Out-Null
    }
}

Write-Host "`nTriggering redeploy...`n" -ForegroundColor Yellow
npx vercel --prod

Write-Host "`nDone!`n" -ForegroundColor Green
