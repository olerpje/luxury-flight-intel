import { useState, useEffect, useRef } from "react";

const REGIONS = ["All Regions", "North America", "Europe", "Asia & Pacific", "Middle East", "Latin America", "Africa"];
const CABINS = ["All Classes", "Business Class", "First Class", "Premium Economy"];

const SAMPLE_DEALS = [
  {
    id: 1,
    origin: "JFK",
    originCity: "New York",
    dest: "LHR",
    destCity: "London",
    airline: "British Airways",
    cabin: "Business Class",
    region: "Europe",
    normalPrice: 4800,
    dealPrice: 1290,
    savings: 73,
    dates: "Sep 12 – Sep 26",
    seats: 3,
    isError: true,
    flag: "🇬🇧",
    expiresIn: "4h 12m",
  },
  {
    id: 2,
    origin: "LAX",
    originCity: "Los Angeles",
    dest: "SIN",
    destCity: "Singapore",
    airline: "Singapore Airlines",
    cabin: "Business Class",
    region: "Asia & Pacific",
    normalPrice: 6200,
    dealPrice: 1890,
    savings: 70,
    dates: "Oct 3 – Oct 18",
    seats: 6,
    isError: false,
    flag: "🇸🇬",
    expiresIn: "2d 6h",
  },
  {
    id: 3,
    origin: "LHR",
    originCity: "London",
    dest: "DXB",
    destCity: "Dubai",
    airline: "Emirates",
    cabin: "First Class",
    region: "Middle East",
    normalPrice: 9500,
    dealPrice: 2100,
    savings: 78,
    dates: "Nov 1 – Nov 10",
    seats: 2,
    isError: true,
    flag: "🇦🇪",
    expiresIn: "1h 30m",
  },
  {
    id: 4,
    origin: "CDG",
    originCity: "Paris",
    dest: "NRT",
    destCity: "Tokyo",
    airline: "Air France",
    cabin: "Business Class",
    region: "Asia & Pacific",
    normalPrice: 5400,
    dealPrice: 1650,
    savings: 69,
    dates: "Oct 20 – Nov 4",
    seats: 8,
    isError: false,
    flag: "🇯🇵",
    expiresIn: "3d 14h",
  },
  {
    id: 5,
    origin: "ORD",
    originCity: "Chicago",
    dest: "GRU",
    destCity: "São Paulo",
    airline: "LATAM",
    cabin: "Business Class",
    region: "Latin America",
    normalPrice: 3900,
    dealPrice: 980,
    savings: 75,
    dates: "Sep 28 – Oct 12",
    seats: 4,
    isError: false,
    flag: "🇧🇷",
    expiresIn: "18h 45m",
  },
  {
    id: 6,
    origin: "SYD",
    originCity: "Sydney",
    dest: "JFK",
    destCity: "New York",
    airline: "Qantas",
    cabin: "First Class",
    region: "Asia & Pacific",
    normalPrice: 12000,
    dealPrice: 3200,
    savings: 73,
    dates: "Dec 1 – Dec 16",
    seats: 1,
    isError: true,
    flag: "🇺🇸",
    expiresIn: "55m",
  },
];

