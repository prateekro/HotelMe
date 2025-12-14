# HotelMe - The Edit by Chase Travel Collection Price Finder

A comprehensive web application to fetch, compare, and visualize prices for hotels in "The Edit by Chase Travel" collection. This app helps users find the cheapest dates to book these luxury hotels and displays them on an interactive map.

## 🌟 Features

### Core Functionality
- **Hotel Price Fetching**: Fetch and compare prices for Chase Edit Collection hotels
- **Interactive Map**: Visualize all hotels on an interactive map with color-coded markers
- **Advanced Filtering**: Filter hotels by location, property type, amenities, rating, and more
- **Price Calendar**: View price trends and find the cheapest dates to book
- **Cheapest Date Finder**: Automatically identify the best deals within a date range

### Anti-Blocking & Rate Limiting
- Request throttling with configurable delays (2-5 seconds)
- Random delays to appear more human-like
- User-Agent rotation with realistic browser strings
- Exponential backoff on rate limit errors
- Circuit breaker pattern to prevent overwhelming servers
- Request queuing for controlled rate processing

### Caching System
- **Multi-layer caching**:
  - In-memory cache for fast access
  - File-based cache for persistence
  - Optional Redis support for production
- Configurable TTL (24 hours for prices, 7 days for metadata)
- Cache statistics dashboard
- Manual cache clearing

### User Interface
- Responsive, mobile-first design
- Map and list view toggle
- Real-time filtering
- Loading states and error handling
- Interactive price calendar modal
- Color-coded price indicators

## 📋 Prerequisites

- Node.js 18+ and npm
- Modern web browser

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/prateekro/HotelMe.git
cd HotelMe
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Copy the environment file and configure:
```bash
cp .env.example .env
# Edit .env with your configuration
```

Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Copy the environment file:
```bash
cp .env.example .env
# Edit .env if needed (default API URL is http://localhost:3001/api)
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Open the Application

Navigate to `http://localhost:5173` in your web browser.

## 🗂️ Project Structure

```
HotelMe/
├── backend/
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   │   ├── hotels.js    # Hotel endpoints
│   │   │   ├── prices.js    # Price endpoints
│   │   │   └── cache.js     # Cache management
│   │   ├── services/        # Business logic
│   │   │   ├── priceService.js    # Price fetching & comparison
│   │   │   ├── cacheService.js    # Multi-layer caching
│   │   │   └── rateLimiter.js     # Rate limiting & anti-blocking
│   │   ├── data/
│   │   │   └── hotels.json  # Hotel database
│   │   └── server.js        # Express server
│   ├── tests/               # Test files
│   ├── .env                 # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/         # Map visualization
│   │   │   ├── Filters/     # Filter panel
│   │   │   ├── HotelList/   # Hotel list view
│   │   │   ├── PriceCalendar/ # Price calendar
│   │   │   └── common/      # Shared components
│   │   ├── services/
│   │   │   └── api.js       # API client
│   │   ├── App.jsx          # Main application
│   │   └── index.css        # Global styles
│   ├── .env                 # Environment variables
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Throttling (milliseconds)
MIN_REQUEST_DELAY=2000
MAX_REQUEST_DELAY=5000

# Cache Configuration
CACHE_TTL_PRICES=86400        # 24 hours
CACHE_TTL_METADATA=604800     # 7 days
USE_FILE_CACHE=true
FILE_CACHE_DIR=./cache

# Circuit Breaker
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=60000

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:3001/api
```

## 🎯 API Endpoints

### Hotels
- `GET /api/hotels` - Get all hotels with optional filters
- `GET /api/hotels/:id` - Get single hotel by ID
- `GET /api/hotels/filters/options` - Get available filter options

### Prices
- `GET /api/prices/hotel/:hotelId` - Get price for specific dates
- `GET /api/prices/range/:hotelId` - Get prices for a date range
- `GET /api/prices/cheapest/:hotelId` - Find cheapest dates
- `POST /api/prices/multiple` - Get prices for multiple hotels

