import ItineraryCard from "./ItineraryCard";

export default function ResultsList({ data }) {
  if (data.count === 0) {
    return (
      <p>No flights found from <strong>{data.origin}</strong> to <strong>{data.destination}</strong> on {data.date}.</p>
    );
  }

  return (
    <div>
      <h2>{data.count} {data.count !== 1 ? "itineraries" : "itinerary"} found</h2>
      {data.itineraries.map((itinerary, i) => (
        <ItineraryCard key={i} itinerary={itinerary} />
      ))}
    </div>
  );
}