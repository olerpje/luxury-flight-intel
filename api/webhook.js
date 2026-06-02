import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  "https://wazffysnbmaavoshqpax.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhemZmeXNuYm1hYXZvc2hxcGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDUyODAsImV4cCI6MjA5NTg4MTI4MH0.0ySZenKWRJdrfI5KP8giO6OnuBgx-CUuTsos2c-tXjs"
);

const PRO_PRICE_ID = "price_1TdVArEcQx0DO13we6UF5sf8";
const ELITE_PRICE_ID = "price_1TdTCxEcQx0DO13wlxlp9gOe";

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  const subscription = event.data.object;

  if (["customer.subscription.created", "customer.subscription.updated"].includes(event.type)) {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const email = customer.email;
    const priceId = subscription.items.data[0].price.id;
    const plan = priceId === ELITE_PRICE_ID ? "elite" : priceId === PRO_PRICE_ID ? "pro" : "free";

    await supabase.from("subscribers").upsert({
      email,
      stripe_customer_id: subscription.customer,
      plan,
      updated_at: new Date().toISOString(),
    }, { onConflict: "email" });
  }

  if (event.type === "customer.subscription.deleted") {
    const customer = await stripe.customers.retrieve(subscription.customer);
    await supabase.from("subscribers").upsert({
      email: customer.email,
      plan: "free",
      updated_at: new Date().toISOString(),
    }, { onConflict: "email" });
  }

  res.status(200).json({ received: true });
}