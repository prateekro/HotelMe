import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './HotelMap.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon based on price
const createCustomIcon = (priceRange) => {
  const colors = {
    cheap: '#10b981',
    moderate: '#f59e0b',
    expensive: '#ef4444',
    unavailable: '#6b7280'
  };
  
  const color = colors[priceRange] || colors.unavailable;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

// Component to fit bounds when hotels change
function FitBounds({ hotels }) {
  const map = useMap();
  
  useEffect(() => {
    if (hotels && hotels.length > 0) {
      const bounds = hotels.map(hotel => [hotel.latitude, hotel.longitude]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [hotels, map]);
  
  return null;
}

export default function HotelMap({ hotels, prices, onHotelSelect, selectedHotel }) {
  const mapRef = useRef(null);
  
  const getPriceRange = (hotelId) => {
    if (!prices || !prices[hotelId]) return 'unavailable';
    
    const price = prices[hotelId];
    if (!price.available) return 'unavailable';
    
    const pricePerNight = price.pricePerNight;
    if (pricePerNight < 200) return 'cheap';
    if (pricePerNight < 400) return 'moderate';
    return 'expensive';
  };
  
  const handleMarkerClick = (hotel) => {
    if (onHotelSelect) {
      onHotelSelect(hotel);
    }
  };
  
  return (
    <div className="hotel-map-container">
      <MapContainer
        center={[38.0, -97.0]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds hotels={hotels} />
        
        <MarkerClusterGroup>
          {hotels.map((hotel) => {
            const priceRange = getPriceRange(hotel.id);
            const icon = createCustomIcon(priceRange);
            const priceInfo = prices?.[hotel.id];
            
            return (
              <Marker
                key={hotel.id}
                position={[hotel.latitude, hotel.longitude]}
                icon={icon}
                eventHandlers={{
                  click: () => handleMarkerClick(hotel),
                }}
              >
                <Popup>
                  <div className="hotel-popup">
                    <h3>{hotel.name}</h3>
                    <p className="location">{hotel.city}, {hotel.country}</p>
                    <p className="rating">⭐ {hotel.starRating} Stars</p>
                    <p className="type">{hotel.propertyType}</p>
                    {priceInfo && priceInfo.available && (
                      <div className="price-info">
                        <p className="price">${priceInfo.pricePerNight}/night</p>
                        <p className="total">Total: ${priceInfo.totalPrice}</p>
                      </div>
                    )}
                    {priceInfo && !priceInfo.available && (
                      <p className="unavailable">Not available</p>
                    )}
                    <button 
                      className="view-details"
                      onClick={() => handleMarkerClick(hotel)}
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
      
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
          <span>Cheap (&lt; $200/night)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
          <span>Moderate ($200-$400/night)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
          <span>Expensive (&gt; $400/night)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#6b7280' }}></span>
          <span>Not Available</span>
        </div>
      </div>
    </div>
  );
}
