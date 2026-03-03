const express = require("express");
const cors = require("cors");
const { airportMap, flights } = require("./data");
const { searchItineraries } = require("./search");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

//GET /api/search?origin=JFK&destination=LAX&date=2024-03-15
app.get("/api/search", (req, res) => {
  const { origin, destination, date } = req.query;
  if (!origin || !destination || !date) {
    return res.status(400).json({
      error: "Missing required parameters: origin, destination, date",
    });
  }

  const originUpper = origin.toUpperCase();
  const destUpper = destination.toUpperCase();

  if (originUpper === destUpper) {
    return res.status(400).json({
      error: "Origin and destination cannot be the same airport",
    });
  }

  if (!airportMap[originUpper]) {
    return res.status(400).json({
      error: `Unknown airport code: ${origin}`,
    });
  }

  if (!airportMap[destUpper]) {
    return res.status(400).json({
      error: `Unknown airport code: ${destination}`,
    });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({
      error: "Invalid date format. Use YYYY-MM-DD",
    });
  }

  try {
    const itineraries = searchItineraries(
      originUpper,
      destUpper,
      date,
      flights,
      airportMap
    );

    return res.json({
      origin: originUpper,
      destination: destUpper,
      date,
      count: itineraries.length,
      itineraries,
    });
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`SkyPath backend running on http://localhost:${PORT}`);
});