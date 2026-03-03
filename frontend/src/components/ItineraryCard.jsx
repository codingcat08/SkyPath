export default function ItineraryCard({ itinerary }) {
  const { segments, totalDurationFormatted, totalPrice, stops } = itinerary;

  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: 8,
      padding: "1rem",
      marginBottom: "1rem",
      background: "#1e1e2e",        // dark card background
      color: "#ffffff",              // all text white
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <span style={{ color: "#aaa" }}>
          <strong style={{ color: "#fff" }}>{stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`}</strong>
          {" · "}{totalDurationFormatted}
        </span>
        <strong style={{ fontSize: "1.2rem", color: "#4ade80" }}>${totalPrice.toFixed(2)}</strong>
      </div>

      {/* Segments */}
      {segments.map((seg, i) => (
        <div key={i}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", padding: "0.5rem 0" }}>
            <span style={{ color: "#888", fontSize: "0.85rem" }}>{seg.flightNumber}</span>
            <span><strong>{seg.origin}</strong> {formatTime(seg.departureTime)}</span>
            <span style={{ color: "#aaa" }}>→</span>
            <span><strong>{seg.destination}</strong> {formatTime(seg.arrivalTime)}</span>
          </div>

          {seg.layoverAfterMinutes !== null && (
            <div style={{
              fontSize: "0.8rem",
              color: "#facc15",
              paddingLeft: "1rem",
              borderLeft: "2px solid #333",
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
  return isoString.slice(11, 16);
}

function formatLayover(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}