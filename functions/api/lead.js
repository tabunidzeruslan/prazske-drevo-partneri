// Cloudflare Pages Function: POST /api/lead
// Přijme poptávku z formuláře a pošle ji do Telegramu.
// Proměnné prostředí (Cloudflare → projekt → Settings → Variables and Secrets):
//   TELEGRAM_BOT_TOKEN  – token bota od @BotFather (typ Secret)
//   TELEGRAM_CHAT_ID    – ID chatu / skupiny; více příjemců oddělte čárkou

const FIELDS = [
  ["name", "Jméno"],
  ["phone", "Telefon"],
  ["email", "E-mail"],
  ["obec", "Obec / lokalita"],
  ["rozloha", "Rozloha"],
  ["message", "Zpráva"],
];
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid"];

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8" } });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clean = (v, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function buildMessage(d) {
  const lines = [`🌲 <b>Nová poptávka – les: ${esc(clean(d.obec, 100))}</b>`, ""];
  for (const [key, label] of FIELDS) {
    const v = clean(d[key], key === "message" ? 2000 : 300);
    if (v) lines.push(`<b>${label}:</b> ${esc(v)}`);
  }
  const utm = UTM.map((k) => [k, clean(d[k], 300)]).filter(([, v]) => v);
  if (utm.length) {
    lines.push("", "<b>Zdroj:</b>");
    for (const [k, v] of utm) lines.push(`${k}: ${esc(v)}`);
  }
  return lines.join("\n");
}

export async function onRequestPost({ request, env }) {
  // Formulář posílá JSON z script.js; bez JavaScriptu přijde klasický POST formuláře.
  const isForm = !(request.headers.get("Content-Type") || "").includes("application/json");
  const back = (ok) => Response.redirect(new URL(ok ? "/?odeslano=1#poptavka" : "/?chyba=1#poptavka", request.url), 303);
  const reply = (data, status = 200) => (isForm ? back(data.success) : json(data, status));

  let d;
  try {
    d = isForm ? Object.fromEntries(await request.formData()) : await request.json();
  } catch {
    return reply({ success: false, message: "Bad request" }, 400);
  }

  // honeypot: bot vyplnil skryté pole → tváříme se, že je vše v pořádku
  if (d.botcheck) return reply({ success: true });

  const digits = clean(d.phone).replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15 || clean(d.obec).length < 2 || d.souhlas !== "ano") {
    return reply({ success: false, message: "Invalid data" }, 422);
  }

  const token = env.TELEGRAM_BOT_TOKEN;
  const chats = String(env.TELEGRAM_CHAT_ID || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!token || !chats.length) {
    console.error("Chybí TELEGRAM_BOT_TOKEN nebo TELEGRAM_CHAT_ID");
    return reply({ success: false, message: "Not configured" }, 500);
  }

  const text = buildMessage(d);
  const results = await Promise.all(
    chats.map((chat_id) =>
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, text, parse_mode: "HTML", disable_web_page_preview: true }),
      })
        .then((r) => r.ok)
        .catch(() => false)
    )
  );

  if (!results.some(Boolean)) {
    console.error("Telegram odmítl zprávu pro všechny chaty");
    return reply({ success: false, message: "Telegram error" }, 502);
  }
  return reply({ success: true });
}
