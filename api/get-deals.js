import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wazffysnbmaavoshqpax.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhemZmeXNuYm1hYXZvc2hxcGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDUyODAsImV4cCI6MjA5NTg4MTI4MH0.0ySZenKWRJdrfI5KP8giO6OnuBgx-CUuTsos2c-tXjs";
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ deals: data });
}
