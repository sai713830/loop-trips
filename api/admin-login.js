import {
  signSession,
  sessionCookieHeader,
  timingSafeEqual,
} from "../lib/admin-session.js";

const FAIL_DELAY_MS = 1200;

function json(data, status, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extraHeaders },
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || !secret) {
    return json({ error: "Admin auth is not configured" }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const attempt = String(body.password || "").trim();
  if (!attempt || !timingSafeEqual(attempt, password)) {
    await sleep(FAIL_DELAY_MS);
    return json({ error: "Wrong password" }, 401);
  }

  const token = await signSession(secret);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookieHeader(token) });
}
