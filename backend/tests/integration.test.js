const request = require('supertest');
const app = require('../src/server');
const cacheService = require('../src/services/cacheService');

describe('Integration Tests', () => {
  beforeEach(async () => {
    await cacheService.clearAll();
  });

  test('should fetch prices and utilize cache', async () => {
    // First request - should be cache miss
    const response1 = await request(app)
      .get('/api/prices/hotel/1')
      .query({ checkIn: '2025-12-20', checkOut: '2025-12-23' });
    
    expect(response1.status).toBe(200);
    
    // Second request - should be cache hit
    const response2 = await request(app)
      .get('/api/prices/hotel/1')
      .query({ checkIn: '2025-12-20', checkOut: '2025-12-23' });
    
    expect(response2.status).toBe(200);
    expect(response2.body).toEqual(response1.body);
    
    // Check cache stats
    const statsResponse = await request(app).get('/api/cache/stats');
    expect(statsResponse.body.hits).toBeGreaterThan(0);
  });

  test('should find cheapest dates for a hotel', async () => {
    const response = await request(app)
      .get('/api/prices/cheapest/1')
      .query({ 
        startDate: '2025-12-20', 
        endDate: '2025-12-25',
        nights: 2
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('cheapest');
    expect(response.body).toHaveProperty('expensive');
    expect(response.body).toHaveProperty('average');
    expect(response.body).toHaveProperty('savingsPercent');
  });

  test('should handle filter combinations', async () => {
    const response = await request(app)
      .get('/api/hotels')
      .query({ 
        country: 'United States',
        minRating: 5,
        amenities: 'WiFi,Pool'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.hotels.every(h => 
      h.country === 'United States' && 
      h.starRating >= 5 &&
      h.amenities.includes('WiFi') &&
      h.amenities.includes('Pool')
    )).toBe(true);
  });

  test('should clear cache successfully', async () => {
    // Add some data to cache
    await request(app)
      .get('/api/prices/hotel/1')
      .query({ checkIn: '2025-12-20', checkOut: '2025-12-23' });
    
    // Clear cache
    const clearResponse = await request(app).delete('/api/cache/clear');
    expect(clearResponse.status).toBe(200);
    
    // Check cache stats
    const statsResponse = await request(app).get('/api/cache/stats');
    expect(statsResponse.body.memoryKeys).toBe(0);
  });

  test('should handle concurrent price requests', async () => {
    const hotelIds = ['1', '2', '3', '4', '5'];
    
    const promises = hotelIds.map(id => 
      request(app)
        .get(`/api/prices/hotel/${id}`)
        .query({ checkIn: '2025-12-20', checkOut: '2025-12-23' })
    );
    
    const responses = await Promise.all(promises);
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pricePerNight');
    });
  }, 30000); // Increase timeout to 30 seconds due to rate limiting

  test('should validate date ranges', async () => {
    // Past date should fail
    const pastResponse = await request(app)
      .get('/api/prices/hotel/1')
      .query({ checkIn: '2020-01-01', checkOut: '2020-01-05' });
    
    expect(pastResponse.status).toBe(400);
    
    // Check-out before check-in should fail
    const invalidRangeResponse = await request(app)
      .get('/api/prices/hotel/1')
      .query({ checkIn: '2025-12-25', checkOut: '2025-12-20' });
    
    expect(invalidRangeResponse.status).toBe(400);
  });
});
