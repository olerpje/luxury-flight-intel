import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wazffysnbmaavoshqpax.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhemZmeXNuYm1hYXZvc2hxcGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDUyODAsImV4cCI6MjA5NTg4MTI4MH0.0ySZenKWRJdrfI5KP8giO6OnuBgx-CUuTsos2c-tXjs";
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const testDeal = {
    origin: "JFK",
    origin_city: "New York",
    dest: "LHR",
    dest_city: "London",
    airline: "British Airways",
    cabin: "Business Class",
    region: "Europe",
    normal_price: 4800,
    deal_price: 1290,
    savings: 73,
    dates: "Sep 12 - Sep 26",
    seats: 3,
    is_error: true,
    flag: "GB",
    expires_at: "4h",
    source_url: "https://secretflying.com"
  };

  const { data, error } = await supabase.from("deals").insert(testDeal).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true, data });
}
