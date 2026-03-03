import { useState } from "react";
import SearchForm from "./components/SearchForm";
import ResultsList from "./components/ResultsList";
import axios from "axios";

export default function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch({ origin, destination, date }) {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const { data } = await axios.get("http://localhost:3001/api/search", {
        params: { origin, destination, date },
      });
      setResults(data);
    } catch (err) {
      setError(
        err.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>✈️ SkyPath Flight Search</h1>
      <SearchForm onSearch={handleSearch} />

      {loading && <p>Searching for flights...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {results && <ResultsList data={results} />}
    </div>
  );
}