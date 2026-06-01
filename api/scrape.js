import RSSParser from "rss-parser";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const parser = new RSSParser();

const RSS_FEEDS = [
  "https://www.secretflying.com/posts/feed/",
  "https://theflightdeal.com/feed/",
];

const CABIN_KEYWORDS = ["business", "first class", "business class", "lie-flat", "premium"];

function extractPrice(text) {
  const match = text.match(/\$(\d+[\d,]*)/);
  return match ? parseInt(match[1].replace(",", "")) : null;
}

function extractRoute(text) {
  const match = text.match(/([A-Z]{3})\s*[→\-to]+\s*([A-Z]{3})/i);
  return match ? { origin: match[1].toUpperCase(), dest: match[2].toUpperCase() } : null;
}

function isCabinDeal(text) {
  return CABIN_KEYWORDS.some(k => text.toLowerCase().includes(k));
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const deals = [];

  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const item of feed.items.slice(0, 20)) {
        const text = `${item.title} ${item.contentSnippet || ""}`;
        if (!isCabinDeal(text)) continue;

        const price = extractPrice(text);
        const route = extractRoute(text);
        if (!price || !route) continue;

        deals.push({
          origin: route.origin,
          origin_city: route.origin,
          dest: route.dest,
          dest_city: route.dest,
          airline: "Various",
          cabin: text.toLowerCase().includes("first") ? "First Class" : "Business Class",
          region: "Various",
          normal_price: Math.round(price * 3.5),
          deal_price: price,
          savings: 71,
          dates: "Flexible dates",
          seats: 5,
          is_error: text.toLowerCase().includes("error") || text.toLowerCase().includes("mistake"),
          flag: "✈️",
          expires_at: "48h",
          source_url: item.link || feedUrl,
        });
      }
    } catch (e) {
      console.error("Feed error:", feedUrl, e.message);
    }
  }

  if (deals.length > 0) {
    const { error } = await supabase.from("deals").upsert(deals);
    if (error) return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ scraped: deals.length, deals });
}