### Cache
- `GET /api/cache/stats` - Get cache statistics
- `DELETE /api/cache/clear` - Clear all cache
- `DELETE /api/cache/:key` - Delete specific cache entry

### Health
- `GET /health` - Health check endpoint

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 Hotel Data

The application includes a sample dataset of 10 hotels from The Edit by Chase Travel Collection:

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

To add more hotels, edit `backend/src/data/hotels.json` with the following format:

```json
{
  "id": "11",
  "name": "Hotel Name",
  "address": "Full Address",
  "city": "City",
  "state": "State/Province",
  "country": "Country",
  "latitude": 0.0,
  "longitude": 0.0,
  "starRating": 5,
  "propertyType": "Hotel|Resort|Boutique",
  "collectionType": "Edit Collection|Edit All-In Collection|Edit Unique Stay Collection",
  "amenities": ["WiFi", "Pool", "Spa", "Gym", "Restaurant", "Parking", "Pet-friendly"],
  "description": "Hotel description"
}
```

## 🎨 Features in Detail

### Filtering System
Filter hotels by:
- **Location**: Country, City, State
- **Property Type**: Hotel, Resort, Boutique
- **Collection**: Edit Collection, Edit All-In, Edit Unique Stay
- **Star Rating**: 1-5 stars
- **Amenities**: WiFi, Pool, Spa, Gym, Restaurant, Parking, Pet-friendly
- **Search**: Name, city, country, or description

### Map Visualization
- Interactive map powered by Leaflet.js
- Color-coded markers based on price range:
  - 🟢 Green: Cheap (< $200/night)
  - 🟡 Yellow: Moderate ($200-$400/night)
  - 🔴 Red: Expensive (> $400/night)
  - ⚫ Gray: Not Available
- Marker clustering for areas with many hotels
- Click markers to view hotel details and prices
- Automatically fits bounds to show all hotels

### Price Calendar
- Visual calendar showing daily prices
- Color-coded dates (green=cheapest, red=most expensive)
- Highlights best deals with savings percentage
- Month navigation
- Shows average price and total available dates

### Rate Limiting & Caching
- Intelligent request throttling to avoid IP blocks
- Multi-layer caching reduces redundant requests
- Circuit breaker prevents overwhelming servers
- Exponential backoff on failures
- Cache hit rate monitoring

## 🔐 Security

- Helmet.js for security headers
- CORS protection
- Rate limiting on API endpoints
- Input validation
- Error handling without exposing sensitive data

## 🚧 Known Limitations

1. **Demo Price Data**: Currently uses simulated prices. In production, integrate with actual hotel APIs.
2. **Limited Dataset**: Sample includes only 10 hotels. The real collection has 1,300+ properties.
3. **No Authentication**: User authentication not implemented.
4. **No Booking**: App only compares prices, doesn't handle bookings.

## 🛠️ Development

### Adding New Hotels

1. Edit `backend/src/data/hotels.json`
2. Add hotel with required fields (see format above)
3. Restart backend server
4. Hotels will appear automatically

### Customizing Cache Duration

Edit `backend/.env`:
```env
CACHE_TTL_PRICES=86400      # Prices cache duration (seconds)
CACHE_TTL_METADATA=604800   # Metadata cache duration (seconds)
```

### Adjusting Rate Limiting

Edit `backend/.env`:
```env
MIN_REQUEST_DELAY=2000      # Minimum delay between requests (ms)
MAX_REQUEST_DELAY=5000      # Maximum delay between requests (ms)
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Disclaimer

This application is for educational and personal use only. Please respect website terms of service and implement ethical scraping practices. The app gracefully handles cases where price fetching fails and should not overwhelm any servers.

## 📚 Resources

- [The Edit by Chase Travel](https://www.chase.com/travel/the-edit)
- [Frequent Miler - Edit Properties Map](https://frequentmiler.com/a-map-and-list-that-show-all-of-the-edit-by-chase-travel%E2%84%A0-properties-in-the-world/)
- [Award Travel - The Edit List](https://www.awardtravel.co/blog/the-edit-by-chase-list)

## 💬 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Made with ❤️ for Chase Sapphire Reserve cardholders
