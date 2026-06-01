
import RSSParser from "rss-parser";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wazffysnbmaavoshqpax.supabase.co/rest/v1/";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhemZmeXNuYm1hYXZvc2hxcGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDUyODAsImV4cCI6MjA5NTg4MTI4MH0.0ySZenKWRJdrfI5KP8giO6OnuBgx-CUuTsos2c-tXjs";
const supabase = createClient(supabaseUrl, supabaseKey);

const parser = new RSSParser();

const RSS_FEEDS = [
  "https://www.secretflying.com/posts/feed/",
  "https://theflightdeal.com/feed/",
];

const CABIN_KEYWORDS = ["business", "first class", "first-class", "business class", "lie-flat", "premium", "J class", "biz"];

function extractPrice(text) {
  const patterns = [
    /\$(\d[\d,]*)/,
    /USD\s*(\d[\d,]*)/,
    /from\s*\$(\d[\d,]*)/i,
    /only\s*\$(\d[\d,]*)/i,
  ];
  for (const p of patterns) {
    const match = text.match(p);
    if (match) return parseInt(match[1].replace(/,/g, ""));
  }
  return null;
}

function isCabinDeal(text) {
  return CABIN_KEYWORDS.some(k => text.toLowerCase().includes(k.toLowerCase()));
}

function getCabin(text) {
  const t = text.toLowerCase();
  if (t.includes("first class") || t.includes("first-class")) return "First Class";
  return "Business Class";
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const deals = [];

  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const item of feed.items.slice(0, 30)) {
        const text = `${item.title} ${item.contentSnippet || ""}`;
        if (!isCabinDeal(text)) continue;

        const price = extractPrice(text);
        if (!price || price > 5000) continue;

        deals.push({
          origin: "Various",
          origin_city: "Various",
          dest: "Various",
          dest_city: "Various",
          airline: "Various",
          cabin: getCabin(text),
          region: "Various",
          normal_price: Math.round(price * 3.2),
          deal_price: price,
          savings: 69,
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

  // Test insert
const testDeal = {
  origin: "JFK", origin_city: "New York", dest: "LHR", dest_city: "London",
  airline: "British Airways", cabin: "Business Class", region: "Europe",
  normal_price: 4800, deal_price: 1290, savings: 73, dates: "Sep 12 – Sep 26",
  seats: 3, is_error: true, flag: "🇬🇧", expires_at: "4h", source_url: "https://secretflying.com"
};
const { error } = await supabase.from("deals").insert(testDeal);
if (error) return res.status(500).json({ error: error.message });
res.status(200).json({ scraped: deals.length, test: "inserted!", deals });