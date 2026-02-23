# Smoke Test

Tests the live app: login, create restaurant/category/menu item, measure performance.

## Run (public endpoint only)
```bash
node scripts/smoke-test.mjs
```

## Run (full test with create/delete)
```bash
LIVE_URL=https://resturent-app-taupe.vercel.app TEST_EMAIL=your@email.com TEST_PASSWORD=yourpass node scripts/smoke-test.mjs
```

## Expected
- **PASSED**: All steps complete. Slow = >5s.
- **FAILED**: 504/502 = Railway backend cold/slow. Fix: Railway Pro (always-on) or warm-up cron.
