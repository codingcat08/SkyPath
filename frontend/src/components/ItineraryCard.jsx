export default function ItineraryCard({ itinerary }) {
  const { segments, totalDurationFormatted, totalPrice, stops } = itinerary;

  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: 8,
      padding: "1rem",
      marginBottom: "1rem",
      background: "#fafafa"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <span>
          <strong>{stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`}</strong>
          {" · "}{totalDurationFormatted}
        </span>
        <strong style={{ fontSize: "1.2rem" }}>${totalPrice.toFixed(2)}</strong>
      </div>

      {/* Segments */}
      {segments.map((seg, i) => (
        <div key={i}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", padding: "0.5rem 0" }}>
            <span style={{ color: "#555", fontSize: "0.85rem" }}>{seg.flightNumber}</span>
            <span><strong>{seg.origin}</strong> {formatTime(seg.departureTime)}</span>
            <span>→</span>
            <span><strong>{seg.destination}</strong> {formatTime(seg.arrivalTime)}</span>
          </div>

          {/* Layover info between segments */}
          {seg.layoverAfterMinutes !== null && (
            <div style={{
              fontSize: "0.8rem",
              color: "#888",
              paddingLeft: "1rem",
              borderLeft: "2px solid #eee",
              margin: "0.25rem 0 0.25rem 1rem"
            }}>
              ⏱ {formatLayover(seg.layoverAfterMinutes)} layover in {seg.destination}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function formatTime(isoString) {
  // Just show HH:MM from the local time string
  return isoString.slice(11, 16);
}

function formatLayover(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}