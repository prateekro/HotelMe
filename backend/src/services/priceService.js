const cacheService = require('./cacheService');
const rateLimiter = require('./rateLimiter');

class PriceService {
  /**
   * Simulate fetching prices for a hotel
   * In a real implementation, this would call the actual Chase Travel API or scrape the website
   */
  async fetchHotelPrice(hotelId, checkIn, checkOut) {
    // Check cache first
    const cacheKey = cacheService.generateKey(hotelId, checkIn, checkOut);
    const cachedData = await cacheService.get(cacheKey);
    
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    console.log(`Cache miss for ${cacheKey}. Fetching from source...`);
    
    // Simulate API call with rate limiting
    try {
      const priceData = await rateLimiter.queueRequest(async () => {
        // In a real implementation, this would make an actual HTTP request
        // For demo purposes, we'll simulate with random prices
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        
        // Generate simulated prices based on hotel ID and dates
        const basePrice = 150 + (parseInt(hotelId) * 50);
        const seasonalFactor = 1 + (Math.sin(checkInDate.getMonth() / 12 * Math.PI * 2) * 0.3);
        const randomFactor = 0.8 + (Math.random() * 0.4);
        
        const pricePerNight = Math.round(basePrice * seasonalFactor * randomFactor);
        const totalPrice = pricePerNight * nights;
        
        return {
          hotelId,
          checkIn,
          checkOut,
          nights,
          pricePerNight,
          totalPrice,
          currency: 'USD',
          available: Math.random() > 0.1, // 90% availability
          fetchedAt: new Date().toISOString()
        };
      });
      
      // Cache the result
      await cacheService.set(cacheKey, priceData);
      
      return priceData;
    } catch (error) {
      console.error('Error fetching price:', error.message);
      throw error;
    }
  }
  
  /**
   * Fetch prices for multiple date ranges
   */
  async fetchPriceRange(hotelId, startDate, endDate, nights = 1) {
    const prices = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      const checkIn = currentDate.toISOString().split('T')[0];
      const checkOutDate = new Date(currentDate);
      checkOutDate.setDate(checkOutDate.getDate() + nights);
      const checkOut = checkOutDate.toISOString().split('T')[0];
      
      try {
        const price = await this.fetchHotelPrice(hotelId, checkIn, checkOut);
        prices.push(price);
      } catch (error) {
        console.error(`Failed to fetch price for ${checkIn} to ${checkOut}:`, error.message);
        prices.push({
          hotelId,
          checkIn,
          checkOut,
          error: error.message,
          available: false
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return prices;
  }
  
  /**
   * Find cheapest dates for a hotel
   */
  async findCheapestDates(hotelId, startDate, endDate, nights = 1) {
    const prices = await this.fetchPriceRange(hotelId, startDate, endDate, nights);
    
    // Filter available prices
    const availablePrices = prices.filter(p => p.available && p.totalPrice);
    
    if (availablePrices.length === 0) {
      return {
        hotelId,
        message: 'No available dates found',
        cheapest: null,
        expensive: null,
        average: null,
        allPrices: prices
      };
    }
    
    // Sort by total price
    availablePrices.sort((a, b) => a.totalPrice - b.totalPrice);
    
    const cheapest = availablePrices[0];
    const expensive = availablePrices[availablePrices.length - 1];
    
    // Calculate average
    const totalSum = availablePrices.reduce((sum, p) => sum + p.totalPrice, 0);
    const average = Math.round(totalSum / availablePrices.length);
    
    // Calculate savings
    const savings = expensive.totalPrice - cheapest.totalPrice;
    const savingsPercent = ((savings / expensive.totalPrice) * 100).toFixed(1);
    
    return {
      hotelId,
      cheapest,
      expensive,
      average,
      savings,
      savingsPercent: `${savingsPercent}%`,
      totalOptions: availablePrices.length,
      allPrices: prices
    };
  }
  
  /**
   * Fetch prices for multiple hotels
   */
  async fetchMultipleHotels(hotelIds, checkIn, checkOut) {
    const results = await Promise.allSettled(
      hotelIds.map(hotelId => this.fetchHotelPrice(hotelId, checkIn, checkOut))
    );
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          hotelId: hotelIds[index],
          error: result.reason.message,
          available: false
        };
      }
    });
  }
}

module.exports = new PriceService();
