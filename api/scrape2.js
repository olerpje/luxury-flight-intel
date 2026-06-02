import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wazffysnbmaavoshqpax.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhemZmeXNuYm1hYXZvc2hxcGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDUyODAsImV4cCI6MjA5NTg4MTI4MH0.0ySZenKWRJdrfI5KP8giO6OnuBgx-CUuTsos2c-tXjs";
const supabase = createClient(supabaseUrl, supabaseKey);

const RSS_FEEDS = [
  "https://www.secretflying.com/posts/feed/",
  "https://theflightdeal.com/feed/",
  "https://www.flyertalk.com/forum/external.php?type=RSS2&forumids=1657",
  "https://ausbt.com.au/feed",
];

async function fetchFeed(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const text = await res.text();
  const items = [];
  const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/g) || [];
  for (const item of itemMatches) {
    const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/))?.[1] || "";
    const link = (item.match(/<link>(.*?)<\/link>/))?.[1] || "";
    const desc = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || item.match(/<description>(.*?)<\/description>/))?.[1] || "";
    if (title) items.push({ title, link, description: desc.replace(/<[^>]*>/g, "").slice(0, 500) });
  }
  return items;
}

async function extractDealsWithAI(items) {
  const content = items.map(i => `TITLE: ${i.title}\nDESC: ${i.description}\nLINK: ${i.link}`).join("\n\n---\n\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      system: `You are a flight deal extractor. Extract ONLY business class and first class flight deals from the content.
Rules:
- Include deals with € EUR prices too, convert to USD (multiply by 1.1)
- Include deals that mention "lie-flat", "business", "first class", "biz"
- Be generous in extraction - if it sounds like a premium cabin deal, include it
- Estimate normal_price as 3x the deal_price if not mentioned
- For origin/dest, use the cities mentioned or make reasonable guesses based on context

Return a JSON array. Each deal must have:
{
  "origin": "IATA code",
  "origin_city": "City name",
  "dest": "IATA code",
  "dest_city": "City name", 
  "airline": "Airline name or Various Airlines",
  "cabin": "Business Class" or "First Class",
  "region": one of ["North America","Europe","Asia & Pacific","Middle East","Latin America","Africa"],
  "normal_price": number in USD,
  "deal_price": number in USD,
  "savings": number percentage,
  "dates": "Flexible dates",
  "seats": 5,
  "is_error": boolean,
  "flag": "emoji flag of destination",
  "expires_at": "48h",
  "source_url": "the link"
}
Return ONLY valid JSON array, no markdown, no explanation.`,
      messages: [{
        role: "user",
        content: `Extract all business and first class flight deals from these posts:\n\n${content}`
      }]
    })
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || "[]";
console.log("Claude response:", text.slice(0, 500));
  const clean = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON parse error:", clean.slice(0, 200));
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
   {
  const testItems = [{
    title: "ERROR FARE ⚠️ Business Class from Spanish cities to Mexico City, Mexico from only €496 one-way (lie-flat seats)",
    link: "https://secretflying.com/test",
    description: "Fly business class from Madrid or Barcelona to Mexico City for just €496 one way on Iberia. Lie-flat seats included."
  }];
  const deals = await extractDealsWithAI(testItems);
  return res.status(200).json({ test: true, deals });
}
  if (req.method === "OPTIONS") return res.status(200).end();

  const allDeals = [];

  for (const feedUrl of RSS_FEEDS) {
    try {
      const items = await fetchFeed(feedUrl);
      if (items.length === 0) continue;

      const deals = await extractDealsWithAI(items.slice(0, 20));

      for (const deal of deals) {
        if (deal.origin && deal.dest && deal.deal_price) {
          allDeals.push(deal);
        }
      }
    } catch (e) {
      console.error("Error:", e.message);
    }
  }

  if (allDeals.length > 0) {
    const { error } = await supabase.from("deals").insert(allDeals);
    if (error) return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ scraped: allDeals.length, deals: allDeals });
}
