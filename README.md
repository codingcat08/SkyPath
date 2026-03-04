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

### 2.BFS vs Dijkstra's Algorithm

At the scale of millions of flights — Dijkstra's would be significantly more efficient but it cannot find all paths so we dont use it. 

---


### 3. Airport Lookup Map

When `data.js` loads `flights.json` at startup, it converts the airports array into a key-value map. 
This gives **O(1)** airport lookups everywhere in the codebase. The alternative — scanning the airports array with `.find()` on every lookup — is **O(n)** and is called thousands of times during a search inside nested loops. The map keeps every lookup instant regardless of dataset size.

```js
{
  "JFK": { timezone: "America/New_York", country: "US", ... },
  "LAX": { timezone: "America/Los_Angeles", country: "US", ... }
}
```

---

### 4. Separation into Four Files

The backend is split into four files. Connection rules can be changed in one place without touching search logic, and the algorithm can be tested independently from the API layer.
 

| File | Responsibility |
|------|---------------|
| `data.js` | Loads and indexes the dataset at startup |
| `validator.js` | All connection rule logic |
| `search.js` | BFS algorithm |
| `index.js` | HTTP layer, routing, input validation |


---

### 5. Validation at the API Layer Before Search Runs

We check for invalid input before running the search algorithm. It "fails fast" means if the input is bad, we return an error immediately without wasting any work.
```
GET /api/search?origin=XXX&destination=LAX&date=2024-03-15
→ 400 { "error": "Unknown airport code: XXX" }
```

---

### 6. Luxon for Timezone-Aware Duration Calculation

All times in `flights.json` are in **local airport time**. We convert everything to UTC first using Luxon.

```js
DateTime.fromISO("2024-03-15T08:30:00", { zone: "America/New_York" }).toUTC()
```

---

## Tradeoffs

### 1. BFS on Airport Nodes vs Time-Expanded Graph (Airport, Time) Nodes

The current implementation runs BFS on plain airport nodes, validating layover rules at query time on every edge traversal. The worst case per query is **O(E³)** — at each of the 3 depth levels, all E flights are scanned and filtered.

A more scalable approach would model nodes as **(airport, time)** pairs . Each node represents a specific flight arrival, and edges are pre-validated at startup — an edge only exists if the layover window is legal. This converts the graph into a **(Directed Acyclic Graph)** .
```
Plain BFS:          validate layovers at query time → O(E³) per query
Time-expanded BFS:  validate once at build time     → O(E²) build + O(V' + E') per query
```

At high query volume this matters because the build cost is paid once at startup and every subsequent query is pure graph traversal with no filtering logic.

The query becomes **multi-source BFS** — we start from all **(origin, time)** nodes where the departure date matches the query date, and fan out in parallel:
```js
// Entry points = all departures from origin on query date
const sources = flights.filter(f =>
    f.origin === origin &&
    f.departureTime.date === queryDate
);
// BFS fans out from all sources simultaneously
```

It maps directly to standard multi-source BFS complexity of **O(V' + E')** where V' and E' are only the reachable nodes and edges — not the full graph.

The tradeoff is memory and build time — the time-expanded graph has up to **E nodes and E² edges** versus 25 airport nodes today. For a static dataset with high query volume this is worth it. For a live system where flight schedules change frequently, rebuilding the graph on updates increases complexity.

---


### 2. In-Memory Data vs a Real Database

The dataset is loaded into memory at startup. There is no database.
In a production system with millions of flights and real-time updates, a database like PostgreSQL with proper indexing on `origin`, `destination`, and `departureTime` would be necessary.

---

## Possible Improvements 

### 1. Add a Database

### 2. Add Caching
The same search (same origin, destination, date) always returns the same results since the data is static. A simple in-memory cache or Redis instance could store results keyed by search parameters and skip the BFS entirely on repeated queries.

### 3. Airport Autocomplete on the Search Form
Rather than typing raw IATA codes, users would type a city name and see a live dropdown of matching airports. This would require a `/api/airports?q=` endpoint on the backend .

