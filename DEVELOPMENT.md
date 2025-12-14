# Development Guide

## Quick Start

### Running Both Services

1. **Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

2. **Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

3. **Open Browser:**
Navigate to http://localhost:5173

## Testing

### Backend Tests
```bash
cd backend
npm test
```

Current test coverage:
- Cache Service: 87%
- Price Service: 90%
- API Routes: 76%
- Overall: 72%

### Manual Testing Checklist

#### Backend API
```bash
# Health check
curl http://localhost:3001/health

# Get all hotels
curl http://localhost:3001/api/hotels

# Get specific hotel
curl http://localhost:3001/api/hotels/1

# Filter hotels by country
curl "http://localhost:3001/api/hotels?country=United%20States"

# Get price for hotel
curl "http://localhost:3001/api/prices/hotel/1?checkIn=2025-12-20&checkOut=2025-12-23"

# Get cheapest dates
curl "http://localhost:3001/api/prices/cheapest/1?startDate=2025-12-20&endDate=2025-12-30&nights=2"

# Get cache stats
curl http://localhost:3001/api/cache/stats

# Clear cache
curl -X DELETE http://localhost:3001/api/cache/clear
```

#### Frontend Testing
1. **Map View:**
   - [ ] Map loads with all hotel markers
   - [ ] Markers are color-coded by price
   - [ ] Clicking marker shows hotel details
   - [ ] Map clusters work for nearby hotels
   - [ ] Legend displays correctly

2. **List View:**
   - [ ] All hotels display in grid
   - [ ] Sorting works (name, price, rating, city)
   - [ ] Click hotel card to view details
   - [ ] Selected hotel highlights

3. **Filters:**
   - [ ] Date selection works
   - [ ] Country filter works
   - [ ] City filter works
   - [ ] Property type filter works
   - [ ] Collection type filter works
   - [ ] Star rating filter works
   - [ ] Amenity checkboxes work
   - [ ] Search bar works
   - [ ] Clear filters button works

4. **Price Calendar:**
   - [ ] Opens when hotel selected
   - [ ] Shows price for each date
   - [ ] Color coding shows cheapest/expensive dates
   - [ ] Displays savings information
   - [ ] Month navigation works
   - [ ] Close button works

5. **Responsive Design:**
   - [ ] Desktop view works
   - [ ] Tablet view works
   - [ ] Mobile view works
   - [ ] Sidebar collapses on mobile

## Architecture

### Backend Structure
```
backend/
├── src/
│   ├── routes/         # Express routes
│   │   ├── hotels.js   # GET /api/hotels, /api/hotels/:id
│   │   ├── prices.js   # GET /api/prices/*
│   │   └── cache.js    # GET/DELETE /api/cache/*
│   ├── services/       # Business logic
│   │   ├── cacheService.js    # Multi-layer caching
│   │   ├── rateLimiter.js     # Rate limiting, circuit breaker
│   │   └── priceService.js    # Price fetching & comparison
│   ├── data/
│   │   └── hotels.json # Hotel database
│   └── server.js       # Express app setup
└── tests/              # Jest tests
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Map/           # Leaflet map with markers
│   │   ├── Filters/       # Filter panel
│   │   ├── HotelList/     # Grid view of hotels
│   │   ├── PriceCalendar/ # Price calendar modal
│   │   └── common/        # Shared components
│   ├── services/
│   │   └── api.js         # Axios API client
│   ├── App.jsx            # Main app component
│   └── index.css          # Global styles
```

## Key Features Implementation

### 1. Rate Limiting
- Configurable delays (2-5 seconds)
- Random jitter for human-like behavior
- User-Agent rotation
- Exponential backoff on errors
- Circuit breaker pattern
- Request queuing

**Files:** `backend/src/services/rateLimiter.js`

### 2. Caching
- In-memory cache (NodeCache)
- File-based cache for persistence
- TTL: 24h for prices, 7 days for metadata
- Cache statistics tracking
- Manual cache clearing

**Files:** `backend/src/services/cacheService.js`

### 3. Price Comparison
- Fetch prices for date ranges
- Find cheapest dates
- Calculate savings percentage
- Handle unavailable dates
- Bulk price fetching

**Files:** `backend/src/services/priceService.js`

### 4. Interactive Map
- Leaflet.js with OpenStreetMap
- Color-coded markers (green/yellow/red)
- Marker clustering
- Click to view details
- Auto-fit bounds

**Files:** `frontend/src/components/Map/HotelMap.jsx`

### 5. Advanced Filtering
- Location (country, city, state)
- Property type
- Collection type
- Star rating
- Amenities (multi-select)
- Text search

**Files:** `frontend/src/components/Filters/FilterPanel.jsx`

## Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
MIN_REQUEST_DELAY=2000
MAX_REQUEST_DELAY=5000
CACHE_TTL_PRICES=86400
CACHE_TTL_METADATA=604800
USE_FILE_CACHE=true
FILE_CACHE_DIR=./cache
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=60000
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

## Common Issues

### Backend doesn't start
- Check if port 3001 is available
- Verify Node.js version (18+)
- Run `npm install` in backend directory

### Frontend doesn't connect to backend
- Verify backend is running on port 3001
- Check VITE_API_URL in frontend/.env
- Check CORS_ORIGIN in backend/.env

### Tests failing
- Clear cache: `curl -X DELETE http://localhost:3001/api/cache/clear`
- Restart backend server
- Check for port conflicts

### Map not showing
- Check browser console for errors
- Verify Leaflet CSS is loaded
- Check hotel coordinates in hotels.json

## Adding New Hotels

Edit `backend/src/data/hotels.json`:

```json
{
  "id": "11",
  "name": "Hotel Name",
  "address": "Full Address",
  "city": "City",
  "state": "State",
  "country": "Country",
  "latitude": 0.0,
  "longitude": 0.0,
  "starRating": 5,
  "propertyType": "Hotel|Resort|Boutique",
  "collectionType": "Edit Collection",
  "amenities": ["WiFi", "Pool", "Spa"],
  "description": "Hotel description"
}
```

Restart backend to apply changes.

## Performance Optimization

### Backend
- Cache is automatically used for repeated requests
- Rate limiter queues requests to prevent overwhelming servers
- Circuit breaker stops requests if too many failures

### Frontend
- Components use React hooks efficiently
- Map uses clustering for many markers
- Price fetching is batched for multiple hotels

## Future Enhancements

- [ ] User authentication
- [ ] Save favorite hotels
- [ ] Price alerts/notifications
- [ ] Historical price trends
- [ ] Export results to CSV/PDF
- [ ] Integration with real Chase Travel API
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-currency support
- [ ] Booking integration

## Debugging

### Enable verbose logging
Backend: Set `LOG_LEVEL=debug` in .env

### View cache contents
```bash
curl http://localhost:3001/api/cache/stats
```

### Monitor rate limiter
```bash
curl http://localhost:3001/health
```

### Check network requests
Open browser DevTools → Network tab

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit pull request

## License

MIT License - see LICENSE file
