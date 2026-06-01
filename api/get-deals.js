import dotenv from 'dotenv';
dotenv.config();

export async function handler(req, res) {
  try {
    // 1. Authenticate with Amadeus to get an OAuth2 Access Token
    const authResponse = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_CLIENT_ID,
        client_secret: process.env.AMADEUS_CLIENT_SECRET,
      }),
    });
    
    const { access_token } = await authResponse.json();

    // 2. Query live flight offers with strict Premium Cabin parameters
    const flightResponse = await fetch(
      "https://test.api.amadeus.com/v2/shopping/flight-offers?" + new URLSearchParams({
        originLocationCode: "JFK",      // Can change dynamically based on user preferences
        destinationLocationCode: "LHR",
        departureDate: "2026-10-15",
        adults: "1",
        travelClass: "BUSINESS",         // Forces premium options
        max: "10"
      }), {
        headers: { Authorization: `Bearer ${access_token}` }
      }
    );

    const rawData = await flightResponse.json();
    
    // 3. Format the Amadeus data to match your UI's structure
    const liveDeals = rawData.data.map((offer, index) => {
      const segment = offer.itineraries[0].segments[0];
      const price = parseFloat(offer.price.grandTotal);
      
      return {
        id: `live-${index}`,
        origin: segment.departure.iataCode,
        originCity: "New York", // Map with a local dictionary or city API
        dest: segment.arrival.iataCode,
        destCity: "London",
        airline: offer.validatingAirlineCodes[0],
        cabin: "Business Class",
        region: "Europe",
        normalPrice: Math.round(price * 2.5), // Estimate market rate to calculate savings
        dealPrice: Math.round(price),
        savings: 60, 
        dates: segment.departure.at.split("T")[0],
        seats: offer.numberOfBookableSeats,
        isError: false,
        flag: "🇬🇧",
        expiresIn: "12h"
      };
    });

    res.status(200).json({ deals: liveDeals });
  } catch (error) {
    console.error("Flight API Error:", error);
    res.status(500).json({ error: "Failed to fetch real-world data" });
  }
}