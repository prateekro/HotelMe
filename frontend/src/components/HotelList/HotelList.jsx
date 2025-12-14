import { useState } from 'react';
import './HotelList.css';

export default function HotelList({ hotels, prices, onHotelSelect, selectedHotel }) {
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const getPriceForHotel = (hotelId) => {
    return prices?.[hotelId];
  };
  
  const sortHotels = (hotelsToSort) => {
    return [...hotelsToSort].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          const priceA = getPriceForHotel(a.id);
          const priceB = getPriceForHotel(b.id);
          aValue = priceA?.pricePerNight || Infinity;
          bValue = priceB?.pricePerNight || Infinity;
          break;
        case 'rating':
          aValue = a.starRating;
          bValue = b.starRating;
          break;
        case 'city':
          aValue = a.city.toLowerCase();
          bValue = b.city.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };
  
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };
  
  const sortedHotels = sortHotels(hotels);
  
  return (
    <div className="hotel-list">
      <div className="list-header">
        <h2>{hotels.length} Hotels Found</h2>
        <div className="sort-controls">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
            <option value="city">City</option>
          </select>
          <button 
            className="sort-order"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
      
      <div className="hotels-grid">
        {sortedHotels.map((hotel) => {
          const priceInfo = getPriceForHotel(hotel.id);
          const isSelected = selectedHotel?.id === hotel.id;
          
          return (
            <div 
              key={hotel.id} 
              className={`hotel-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onHotelSelect(hotel)}
            >
              <div className="hotel-header">
                <h3>{hotel.name}</h3>
                <div className="rating">
                  {'⭐'.repeat(hotel.starRating)}
                </div>
              </div>
              
              <div className="hotel-info">
                <p className="location">
                  📍 {hotel.city}, {hotel.country}
                </p>
                <p className="type">{hotel.propertyType} • {hotel.collectionType}</p>
              </div>
              
              <div className="amenities">
                {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                  <span key={idx} className="amenity-tag">{amenity}</span>
                ))}
                {hotel.amenities.length > 4 && (
                  <span className="amenity-tag">+{hotel.amenities.length - 4}</span>
                )}
              </div>
              
              {priceInfo && (
                <div className="price-section">
                  {priceInfo.available ? (
                    <>
                      <div className="price-per-night">
                        ${priceInfo.pricePerNight}
                        <span className="per-night">/night</span>
                      </div>
                      <div className="total-price">
                        Total: ${priceInfo.totalPrice} ({priceInfo.nights} nights)
                      </div>
                    </>
                  ) : (
                    <div className="unavailable">Not Available</div>
                  )}
                </div>
              )}
              
              <button className="view-details-btn">
                View Details
              </button>
            </div>
          );
        })}
      </div>
      
      {hotels.length === 0 && (
        <div className="no-results">
          <p>No hotels found matching your criteria.</p>
          <p>Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
