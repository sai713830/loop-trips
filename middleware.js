import {
  COOKIE_NAME,
  getCookie,
  verifySession,
} from "./lib/admin-session.js";

const GATE = "/admin-gate.html";

function isProtected(pathname) {
  return pathname === "/admin" || pathname === "/admin.html" || pathname === "/js/admin.js";
}

export default async function middleware(request) {
  const { pathname } = new URL(request.url);
  if (!isProtected(pathname)) return;

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    return new Response("Admin is not configured on this deployment.", { status: 503 });
  }

  const token = getCookie(request, COOKIE_NAME);
  if (token && (await verifySession(token, secret))) return;

  if (pathname === "/js/admin.js") {
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const gate = new URL(GATE, request.url);
  gate.searchParams.set("next", "/admin");
  return Response.redirect(gate.toString(), 302);
}

export const config = {
  matcher: ["/admin", "/admin.html", "/js/admin.js"],
};
