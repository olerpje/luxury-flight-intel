import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  "https://wazffysnbmaavoshqpax.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhemZmeXNuYm1hYXZvc2hxcGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDUyODAsImV4cCI6MjA5NTg4MTI4MH0.0ySZenKWRJdrfI5KP8giO6OnuBgx-CUuTsos2c-tXjs"
);
const resend = new Resend(process.env.RESEND_API_KEY);

function dealEmailHTML(deals, plan) {
  const dealCards = deals.map(deal => `
    <div style="background:#1a1a1a;border:1px solid ${deal.is_error ? '#c9a84c' : '#333'};padding:20px;margin-bottom:16px;border-radius:4px;">
      ${deal.is_error ? '<div style="background:#c9a84c;color:#000;font-size:10px;font-weight:800;padding:3px 8px;display:inline-block;margin-bottom:8px;letter-spacing:0.1em;">ERROR FARE</div>' : ''}
      <div style="font-size:11px;color:#666;margin-bottom:4px;">${deal.airline} · ${deal.cabin}</div>
      <div style="font-size:24px;font-weight:700;color:#f0ece4;margin-bottom:4px;">${deal.origin} → ${deal.dest}</div>
      <div style="font-size:12px;color:#888;margin-bottom:12px;">${deal.origin_city} → ${deal.dest_city}</div>
      <div style="display:flex;gap:16px;align-items:center;margin-bottom:12px;">
        <div>
          <div style="font-size:28px;color:#c9a84c;font-weight:700;">$${deal.deal_price}</div>
          <div style="font-size:11px;color:#555;text-decoration:line-through;">$${deal.normal_price}</div>
        </div>
        <div style="background:#1a2e1a;color:#4ade80;padding:4px 10px;font-size:11px;font-weight:700;border-radius:2px;">
          −${deal.savings}% OFF
        </div>
      </div>
      <div style="font-size:11px;color:#555;margin-bottom:12px;">📅 ${deal.dates} · ⏱ Expires: ${deal.expires_at}</div>
      <a href="${deal.source_url || 'https://luxury-flight-intel-woh6.vercel.app'}" style="background:#c9a84c;color:#000;padding:10px 20px;font-size:11px;font-weight:800;text-decoration:none;display:inline-block;letter-spacing:0.1em;">BOOK NOW →</a>
    </div>
  `).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="background:#0a0a0a;color:#f0ece4;font-family:Georgia,serif;margin:0;padding:0;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="text-align:center;margin-bottom:32px;">
          <div style="font-size:10px;color:#c9a84c;letter-spacing:0.2em;margin-bottom:8px;">✦ LUXURY FLIGHT INTEL ✦</div>
          <h1 style="font-size:28px;font-weight:400;color:#f0ece4;margin:0;">New ${plan === 'elite' ? 'First & Business' : 'Business'} Class Deals</h1>
          <p style="color:#555;font-size:13px;margin-top:8px;">Fresh deals just dropped — act fast, seats are limited</p>
        </div>
        ${dealCards}
        <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #1a1a1a;">
          <a href="https://luxury-flight-intel-woh6.vercel.app" style="color:#c9a84c;font-size:11px;letter-spacing:0.1em;">VIEW ALL DEALS →</a>
          <p style="color:#333;font-size:10px;margin-top:16px;">You're receiving this because you subscribed to Luxury Flight Intel.<br>
          To unsubscribe, reply with "unsubscribe".</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { deals } = req.body || {};
  if (!deals || deals.length === 0) {
    return res.status(400).json({ error: "No deals provided" });
  }

  // Get all Pro and Elite subscribers
  const { data: subscribers, error } = await supabase
    .from("subscribers")
    .select("email, plan")
    .in("plan", ["pro", "elite"]);

  if (error) return res.status(500).json({ error: error.message });
  if (!subscribers || subscribers.length === 0) {
    return res.status(200).json({ sent: 0, message: "No subscribers" });
  }

  let sent = 0;
  for (const subscriber of subscribers) {
    // Elite gets all deals, Pro gets only Business Class
    const subscriberDeals = subscriber.plan === "elite"
      ? deals
      : deals.filter(d => d.cabin === "Business Class");

    if (subscriberDeals.length === 0) continue;

    try {
      await resend.emails.send({
        from: "Luxury Flight Intel <onboarding@resend.dev>",
        to: subscriber.email,
        subject: `✈ ${subscriberDeals.length} New ${subscriber.plan === "elite" ? "Premium" : "Business"} Class Deal${subscriberDeals.length > 1 ? "s" : ""} Just Dropped`,
        html: dealEmailHTML(subscriberDeals, subscriber.plan),
      });
      sent++;
    } catch (e) {
      console.error("Email error:", subscriber.email, e.message);
    }
  }

  res.status(200).json({ sent, total: subscribers.length });
}
