// Cloudflare Pages advanced mode. A single root _worker.js is the ONE server-side
// form that drag-and-drop deploys support (a functions/ folder needs Wrangler,
// which needs Node). It handles the waitlist POST and passes everything else
// through to the static assets.
//
// One-time setup in the Cloudflare dashboard:
//   Storage & Databases > KV > Create namespace, e.g. "tracklint-waitlist"
//   Pages project > Settings > Bindings > add KV namespace, variable name WAITLIST
//
// Read the signups later from the KV browser in the dashboard (no CLI needed).

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/waitlist") {
      if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

      let email;
      try {
        ({ email } = await request.json());
      } catch {
        return json({ error: "Bad request." }, 400);
      }
      email = String(email || "").trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
        return json({ error: "That does not look like an email address." }, 400);
      }

      if (!env.WAITLIST) {
        // Binding missing: log it, but do not ask the visitor to debug our setup.
        console.error("WAITLIST KV binding is not configured");
        return json({ error: "Signup is not available right now. Try again later." }, 503);
      }

      try {
        if (await env.WAITLIST.get("email:" + email)) return json({ ok: true, already: true });
        await env.WAITLIST.put("email:" + email, JSON.stringify({
          email,
          at: new Date().toISOString(),
          country: request.headers.get("CF-IPCountry") || null,
          ref: request.headers.get("Referer") || null,
        }));
        return json({ ok: true });
      } catch (err) {
        console.error("waitlist put failed", err);
        return json({ error: "Could not save that. Try again in a minute?" }, 500);
      }
    }

    // everything else: serve the static site
    return env.ASSETS.fetch(request);
  },
};
