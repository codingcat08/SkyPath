# ✈️ SkyPath — Flight Connection Search Engine

A flight itinerary search engine that finds flight connections, with full timezone-aware duration calculation and connection validation.

---

## How to Run

```bash
git clone https://github.com/codingcat08/SkyPath.git
cd SkyPath
docker-compose up
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

---

## Project Structure

```
SkyPath/
├── backend/
│   ├── src/
│   │   ├── index.js       # Express server, input validation, routes
│   │   ├── data.js        # Loads flights.json, builds airport lookup map
│   │   ├── validator.js   # Connection rules (layover, domestic/international)
│   │   └── search.js      # BFS itinerary search algorithm
│   └── Dockerfile
├── frontend/
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchForm.jsx     # Origin, destination, date inputs with validation
│   │   │   ├── ResultsList.jsx    # Renders count + list of itinerary cards
│   │   │   └── ItineraryCard.jsx  # Single itinerary with segments, layovers, price
│   │   ├── App.jsx        # Root component, API call, loading/error state
│   │   ├── App.css        # App-level styles
│   │   └── main.jsx       # React entry point
│   ├── index.html         # HTML shell
│   ├── vite.config.js     # Vite configuration
│   └── Dockerfile
├── flights.json           # Dataset 
├── docker-compose.yml
└── README.md
```

---

## Architecture Decisions

### 1. BFS using Queue for Itinerary Search

The search algorithm uses Breadth-First Search with a queue to find all valid itineraries up to 2 stops (3 segments maximum).

Each item in the queue carries the full partial path built so far:

```js
{
  segments: [flight1, flight2],
  layovers: [90],
  currentAirport: "ORD"
}
```

---

### 2. Airport Lookup Map

When `data.js` loads `flights.json` at startup, it converts the airports array into a key-value map. 
This gives **O(1)** airport lookups everywhere in the codebase. The alternative — scanning the airports array with `.find()` on every lookup — is **O(n)** and is called thousands of times during a search inside nested loops. The map keeps every lookup instant regardless of dataset size.

```js
{
  "JFK": { timezone: "America/New_York", country: "US", ... },
  "LAX": { timezone: "America/Los_Angeles", country: "US", ... }
}
```

---

### 3. Separation into Four Files

The backend is split into four files. Connection rules can be changed in one place without touching search logic, and the algorithm can be tested independently from the API layer.
 

| File | Responsibility |
|------|---------------|
| `data.js` | Loads and indexes the dataset at startup |
| `validator.js` | All connection rule logic |
| `search.js` | BFS algorithm |
| `index.js` | HTTP layer, routing, input validation |


---

### 4. Validation at the API Layer Before Search Runs

We check for invalid input before running the search algorithm. It "fails fast" means if the input is bad, we return an error immediately without wasting any work.
```
GET /api/search?origin=XXX&destination=LAX&date=2024-03-15
→ 400 { "error": "Unknown airport code: XXX" }
```

---

### 5. Luxon for Timezone-Aware Duration Calculation

All times in `flights.json` are in **local airport time**. We convert everything to UTC first using Luxon.

```js
DateTime.fromISO("2024-03-15T08:30:00", { zone: "America/New_York" }).toUTC()
```

---

## Tradeoffs

### 1. In-Memory Data vs a Real Database

The dataset is loaded into memory at startup. There is no database.
In a production system with millions of flights and real-time updates, a database like PostgreSQL with proper indexing on `origin`, `destination`, and `departureTime` would be necessary.

---

### 2.BFS vs Dijkstra's Algorithm

At the scale of millions of flights — Dijkstra's would be significantly more efficient because it stops exploring a path the moment its cost exceeds the best solution found so far. BFS was chosen here for simplicity.

| | BFS | Dijkstra's |
|---|-----|------------|
| Approach | Explores all paths, sorts at the end | Always expands cheapest path first |
| Scale | Fine for small datasets | Better at scale |
| Readability | easy to follow | Requires a priority queue |

---

## Possible Improvements 

### 1. Add a Database

### 2. Add Caching
The same search (same origin, destination, date) always returns the same results since the data is static. A simple in-memory cache or Redis instance could store results keyed by search parameters and skip the BFS entirely on repeated queries.

### 3. Airport Autocomplete on the Search Form
Rather than typing raw IATA codes, users would type a city name and see a live dropdown of matching airports. This would require a `/api/airports?q=` endpoint on the backend .
