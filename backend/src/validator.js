const { DateTime } = require("luxon"); 

//time zones into utc 
function toUTC(localTimeStr, timezone) {
  return DateTime.fromISO(localTimeStr, { zone: timezone }).toUTC();
}

function isValidConnection(inboundFlight, outboundFlight, airportMap) {
  //same connection airport
  if (inboundFlight.destination !== outboundFlight.origin) {
    return { valid: false, layoverMinutes: 0 };
  }

  const connectionAirport = airportMap[inboundFlight.destination];
  const inboundOriginAirport = airportMap[inboundFlight.origin];
  const outboundDestAirport = airportMap[outboundFlight.destination];

  if (!connectionAirport || !inboundOriginAirport || !outboundDestAirport) {
    return { valid: false, layoverMinutes: 0 };
  }

  const arrival = toUTC(inboundFlight.arrivalTime, connectionAirport.timezone);
  const departure = toUTC(outboundFlight.departureTime, connectionAirport.timezone);

  const layoverMinutes = departure.diff(arrival, "minutes").minutes;

  //max layover
  if (layoverMinutes < 0 || layoverMinutes > 360) {
    return { valid: false, layoverMinutes };
  }

  //min layover
  const isDomestic =
    inboundOriginAirport.country === connectionAirport.country &&
    outboundDestAirport.country === connectionAirport.country;

  const minLayover = isDomestic ? 45 : 90;

  if (layoverMinutes < minLayover) {
    return { valid: false, layoverMinutes };
  }

  return { valid: true, layoverMinutes };
}

module.exports = { isValidConnection, toUTC };