function TickerBar() {
  const items = [
    "🔥 ERROR FARE: Emirates First Class LHR→DXB — $2,100 (78% off)",
    "⚡ NEW: Singapore Airlines Biz JFK→SIN — $1,890",
    "🚨 LAST SEAT: Qantas First SYD→JFK — $3,200",
    "💺 British Airways Biz JFK→LHR — $1,290 (73% off)",
    "🌏 Air France Biz CDG→NRT — €1,650",
  ];
  return (
    <div style={{
      background: "#c9a84c",
      color: "#0a0a0a",
      fontSize: "12px",
      fontWeight: "600",
      letterSpacing: "0.05em",
      overflow: "hidden",
      height: "32px",
      display: "flex",
      alignItems: "center",
    }}>
      <div style={{
        display: "flex",
        gap: "80px",
        animation: "ticker 40s linear infinite",
        whiteSpace: "nowrap",
        paddingLeft: "100%",
      }}>
        {[...items, ...items].map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function DealCard({ deal, onAnalyze }) {
  const urgency = deal.expiresIn.includes("m") && !deal.expiresIn.includes("d") && !deal.expiresIn.includes("h");
  const isVeryUrgent = deal.seats <= 2;

  return (
    <div style={{
      background: "linear-gradient(135deg, #141414 0%, #1c1c1c 100%)",
      border: `1px solid ${deal.isError ? "#c9a84c44" : "#2a2a2a"}`,
      borderRadius: "2px",
      padding: "28px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s, border-color 0.2s",
      cursor: "pointer",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = deal.isError ? "#c9a84c88" : "#444";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = deal.isError ? "#c9a84c44" : "#2a2a2a";
      }}
    >
      {deal.isError && (
        <div style={{
          position: "absolute",
          top: 0, right: 0,
          background: "#c9a84c",
          color: "#0a0a0a",
          fontSize: "9px",
          fontWeight: "800",
          letterSpacing: "0.12em",
          padding: "4px 10px",
        }}>ERROR FARE</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#666", letterSpacing: "0.1em", marginBottom: "4px" }}>
            {deal.airline.toUpperCase()} · {deal.cabin.toUpperCase()}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "28px", fontFamily: "'Playfair Display', Georgia, serif", color: "#f0ece4", lineHeight: 1 }}>{deal.origin}</div>
              <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>{deal.originCity}</div>
            </div>
            <div style={{ color: "#c9a84c", fontSize: "18px" }}>→</div>
            <div>
              <div style={{ fontSize: "28px", fontFamily: "'Playfair Display', Georgia, serif", color: "#f0ece4", lineHeight: 1 }}>{deal.dest} {deal.flag}</div>
              <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>{deal.destCity}</div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "#666", textDecoration: "line-through", letterSpacing: "0.05em" }}>
            ${deal.normalPrice.toLocaleString()}
          </div>
          <div style={{ fontSize: "32px", fontFamily: "'Playfair Display', Georgia, serif", color: "#c9a84c", lineHeight: 1 }}>
            ${deal.dealPrice.toLocaleString()}
          </div>
          <div style={{
            display: "inline-block",
            background: "#1a2e1a",
            color: "#4ade80",
            fontSize: "11px",
            fontWeight: "700",
            padding: "2px 8px",
            borderRadius: "2px",
            marginTop: "4px",
          }}>
            −{deal.savings}% OFF
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px", fontSize: "11px", color: "#555" }}>
        <span>📅 {deal.dates}</span>
        <span>💺 {deal.seats} seat{deal.seats > 1 ? "s" : ""} left</span>
        <span style={{ color: isVeryUrgent ? "#ef4444" : urgency ? "#f59e0b" : "#555" }}>
          ⏱ Expires in {deal.expiresIn}
        </span>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => onAnalyze(deal)}
          style={{
            flex: 1,
            background: "transparent",
            border: "1px solid #c9a84c",
            color: "#c9a84c",
            padding: "10px",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.1em",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#c9a84c"; e.currentTarget.style.color = "#0a0a0a"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#c9a84c"; }}
        >
          AI ANALYSIS
        </button>
        <button style={{
          flex: 2,
          background: "#c9a84c",
          border: "none",
          color: "#0a0a0a",
          padding: "10px",
          fontSize: "11px",
          fontWeight: "800",
          letterSpacing: "0.1em",
          cursor: "pointer",
          transition: "opacity 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          BOOK NOW →
        </button>
      </div>
    </div>
  );
}

function AIPanel({ deal, onClose }) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState("");

  useEffect(() => {
    async function analyze() {
      setLoading(true);
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-5",
            max_tokens: 1000,
            tools: [{ type: "web_search_20250305", name: "web_search" }],
            system: `You are an elite luxury travel analyst for a premium flight deals service. 
You analyze business and first class fare deals with expert precision. 
Be concise, authoritative, and exciting. Use ✦ as bullet points. Format in clean sections.
Never use markdown headers with #. Use ALL CAPS for section titles followed by a colon.`,
            messages: [{
              role: "user",
              content: `Analyze this flight deal and tell me if it's worth booking:

Airline: ${deal.airline}
Route: ${deal.originCity} (${deal.origin}) → ${deal.destCity} (${deal.dest})
Cabin: ${deal.cabin}
Deal Price: $${deal.dealPrice}
Normal Price: $${deal.normalPrice}
Savings: ${deal.savings}%
Travel Dates: ${deal.dates}
Seats remaining: ${deal.seats}
Is Error Fare: ${deal.isError}
Expires in: ${deal.expiresIn}

Search for current typical ${deal.cabin} fares on this route and any recent news about this airline's premium product. Then provide:
1. VERDICT (book or skip and why, 1-2 sentences)
2. DEAL QUALITY (is this genuinely exceptional or just marketing?)
3. WHAT YOU GET (what the ${deal.cabin} experience is like on ${deal.airline})
4. WATCH OUT FOR (any booking restrictions, change fees, blackout dates)
5. ACT NOW IF (specific traveler profile who should jump on this)`
            }]
          })
        });
        const data = await response.json();
        const text = data.content
          .filter(b => b.type === "text")
          .map(b => b.text)
          .join("\n");
        setAnalysis(text);
      } catch (e) {
        setAnalysis("Unable to load AI analysis. Please try again.");
      }
      setLoading(false);
    }
    analyze();
  }, [deal]);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#0f0f0f",
        border: "1px solid #c9a84c44",
        borderRadius: "2px",
        width: "100%",
        maxWidth: "620px",
        maxHeight: "85vh",
        overflow: "auto",
        padding: "36px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <div style={{ fontSize: "10px", color: "#c9a84c", letterSpacing: "0.15em", marginBottom: "6px" }}>AI DEAL ANALYSIS</div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", color: "#f0ece4" }}>
              {deal.origin} → {deal.dest} {deal.flag}
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>{deal.airline} · {deal.cabin}</div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#666", fontSize: "22px", cursor: "pointer", lineHeight: 1
          }}>×</button>
        </div>

        <div style={{
          display: "flex", gap: "20px", marginBottom: "28px",
          padding: "16px", background: "#141414", borderRadius: "2px"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontFamily: "'Playfair Display', Georgia, serif", color: "#c9a84c" }}>${deal.dealPrice.toLocaleString()}</div>
            <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>DEAL PRICE</div>
          </div>
          <div style={{ width: "1px", background: "#2a2a2a" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontFamily: "'Playfair Display', Georgia, serif", color: "#4ade80" }}>−{deal.savings}%</div>
            <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>SAVINGS</div>
          </div>
          <div style={{ width: "1px", background: "#2a2a2a" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontFamily: "'Playfair Display', Georgia, serif", color: deal.seats <= 2 ? "#ef4444" : "#f0ece4" }}>{deal.seats}</div>
            <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>SEATS LEFT</div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "40px 0" }}>
            <div style={{
              width: "40px", height: "40px",
              border: "2px solid #2a2a2a",
              borderTop: "2px solid #c9a84c",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }} />
            <div style={{ color: "#555", fontSize: "12px", letterSpacing: "0.1em" }}>ANALYZING DEAL QUALITY...</div>
          </div>
        ) : (
          <div style={{
            color: "#b0a898",
            fontSize: "14px",
            lineHeight: "1.8",
            whiteSpace: "pre-wrap",
            fontFamily: "Georgia, serif",
          }}>
            {analysis}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: "28px",
            width: "100%",
            background: "#c9a84c",
            border: "none",
            color: "#0a0a0a",
            padding: "14px",
            fontSize: "11px",
            fontWeight: "800",
            letterSpacing: "0.12em",
            cursor: "pointer",
          }}
        >
          CLOSE ANALYSIS
        </button>
      </div>
    </div>
  );
}

