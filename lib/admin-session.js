/** Signed admin session cookie — Edge + Node compatible (Web Crypto only). */

export const COOKIE_NAME = "loop_admin_session";
export const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function enc() {
  return new TextEncoder();
}

async function hmacHex(message, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signSession(secret) {
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const payload = JSON.stringify({ exp, v: 1 });
  const sig = await hmacHex(payload, secret);
  const body = btoa(payload);
  return `${body}.${sig}`;
}

export async function verifySession(token, secret) {
  if (!token || !secret) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return false;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let payload;
  try {
    payload = atob(body);
  } catch {
    return false;
  }
  const expected = await hmacHex(payload, secret);
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return false;
  try {
    const data = JSON.parse(payload);
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function getCookie(request, name) {
  const raw = request.headers.get("cookie") || "";
  const parts = raw.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function cookieBase() {
  const secure = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
  return `Path=/; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`;
}

export function sessionCookieHeader(value) {
  return `${COOKIE_NAME}=${encodeURIComponent(value)}; ${cookieBase()}; Max-Age=${MAX_AGE_SEC}`;
}

export function clearSessionCookieHeader() {
  return `${COOKIE_NAME}=; ${cookieBase()}; Max-Age=0`;
}

export function timingSafeEqual(a, b) {
  const x = String(a);
  const y = String(b);
  if (x.length !== y.length) return false;
  let out = 0;
  for (let i = 0; i < x.length; i++) out |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return out === 0;
}
