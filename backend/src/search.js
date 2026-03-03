const { isValidConnection, toUTC } = require("./validator");

function searchItineraries(origin, destination, date, flights, airportMap) {
  const flightsOnDate = flights.filter((f) => f.departureTime.startsWith(date));
  const results = [];

  // Each queue item: { segments, layovers, currentAirport }
  const queue = [];

  const initialFlights = flightsOnDate.filter((f) => f.origin === origin);
  for (const flight of initialFlights) {
    queue.push({
      segments: [flight],
      layovers: [],
      currentAirport: flight.destination,
    });
  }

  while (queue.length > 0) {
    const { segments, layovers, currentAirport } = queue.shift(); 

    const lastFlight = segments[segments.length - 1];
    if (currentAirport === destination) {
      results.push(buildItinerary(segments, airportMap, layovers));
      continue; 
    }

    if (segments.length >= 3) continue;

    // all possible flights
    const nextFlights = flights.filter((f) => f.origin === currentAirport);

    for (const nextFlight of nextFlights) {
      //avoiding loops 
      const visitedAirports = segments.map((s) => s.origin);
      if (visitedAirports.includes(nextFlight.destination)) continue;

      const { valid, layoverMinutes } = isValidConnection(
        lastFlight,
        nextFlight,
        airportMap
      );

      if (!valid) continue;

      queue.push({
        segments: [...segments, nextFlight],
        layovers: [...layovers, layoverMinutes],
        currentAirport: nextFlight.destination,
      });
    }
  }

  results.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);

  return results;
}

//itinerary object 
 
function buildItinerary(segments, airportMap, layoverMinutes = []) {
  const firstFlight = segments[0];
  const lastFlight = segments[segments.length - 1];

  const originAirport = airportMap[firstFlight.origin];
  const destAirport = airportMap[lastFlight.destination];

  const departureUTC = toUTC(firstFlight.departureTime, originAirport.timezone);
  const arrivalUTC = toUTC(lastFlight.arrivalTime, destAirport.timezone);

  const totalDurationMinutes = arrivalUTC.diff(departureUTC, "minutes").minutes;
  const totalPrice = segments.reduce((sum, f) => sum + f.price, 0);

  return {
    segments: segments.map((f, i) => ({
      flightNumber: f.flightNumber,
      airline: f.airline,
      origin: f.origin,
      destination: f.destination,
      departureTime: f.departureTime,
      arrivalTime: f.arrivalTime,
      aircraft: f.aircraft,
      price: f.price,
      layoverAfterMinutes: layoverMinutes[i] ?? null,
    })),
    totalDurationMinutes,
    totalDurationFormatted: formatDuration(totalDurationMinutes),
    totalPrice: Math.round(totalPrice * 100) / 100,
    stops: segments.length - 1,
  };
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

module.exports = { searchItineraries };