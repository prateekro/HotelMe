import { useState, useEffect } from 'react';
import { hotelsApi } from '../../services/api';
import './FilterPanel.css';

export default function FilterPanel({ onFilterChange, onDateChange }) {
  const [filters, setFilters] = useState({
    search: '',
    country: '',
    city: '',
    propertyType: '',
    collectionType: '',
    minRating: '',
    amenities: [],
  });
  
  const [dates, setDates] = useState({
    checkIn: '',
    checkOut: '',
  });
  
  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    cities: [],
    propertyTypes: [],
    collectionTypes: [],
    amenities: [],
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  useEffect(() => {
    loadFilterOptions();
  }, []);
  
  const loadFilterOptions = async () => {
    try {
      const response = await hotelsApi.getFilterOptions();
      setFilterOptions(response.data);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };
  
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };
  
  const handleAmenityToggle = (amenity) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    
    const newFilters = { ...filters, amenities: newAmenities };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };
  
  const handleDateChange = (key, value) => {
    const newDates = { ...dates, [key]: value };
    setDates(newDates);
    if (onDateChange && newDates.checkIn && newDates.checkOut) {
      onDateChange(newDates);
    }
  };
  
  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      country: '',
      city: '',
      propertyType: '',
      collectionType: '',
      minRating: '',
      amenities: [],
    };
    setFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };
  
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };
  
  return (
    <div className="filter-panel">
      <h2>Filter Hotels</h2>
      
      {/* Date Selection */}
      <div className="filter-section">
        <h3>Dates</h3>
        <div className="date-inputs">
          <div className="input-group">
            <label>Check-in</label>
            <input
              type="date"
              value={dates.checkIn}
              min={getTodayDate()}
              onChange={(e) => handleDateChange('checkIn', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Check-out</label>
            <input
              type="date"
              value={dates.checkOut}
              min={dates.checkIn || getTodayDate()}
              onChange={(e) => handleDateChange('checkOut', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Search */}
      <div className="filter-section">
        <div className="input-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Hotel name, city, or description..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
      </div>
      
      {/* Location Filters */}
      <div className="filter-section">
        <h3>Location</h3>
        <div className="input-group">
          <label>Country</label>
          <select
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
          >
            <option value="">All Countries</option>
            {filterOptions.countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        <div className="input-group">
          <label>City</label>
          <select
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
          >
            <option value="">All Cities</option>
            {filterOptions.cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Property Type */}
      <div className="filter-section">
        <div className="input-group">
          <label>Property Type</label>
          <select
            value={filters.propertyType}
            onChange={(e) => handleFilterChange('propertyType', e.target.value)}
          >
            <option value="">All Types</option>
            {filterOptions.propertyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Collection Type */}
      <div className="filter-section">
        <div className="input-group">
          <label>Collection</label>
          <select
            value={filters.collectionType}
            onChange={(e) => handleFilterChange('collectionType', e.target.value)}
          >
            <option value="">All Collections</option>
            {filterOptions.collectionTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Star Rating */}
      <div className="filter-section">
        <div className="input-group">
          <label>Minimum Rating</label>
          <select
            value={filters.minRating}
            onChange={(e) => handleFilterChange('minRating', e.target.value)}
          >
            <option value="">Any Rating</option>
            {[5, 4, 3, 2, 1].map(rating => (
              <option key={rating} value={rating}>{rating}+ Stars</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Advanced Filters Toggle */}
      <button 
        className="toggle-advanced"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? '− Hide' : '+ Show'} Advanced Filters
      </button>
      
      {/* Amenities */}
      {showAdvanced && (
        <div className="filter-section">
          <h3>Amenities</h3>
          <div className="amenities-grid">
            {filterOptions.amenities.map(amenity => (
              <label key={amenity} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>
      )}
      
      {/* Clear Filters Button */}
      <button className="clear-filters" onClick={handleClearFilters}>
        Clear All Filters
      </button>
    </div>
  );
}
