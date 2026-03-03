const fs = require("fs");
const path = require("path");

//loading flights.json 
const raw = fs.readFileSync(
  path.join(__dirname, "../../flights.json"),
  "utf-8"
);
const data = JSON.parse(raw);

//airport map
const airportMap = {};
for (const airport of data.airports) {
  airportMap[airport.code] = airport;
}

const flights = data.flights;

module.exports = { airportMap, flights };