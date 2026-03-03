import { useState } from "react";

export default function SearchForm({ onSearch }) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("2024-03-15");
  const [validationError, setValidationError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setValidationError("");

    if (!origin || !destination || !date) {
      setValidationError("All fields are required.");
      return;
    }
    if (origin.length !== 3 || destination.length !== 3) {
      setValidationError("Airport codes must be 3 letters (e.g. JFK, LAX).");
      return;
    }
    if (origin.toUpperCase() === destination.toUpperCase()) {
      setValidationError("Origin and destination cannot be the same.");
      return;
    }

    onSearch({ origin, destination, date });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
      <div>
        <label>Origin</label><br />
        <input
          value={origin}
          onChange={(e) => setOrigin(e.target.value.toUpperCase())}
          placeholder="JFK"
          maxLength={3}
          style={{ padding: "0.5rem", fontSize: "1rem", width: 80 }}
        />
      </div>

      <div>
        <label>Destination</label><br />
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value.toUpperCase())}
          placeholder="LAX"
          maxLength={3}
          style={{ padding: "0.5rem", fontSize: "1rem", width: 80 }}
        />
      </div>

      <div>
        <label>Date</label><br />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />
      </div>

      <div style={{ alignSelf: "flex-end" }}>
        <button type="submit" style={{ padding: "0.5rem 1.5rem", fontSize: "1rem" }}>
          Search
        </button>
      </div>

      {validationError && (
        <p style={{ color: "red", width: "100%", margin: 0 }}>{validationError}</p>
      )}
    </form>
  );
}