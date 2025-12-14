import { useState, useEffect } from 'react';
import { pricesApi } from '../../services/api';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import './PriceCalendar.css';

export default function PriceCalendar({ hotel, nights = 1 }) {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cheapestInfo, setCheapestInfo] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  useEffect(() => {
    if (hotel) {
      fetchPrices();
    }
  }, [hotel, nights, selectedMonth]);
  
  const fetchPrices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startDate = startOfMonth(selectedMonth);
      const endDate = endOfMonth(selectedMonth);
      
      const response = await pricesApi.getCheapestDates(
        hotel.id,
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd'),
        nights
      );
      
      setCheapestInfo(response.data);
      setPrices(response.data.allPrices || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const getPriceColor = (price) => {
    if (!price || !price.available) return '#d1d5db';
    
    const allAvailablePrices = prices
      .filter(p => p.available && p.pricePerNight)
      .map(p => p.pricePerNight);
    
    if (allAvailablePrices.length === 0) return '#d1d5db';
    
    const min = Math.min(...allAvailablePrices);
    const max = Math.max(...allAvailablePrices);
    const range = max - min;
    
    if (range === 0) return '#10b981';
    
    const normalized = (price.pricePerNight - min) / range;
    
    if (normalized < 0.33) return '#10b981'; // green (cheap)
    if (normalized < 0.67) return '#f59e0b'; // yellow (moderate)
    return '#ef4444'; // red (expensive)
  };
  
  const changeMonth = (direction) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setSelectedMonth(newMonth);
  };
  
  return (
    <div className="price-calendar">
      <div className="calendar-header">
        <h3>Price Calendar - {hotel.name}</h3>
        <p className="nights-info">Prices for {nights} night{nights !== 1 ? 's' : ''}</p>
      </div>
      
      {cheapestInfo && cheapestInfo.cheapest && (
        <div className="cheapest-info">
          <h4>Best Deal Found</h4>
          <div className="deal-details">
            <div className="deal-dates">
              <strong>{cheapestInfo.cheapest.checkIn}</strong> to{' '}
              <strong>{cheapestInfo.cheapest.checkOut}</strong>
            </div>
            <div className="deal-price">
              ${cheapestInfo.cheapest.pricePerNight}/night
              <span className="total">(${cheapestInfo.cheapest.totalPrice} total)</span>
            </div>
            {cheapestInfo.savings > 0 && (
              <div className="savings">
                Save ${cheapestInfo.savings} ({cheapestInfo.savingsPercent}) vs most expensive
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="month-selector">
        <button onClick={() => changeMonth(-1)}>← Previous</button>
        <span>{format(selectedMonth, 'MMMM yyyy')}</span>
        <button onClick={() => changeMonth(1)}>Next →</button>
      </div>
      
      {loading && <div className="loading">Loading prices...</div>}
      {error && <div className="error">Error: {error}</div>}
      
      {!loading && !error && (
        <div className="calendar-grid">
          {prices.map((price, index) => (
            <div 
              key={index} 
              className="calendar-day"
              style={{ 
                backgroundColor: getPriceColor(price),
                color: price.available ? 'white' : '#6b7280'
              }}
            >
              <div className="day-date">{format(new Date(price.checkIn), 'MMM d')}</div>
              {price.available && price.pricePerNight ? (
                <div className="day-price">${price.pricePerNight}</div>
              ) : (
                <div className="day-unavailable">N/A</div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {cheapestInfo && (
        <div className="calendar-stats">
          <div className="stat">
            <span className="stat-label">Average Price:</span>
            <span className="stat-value">${cheapestInfo.average}/night</span>
          </div>
          <div className="stat">
            <span className="stat-label">Available Dates:</span>
            <span className="stat-value">{cheapestInfo.totalOptions}</span>
          </div>
        </div>
      )}
      
      <div className="price-legend">
        <div className="legend-item">
          <span className="legend-box" style={{ backgroundColor: '#10b981' }}></span>
          <span>Cheapest</span>
        </div>
        <div className="legend-item">
          <span className="legend-box" style={{ backgroundColor: '#f59e0b' }}></span>
          <span>Moderate</span>
        </div>
        <div className="legend-item">
          <span className="legend-box" style={{ backgroundColor: '#ef4444' }}></span>
          <span>Expensive</span>
        </div>
        <div className="legend-item">
          <span className="legend-box" style={{ backgroundColor: '#d1d5db' }}></span>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
}
