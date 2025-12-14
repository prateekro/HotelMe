const express = require('express');
const router = express.Router();
const hotels = require('../data/hotels.json');

/**
 * GET /api/hotels - Get all hotels with optional filters
 */
router.get('/', (req, res) => {
  try {
    const {
      country,
      city,
      state,
      propertyType,
      collectionType,
      minRating,
      maxRating,
      amenities,
      search
    } = req.query;
    
    let filteredHotels = [...hotels];
    
    // Apply filters
    if (country) {
      filteredHotels = filteredHotels.filter(h => 
        h.country.toLowerCase().includes(country.toLowerCase())
      );
    }
    
    if (city) {
      filteredHotels = filteredHotels.filter(h => 
        h.city.toLowerCase().includes(city.toLowerCase())
      );
    }
    
    if (state) {
      filteredHotels = filteredHotels.filter(h => 
        h.state.toLowerCase().includes(state.toLowerCase())
      );
    }
    
    if (propertyType) {
      filteredHotels = filteredHotels.filter(h => 
        h.propertyType.toLowerCase() === propertyType.toLowerCase()
      );
    }
    
    if (collectionType) {
      filteredHotels = filteredHotels.filter(h => 
        h.collectionType.toLowerCase().includes(collectionType.toLowerCase())
      );
    }
    
    if (minRating) {
      filteredHotels = filteredHotels.filter(h => h.starRating >= parseInt(minRating));
    }
    
    if (maxRating) {
      filteredHotels = filteredHotels.filter(h => h.starRating <= parseInt(maxRating));
    }
    
    if (amenities) {
      const requestedAmenities = amenities.split(',').map(a => a.trim());
      filteredHotels = filteredHotels.filter(h => 
        requestedAmenities.every(amenity => 
          h.amenities.some(ha => ha.toLowerCase() === amenity.toLowerCase())
        )
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredHotels = filteredHotels.filter(h => 
        h.name.toLowerCase().includes(searchLower) ||
        h.city.toLowerCase().includes(searchLower) ||
        h.country.toLowerCase().includes(searchLower) ||
        h.description.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({
      total: filteredHotels.length,
      hotels: filteredHotels
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/hotels/:id - Get single hotel by ID
 */
router.get('/:id', (req, res) => {
  try {
    const hotel = hotels.find(h => h.id === req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/hotels/filters/options - Get available filter options
 */
router.get('/filters/options', (req, res) => {
  try {
    const countries = [...new Set(hotels.map(h => h.country))].sort();
    const cities = [...new Set(hotels.map(h => h.city))].sort();
    const states = [...new Set(hotels.map(h => h.state))].sort();
    const propertyTypes = [...new Set(hotels.map(h => h.propertyType))].sort();
    const collectionTypes = [...new Set(hotels.map(h => h.collectionType))].sort();
    const allAmenities = [...new Set(hotels.flatMap(h => h.amenities))].sort();
    
    res.json({
      countries,
      cities,
      states,
      propertyTypes,
      collectionTypes,
      amenities: allAmenities,
      starRatings: [1, 2, 3, 4, 5]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
