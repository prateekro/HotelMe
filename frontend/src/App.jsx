import { useState, useEffect } from 'react';
import HotelMap from './components/Map/HotelMap';
import FilterPanel from './components/Filters/FilterPanel';
import HotelList from './components/HotelList/HotelList';
import PriceCalendar from './components/PriceCalendar/PriceCalendar';
import Loading from './components/common/Loading';
import { hotelsApi, pricesApi } from './services/api';
import './App.css';

function App() {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [prices, setPrices] = useState({});
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('map'); // 'map' or 'list'
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    loadHotels();
  }, []);

  useEffect(() => {
    if (dates.checkIn && dates.checkOut && filteredHotels.length > 0) {
      loadPrices();
    }
  }, [dates, filteredHotels]);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const response = await hotelsApi.getAll();
      setHotels(response.data.hotels);
      setFilteredHotels(response.data.hotels);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPrices = async () => {
    try {
      const hotelIds = filteredHotels.map(h => h.id);
      const response = await pricesApi.getMultiplePrices(
        hotelIds,
        dates.checkIn,
        dates.checkOut
      );
      
      const priceMap = {};
      response.data.prices.forEach((price, index) => {
        priceMap[hotelIds[index]] = price;
      });
      setPrices(priceMap);
    } catch (err) {
      console.error('Error loading prices:', err);
    }
  };

  const handleFilterChange = async (filters) => {
    try {
      const response = await hotelsApi.getAll(filters);
      setFilteredHotels(response.data.hotels);
    } catch (err) {
      console.error('Error applying filters:', err);
    }
  };

  const handleDateChange = (newDates) => {
    setDates(newDates);
  };

  const handleHotelSelect = (hotel) => {
    setSelectedHotel(hotel);
    setShowCalendar(true);
  };

  if (loading) {
    return <Loading message="Loading hotels..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={loadHotels}>Retry</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏨 HotelMe</h1>
        <p className="subtitle">The Edit by Chase Travel Collection Price Finder</p>
      </header>

      <div className="app-container">
        <aside className="sidebar">
          <FilterPanel 
            onFilterChange={handleFilterChange}
            onDateChange={handleDateChange}
          />
        </aside>

        <main className="main-content">
          <div className="view-toggle">
            <button 
              className={view === 'map' ? 'active' : ''}
              onClick={() => setView('map')}
            >
              🗺️ Map View
            </button>
            <button 
              className={view === 'list' ? 'active' : ''}
              onClick={() => setView('list')}
            >
              📋 List View
            </button>
          </div>

          {view === 'map' ? (
            <HotelMap
              hotels={filteredHotels}
              prices={prices}
              onHotelSelect={handleHotelSelect}
              selectedHotel={selectedHotel}
            />
          ) : (
            <HotelList
              hotels={filteredHotels}
              prices={prices}
              onHotelSelect={handleHotelSelect}
              selectedHotel={selectedHotel}
            />
          )}
        </main>
      </div>

      {showCalendar && selectedHotel && (
        <div className="modal-overlay" onClick={() => setShowCalendar(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowCalendar(false)}
            >
              ✕
            </button>
            <PriceCalendar hotel={selectedHotel} nights={1} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