function SearchDeals({ onResults }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          system: `You are a luxury flight deals researcher. Search for current business class and first class flight deals based on the user's query. 
Return ONLY a JSON array (no markdown, no preamble) of deals found, with this structure:
[{
  "id": number,
  "origin": "IATA code",
  "originCity": "City name",
  "dest": "IATA code", 
  "destCity": "City name",
  "airline": "Airline name",
  "cabin": "Business Class" or "First Class" or "Premium Economy",
  "region": one of ["North America","Europe","Asia & Pacific","Middle East","Latin America","Africa"],
  "normalPrice": number,
  "dealPrice": number,
  "savings": number (percentage),
  "dates": "Month DD – Month DD",
  "seats": number (1-10),
  "isError": boolean,
  "flag": "emoji flag of destination",
  "expiresIn": "Xh Xm" or "Xd Xh"
}]
Return 2-4 real deals if found, or make realistic ones based on typical deals for that route/region if live data unavailable.`,
          messages: [{ role: "user", content: `Find business or first class flight deals for: ${query}` }]
        })
      });
      const data = await response.json();
      const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const deals = JSON.parse(clean);
      onResults(deals.map((d, i) => ({ ...d, id: Date.now() + i })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <div style={{
      display: "flex", gap: "0",
      border: "1px solid #333",
      maxWidth: "600px",
      margin: "0 auto",
    }}>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSearch()}
        placeholder="Search: 'NYC to London business class' or 'cheap first class Asia'..."
        style={{
          flex: 1,
          background: "#141414",
          border: "none",
          color: "#f0ece4",
          padding: "14px 18px",
          fontSize: "13px",
          outline: "none",
          fontFamily: "Georgia, serif",
        }}
      />
      <button
        onClick={handleSearch}
        disabled={loading}
        style={{
          background: loading ? "#333" : "#c9a84c",
          border: "none",
          color: "#0a0a0a",
          padding: "14px 24px",
          fontSize: "11px",
          fontWeight: "800",
          letterSpacing: "0.1em",
          cursor: loading ? "not-allowed" : "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {loading ? "SEARCHING..." : "FIND DEALS →"}
      </button>
    </div>
  );
}

export default function App() {
  const [region, setRegion] = useState("All Regions");
  const [cabin, setCabin] = useState("All Classes");
  const [deals, setDeals] = useState(SAMPLE_DEALS);
  const [analyzingDeal, setAnalyzingDeal] = useState(null);
  const [searchDeals, setSearchDeals] = useState([]);

  const allDeals = [...searchDeals, ...deals];
  const filtered = allDeals.filter(d =>
    (region === "All Regions" || d.region === region) &&
    (cabin === "All Classes" || d.cabin === cabin)
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#f0ece4",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Cormorant+Garamond:wght@300;400;500&display=swap');
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #333; }
        ::placeholder { color: #444; }
      `}</style>

      <TickerBar />

      {/* Header */}
      <header style={{
        borderBottom: "1px solid #1e1e1e",
        padding: "20px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#c9a84c", marginBottom: "2px" }}>✦ EXCLUSIVE ✦</div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "26px", letterSpacing: "0.05em" }}>
            LUXURY FLIGHT INTEL
          </div>
        </div>
        <div style={{ display: "flex", gap: "24px", fontSize: "11px", letterSpacing: "0.1em", color: "#555" }}>
          <span style={{ cursor: "pointer" }}>ABOUT</span>
          <span style={{ cursor: "pointer" }}>ALERTS</span>
          <span style={{
            border: "1px solid #c9a84c",
            color: "#c9a84c",
            padding: "6px 16px",
            cursor: "pointer",
          }}>SUBSCRIBE</span>
        </div>
      </header>

      {/* Hero */}
      <div style={{
        textAlign: "center",
        padding: "60px 40px 40px",
        borderBottom: "1px solid #1a1a1a",
        background: "radial-gradient(ellipse at top, #1a150a 0%, #0a0a0a 60%)",
      }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#c9a84c", marginBottom: "16px" }}>
          AI-POWERED PREMIUM CABIN INTELLIGENCE
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(32px, 5vw, 56px)",
          fontWeight: "400",
          lineHeight: 1.1,
          marginBottom: "20px",
          color: "#f0ece4",
        }}>
          Business & First Class Fares<br />
          <em style={{ color: "#c9a84c" }}>at Economy Prices</em>
        </h1>
        <p style={{ color: "#666", fontSize: "15px", maxWidth: "480px", margin: "0 auto 36px", lineHeight: 1.7 }}>
          We surface error fares, flash sales, and hidden deals on lie-flat seats worldwide.
          Every deal analyzed by AI. Updated continuously.
        </p>

        <SearchDeals onResults={results => setSearchDeals(results)} />

        <div style={{ display: "flex", gap: "32px", justifyContent: "center", marginTop: "40px", fontSize: "12px", color: "#444" }}>
          <span>✦ {SAMPLE_DEALS.length} Active Deals</span>
          <span>✦ 44+ Airports Monitored</span>
          <span>✦ Mistake Fares Included</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: "flex",
        gap: "0",
        padding: "0 40px",
        borderBottom: "1px solid #1a1a1a",
        overflowX: "auto",
      }}>
        {REGIONS.map(r => (
          <button key={r} onClick={() => setRegion(r)} style={{
            background: "none",
            border: "none",
            borderBottom: region === r ? "2px solid #c9a84c" : "2px solid transparent",
            color: region === r ? "#c9a84c" : "#555",
            padding: "16px 20px",
            fontSize: "11px",
            letterSpacing: "0.08em",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "color 0.2s",
          }}>{r.toUpperCase()}</button>
        ))}
        <div style={{ width: "1px", background: "#1e1e1e", margin: "8px 16px" }} />
        {CABINS.map(c => (
          <button key={c} onClick={() => setCabin(c)} style={{
            background: cabin === c ? "#c9a84c15" : "none",
            border: cabin === c ? "1px solid #c9a84c44" : "1px solid transparent",
            color: cabin === c ? "#c9a84c" : "#555",
            padding: "8px 16px",
            margin: "8px 4px",
            fontSize: "10px",
            letterSpacing: "0.08em",
            cursor: "pointer",
            borderRadius: "1px",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}>{c.toUpperCase()}</button>
        ))}
      </div>

      {/* Deals Grid */}
      <div style={{ padding: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", color: "#555", letterSpacing: "0.1em" }}>
            {filtered.length} DEAL{filtered.length !== 1 ? "S" : ""} FOUND
          </div>
          <div style={{ fontSize: "11px", color: "#555", display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#c9a84c", display: "inline-block", animation: "spin 3s linear infinite" }} />
            LIVE MONITORING
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#444" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>✈</div>
            <div style={{ fontSize: "14px", letterSpacing: "0.1em" }}>NO DEALS MATCH YOUR FILTERS</div>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "16px",
          }}>
            {filtered.map(deal => (
              <DealCard key={deal.id} deal={deal} onAnalyze={setAnalyzingDeal} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #1a1a1a",
        padding: "40px",
        textAlign: "center",
        color: "#333",
        fontSize: "11px",
        letterSpacing: "0.1em",
      }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", color: "#555", marginBottom: "12px" }}>
          LUXURY FLIGHT INTEL
        </div>
        <div>MISTAKE FARES · FLASH SALES · PREMIUM CABINS · WORLDWIDE COVERAGE</div>
      </footer>

      {analyzingDeal && (
        <AIPanel deal={analyzingDeal} onClose={() => setAnalyzingDeal(null)} />
      )}
    </div>
  );
}
