# Quick Start Guide

Get HotelMe up and running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- npm or yarn

## Option 1: Fast Start (Recommended)

### 1. Clone and Install
```bash
git clone https://github.com/prateekro/HotelMe.git
cd HotelMe
```

### 2. Start Backend
```bash
cd backend
npm install
npm run dev
```
Backend will run on http://localhost:3001

### 3. Start Frontend (New Terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on http://localhost:5173

### 4. Open Browser
Navigate to http://localhost:5173 and enjoy!

## Option 2: Docker (Coming Soon)
```bash
docker-compose up
```

## First Steps in the App

### 1. View Hotels on Map
- See all 10 luxury hotels displayed on an interactive map
- Click markers to view hotel details and prices

### 2. Apply Filters
- Use the left sidebar to filter by:
  - Location (Country, City)
  - Property Type (Hotel, Resort, Boutique)
  - Star Rating
  - Amenities (WiFi, Pool, Spa, etc.)

### 3. Search for Prices
- Select check-in and check-out dates
- View prices for all hotels on the map or in list view
- Markers change color based on price (green = cheap, red = expensive)

### 4. Find Cheapest Dates
- Click on any hotel to open the Price Calendar
- See prices for the entire month
- Identify the cheapest dates at a glance (green boxes)
- Compare savings percentages

### 5. Switch Views
- Toggle between Map View and List View
- Sort hotels by name, price, rating, or city
- Compare multiple hotels side by side

## Example API Calls

Test the backend directly:

```bash
# Health check
curl http://localhost:3001/health

# Get all hotels
curl http://localhost:3001/api/hotels

# Get hotel price
curl "http://localhost:3001/api/prices/hotel/1?checkIn=2025-12-20&checkOut=2025-12-23"

# Find cheapest dates
curl "http://localhost:3001/api/prices/cheapest/1?startDate=2025-12-20&endDate=2025-12-30&nights=2"

# Cache statistics
curl http://localhost:3001/api/cache/stats
```

## Running Tests

```bash
cd backend
npm test
```

All 25 tests should pass!

## Troubleshooting

### Backend won't start
- Check if port 3001 is available: `lsof -i :3001`
- Verify Node.js version: `node --version` (should be 18+)

### Frontend won't start
- Check if port 5173 is available: `lsof -i :5173`
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Map not loading
- Check browser console for errors
- Verify Leaflet CSS is loaded (check Network tab)
- Try refreshing the page

### Prices loading slowly
- This is normal! Rate limiting adds 2-5 second delays
- Subsequent requests will be faster (cached)
- Watch the cache hit rate improve

## Features to Try

1. **Filter by Country**: Select "United States" to see only US hotels
2. **Search**: Type "Four Seasons" to find specific hotels
3. **Price Comparison**: Select dates and compare prices across hotels
4. **Calendar View**: Open any hotel to see the full month's pricing
5. **Sorting**: Try sorting by price to find the cheapest options
6. **Mobile View**: Resize your browser to see responsive design

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [DEVELOPMENT.md](DEVELOPMENT.md) for architecture details
- See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical overview

## Sample Hotels Included

1. Four Seasons Resort Napa Valley, California
2. InterContinental London Park Lane, UK
3. Casa Pestagua, Cartagena, Colombia
4. Fogo Island Inn, Newfoundland, Canada
5. 1 Hotel Hanalei Bay, Hawaii
6. Four Seasons Astir Palace, Athens, Greece
7. The Fifth Avenue Hotel, New York
8. Fairmont Le Château Frontenac, Quebec, Canada
9. Hotel Jerome, Aspen, Colorado
10. Rosewood Mayakoba, Mexico

## Support

For issues or questions:
- Check the [README.md](README.md) troubleshooting section
- Review the [DEVELOPMENT.md](DEVELOPMENT.md) guide
- Open an issue on GitHub

## What's Next?

Want to add more hotels? Edit `backend/src/data/hotels.json` and restart the backend!

---

**Happy hotel hunting!** 🏨✈️
