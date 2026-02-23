#!/usr/bin/env node
/**
 * Smoke test for live restaurant app
 * Run: LIVE_URL=https://resturent-app-taupe.vercel.app TEST_EMAIL=your@email.com TEST_PASSWORD=yourpass node scripts/smoke-test.mjs
 */

const LIVE_URL = process.env.LIVE_URL || "https://resturent-app-taupe.vercel.app";
const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

const results = [];

function timed(label, fn) {
  const start = Date.now();
  return fn()
    .then((r) => {
      results.push({ step: label, ok: true, ms: Date.now() - start });
      return r;
    })
    .catch((e) => {
      results.push({ step: label, ok: false, ms: Date.now() - start, error: e.message });
      throw e;
    });
}

async function main() {
  console.log("\n=== Smoke Test: Restaurant Menu App ===\n");
  console.log(`Base URL: ${LIVE_URL}\n`);

  let token;
  let restaurantId;
  let categoryId;

  const fetchWithTimeout = (url, opts, timeoutMs = 30000) => {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), timeoutMs);
    return fetch(url, { ...opts, signal: c.signal }).finally(() => clearTimeout(t));
  };

  if (!TEST_EMAIL || !TEST_PASSWORD) {
    console.log("Skip auth test (no TEST_EMAIL/TEST_PASSWORD). Testing public endpoints...\n");
    await timed("GET /restaurants (public)", async () => {
      const r = await fetchWithTimeout(`${LIVE_URL}/api/backend/restaurants?publishedOnly=true`, {}, 35000);
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      const data = await r.json();
      if (!Array.isArray(data)) throw new Error("Expected array");
      return data;
    });
  } else {
    const loginRes = await timed("POST /auth/login", async () => {
      const r = await fetch(`${LIVE_URL}/api/backend/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.message || `${r.status}`);
      }
      return r.json();
    });
    token = loginRes.token;
    if (!token) throw new Error("No token from login");

    const restRes = await timed("POST /restaurants (create)", async () => {
      const r = await fetch(`${LIVE_URL}/api/backend/restaurants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `Smoke Test ${Date.now()}`,
          slug: `smoke-test-${Date.now()}`,
          description: "Smoke test restaurant",
        }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.message || `${r.status}`);
      }
      return r.json();
    });
    restaurantId = restRes.id;
    if (!restaurantId) throw new Error("No restaurant id");

    const catRes = await timed("POST /categories (create)", async () => {
      const r = await fetch(`${LIVE_URL}/api/backend/categories/restaurant/${restaurantId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: "Test Category", description: "Smoke test", order: 1 }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.message || `${r.status}`);
      }
      return r.json();
    });
    categoryId = catRes.id;
    if (!categoryId) throw new Error("No category id");

    await timed("POST /menuitems (create)", async () => {
      const r = await fetch(`${LIVE_URL}/api/backend/menuitems/category/${categoryId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: "Test Item",
          description: "Smoke test item",
          price: 9.99,
          order: 1,
        }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.message || `${r.status}`);
      }
      return r.json();
    });

    await timed("DELETE /restaurants (cleanup)", async () => {
      const r = await fetch(`${LIVE_URL}/api/backend/restaurants/${restaurantId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok && r.status !== 404) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.message || `${r.status}`);
      }
      return {};
    });
  }

  console.log("\n--- Results ---\n");
  const failed = results.filter((r) => !r.ok);
  results.forEach((r) => {
    const icon = r.ok ? "✓" : "✗";
    const time = r.ms > 5000 ? `${(r.ms / 1000).toFixed(1)}s (slow)` : `${r.ms}ms`;
    console.log(`  ${icon} ${r.step}: ${time}${r.error ? ` - ${r.error}` : ""}`);
  });
  console.log("");
  if (failed.length > 0) {
    console.log(`FAILED: ${failed.length}/${results.length} steps`);
    process.exit(1);
  }
  const totalMs = results.reduce((s, r) => s + r.ms, 0);
  const slow = results.filter((r) => r.ms > 5000);
  if (slow.length > 0) {
    console.log(`WARNING: ${slow.length} slow operations (>5s). Total: ${(totalMs / 1000).toFixed(1)}s`);
  } else {
    console.log(`PASSED: All ${results.length} steps. Total: ${(totalMs / 1000).toFixed(1)}s`);
  }
}

main().catch((e) => {
  console.error("\nFatal:", e.message);
  process.exit(1);
});
