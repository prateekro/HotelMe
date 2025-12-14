const express = require('express');
const router = express.Router();
const priceService = require('../services/priceService');

/**
 * GET /api/prices/hotel/:hotelId - Get price for a specific hotel and dates
 */
router.get('/hotel/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { checkIn, checkOut } = req.query;
    
    if (!checkIn || !checkOut) {
      return res.status(400).json({ 
        error: 'checkIn and checkOut dates are required' 
      });
    }
    
    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    if (checkInDate < today) {
      return res.status(400).json({ error: 'Check-in date cannot be in the past' });
    }
    
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }
    
    const price = await priceService.fetchHotelPrice(hotelId, checkIn, checkOut);
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/prices/range/:hotelId - Get prices for a date range
 */
router.get('/range/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { startDate, endDate, nights = 1 } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'startDate and endDate are required' 
      });
    }
    
    const prices = await priceService.fetchPriceRange(
      hotelId, 
      startDate, 
      endDate, 
      parseInt(nights)
    );
    
    res.json({
      hotelId,
      startDate,
      endDate,
      nights: parseInt(nights),
      prices
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/prices/cheapest/:hotelId - Find cheapest dates
 */
router.get('/cheapest/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { startDate, endDate, nights = 1 } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'startDate and endDate are required' 
      });
    }
    
    const result = await priceService.findCheapestDates(
      hotelId, 
      startDate, 
      endDate, 
      parseInt(nights)
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/prices/multiple - Get prices for multiple hotels
 */
router.post('/multiple', async (req, res) => {
  try {
    const { hotelIds, checkIn, checkOut } = req.body;
    
    if (!hotelIds || !Array.isArray(hotelIds) || hotelIds.length === 0) {
      return res.status(400).json({ error: 'hotelIds array is required' });
    }
    
    if (!checkIn || !checkOut) {
      return res.status(400).json({ 
        error: 'checkIn and checkOut dates are required' 
      });
    }
    
    const prices = await priceService.fetchMultipleHotels(hotelIds, checkIn, checkOut);
    res.json({
      checkIn,
      checkOut,
      prices
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
