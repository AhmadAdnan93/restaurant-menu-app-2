// Fallback warm route (Pages Router) - in case App Router /api/warm returns 404
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<{ ok: boolean; message?: string }>
) {
  try {
    const base = (
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      ""
    )
      .trim()
      .replace(/\/$/, "");
    if (base && !base.includes("localhost")) {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 25000);
      await fetch(`${base}/restaurants?publishedOnly=true`, {
        signal: controller.signal,
      });
      clearTimeout(t);
    }
  } catch {
    // Ignore - warm-up best effort
  }
  res.status(200).json({ ok: true });
}
