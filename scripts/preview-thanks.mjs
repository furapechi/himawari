// Local visual QA only. Does not accept inquiries or send mail. Never deploy this server.
import { createServer } from "node:http";
import { createHmac } from "node:crypto";

const secret = process.env.CONTACT_HASH_SALT;
if (!secret) throw new Error("Set the same local CONTACT_HASH_SALT as the preview Next server");
const server = createServer(async (request, response) => {
  const url = new URL(request.url, "http://127.0.0.1:3013");
  if (request.method !== "GET" || !(url.pathname === "/contact/thanks" || url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/images/") || url.pathname === "/icon.svg")) {
    response.writeHead(404); response.end("Preview only: /contact/thanks"); return;
  }
  const data = Buffer.from(JSON.stringify({ reference: "HF-000123", mailQueued: url.searchParams.get("mail") !== "off", expires: Date.now() + 3600000 })).toString("base64url");
  const signature = createHmac("sha256", secret).update(data).digest("base64url");
  try {
    const upstream = await fetch(`http://127.0.0.1:3012${url.pathname}`, {
      redirect: "manual", headers: { Cookie: `himawari_contact_receipt=${data}.${signature}` },
    });
    response.writeHead(upstream.status, { "Content-Type": upstream.headers.get("content-type") || "text/plain", "Cache-Control": "no-store" });
    response.end(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    response.writeHead(502); response.end("Start the local Next server on 127.0.0.1:3012 first");
  }
});
server.listen(3013, "127.0.0.1", () => console.log("Local visual preview: http://127.0.0.1:3013/contact/thanks"));
