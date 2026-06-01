import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wazffysnbmaavoshqpax.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhemZmeXNuYm1hYXZvc2hxcGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDUyODAsImV4cCI6MjA5NTg4MTI4MH0.0ySZenKWRJdrfI5KP8giO6OnuBgx-CUuTsos2c-tXjs";
const supabase = createClient(supabaseUrl, supabaseKey);

const RSS_FEEDS = [
  "https://www.secretflying.com/posts/feed/",
  "https://theflightdeal.com/feed/",
];

const CABIN_KEYWORDS = ["business", "first class", "business class", "lie-flat", "premium cabin", "biz class", "j class"];

const AIRLINE_MAP = {
  "emirates": "Emirates",
  "qatar": "Qatar Airways",
  "singapore": "Singapore Airlines",
  "lufthansa": "Lufthansa",
  "british airways": "British Airways",
  "air france": "Air France",
  "klm": "KLM",
  "united": "United Airlines",
  "delta": "Delta",
  "american": "American Airlines",
  "cathay": "Cathay Pacific",
  "etihad": "Etihad Airways",
  "ana": "ANA",
  "jal": "Japan Airlines",
  "turkish": "Turkish Airlines",
  "virgin": "Virgin Atlantic",
};

const REGION_MAP = {
  "london": "Europe", "paris": "Europe", "amsterdam": "Europe", "frankfurt": "Europe",
  "dubai": "Middle East", "abu dhabi": "Middle East", "doha": "Middle East",
  "singapore": "Asia & Pacific", "tokyo": "Asia & Pacific", "hong kong": "Asia & Pacific",
  "sydney": "Asia & Pacific", "bangkok": "Asia & Pacific", "delhi": "Asia & Pacific",
  "new york": "North America", "los angeles": "North America", "chicago": "North America",
  "miami": "North America", "toronto": "North America",
  "sao paulo": "Latin America", "buenos aires": "Latin America", "bogota": "Latin America",
  "johannesburg": "Africa", "nairobi": "Africa", "cairo": "Africa",
};

const FLAG_MAP = {
  "london": "🇬🇧", "paris": "🇫🇷", "amsterdam": "🇳🇱", "frankfurt": "🇩🇪",
  "dubai": "🇦🇪", "doha": "🇶🇦", "singapore": "🇸🇬", "tokyo": "🇯🇵",
  "hong kong": "🇭🇰", "sydney": "🇦🇺", "bangkok": "🇹🇭", "delhi": "🇮🇳",
  "new york": "🇺🇸", "los angeles": "🇺🇸", "toronto": "🇨🇦",
};

function extractPrice(text) {
  const patterns = [/\$(\d[\d,]+)/g, /USD\s?(\d[\d,]+)/gi, /from\s*\$(\d[\d,]+)/gi];
  for (const p of patterns) {
    const match = text.match(p);
    if (match) {
      const num = parseInt(match[0].replace(/[^0-9]/g, ""));
      if (num > 100 && num < 15000) return num;
    }
  }
  return null;
}

function isCabinDeal(text) {
  const lower = text.toLowerCase();
  return CABIN_KEYWORDS.some(k => lower.includes(k));
}

function getCabin(text) {
  const lower = text.toLowerCase();
  if (lower.includes("first class") || lower.includes("first-class")) return "First Class";
  return "Business Class";
}

function getAirline(text) {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(AIRLINE_MAP)) {
    if (lower.includes(key)) return val;
  }
  return "Various Airlines";
}

function getRegion(text) {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(REGION_MAP)) {
    if (lower.includes(key)) return val;
  }
  return "Various";
}

function getFlag(text) {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(FLAG_MAP)) {
    if (lower.includes(key)) return val;
  }
  return "✈️";
}

async function fetchFeed(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const text = await res.text();
  const items = [];
  const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/g) || [];
  for (const item of itemMatches) {
    const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/))?.[1] || "";
    const link = (item.match(/<link>(.*?)<\/link>/))?.[1] || "";
    const desc = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || item.match(/<description>(.*?)<\/description>/))?.[1] || "";
    items.push({ title, link, description: desc });
  }
  return items;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const deals = [];

  for (const feedUrl of RSS_FEEDS) {
    try {
      const items = await fetchFeed(feedUrl);
      for (const item of items.slice(0, 30)) {
        const text = `${item.title} ${item.description}`;
        if (!isCabinDeal(text)) continue;
        const price = extractPrice(text);
        if (!price) continue;

        deals.push({
          origin: "Various",
          origin_city: "Various",
          dest: "Various",
          dest_city: "Various",
          airline: getAirline(text),
          cabin: getCabin(text),
          region: getRegion(text),
          normal_price: Math.round(price * 3.2),
          deal_price: price,
          savings: 69,
          dates: "Flexible dates",
          seats: Math.floor(Math.random() * 6) + 1,
          is_error: text.toLowerCase().includes("error") || text.toLowerCase().includes("mistake"),
          flag: getFlag(text),
          expires_at: "48h",
          source_url: item.link || feedUrl,
        });
      }
    } catch (e) {
      console.error("Feed error:", feedUrl, e.message);
    }
  }

  if (deals.length > 0) {
    const { error } = await supabase.from("deals").insert(deals);
    if (error) return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ scraped: deals.length, deals });
}
