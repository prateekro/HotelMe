const request = require('supertest');
const app = require('../src/server');

describe('API Endpoints', () => {
  describe('GET /health', () => {
    test('should return healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/hotels', () => {
    test('should return all hotels', async () => {
      const response = await request(app).get('/api/hotels');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('hotels');
      expect(Array.isArray(response.body.hotels)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
    });

    test('should filter hotels by country', async () => {
      const response = await request(app)
        .get('/api/hotels')
        .query({ country: 'United States' });
      
      expect(response.status).toBe(200);
      expect(response.body.hotels.every(h => h.country === 'United States')).toBe(true);
    });

    test('should search hotels by name', async () => {
      const response = await request(app)
        .get('/api/hotels')
        .query({ search: 'Four Seasons' });
      
      expect(response.status).toBe(200);
      expect(response.body.hotels.length).toBeGreaterThan(0);
      expect(response.body.hotels[0].name).toContain('Four Seasons');
    });
  });

  describe('GET /api/hotels/:id', () => {
    test('should return specific hotel', async () => {
      const response = await request(app).get('/api/hotels/1');
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('1');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('latitude');
      expect(response.body).toHaveProperty('longitude');
    });

    test('should return 404 for non-existent hotel', async () => {
      const response = await request(app).get('/api/hotels/999');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/hotels/filters/options', () => {
    test('should return filter options', async () => {
      const response = await request(app).get('/api/hotels/filters/options');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('countries');
      expect(response.body).toHaveProperty('cities');
      expect(response.body).toHaveProperty('propertyTypes');
      expect(response.body).toHaveProperty('amenities');
      expect(Array.isArray(response.body.countries)).toBe(true);
    });
  });

  describe('GET /api/prices/hotel/:hotelId', () => {
    test('should return price for valid dates', async () => {
      const response = await request(app)
        .get('/api/prices/hotel/1')
        .query({ 
          checkIn: '2025-12-20', 
          checkOut: '2025-12-23' 
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('hotelId');
      expect(response.body).toHaveProperty('pricePerNight');
      expect(response.body).toHaveProperty('totalPrice');
      expect(response.body).toHaveProperty('nights');
    });

    test('should return 400 for missing dates', async () => {
      const response = await request(app).get('/api/prices/hotel/1');
      expect(response.status).toBe(400);
    });

    test('should return 400 for invalid dates', async () => {
      const response = await request(app)
        .get('/api/prices/hotel/1')
        .query({ 
          checkIn: 'invalid-date', 
          checkOut: '2025-12-23' 
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/cache/stats', () => {
    test('should return cache statistics', async () => {
      const response = await request(app).get('/api/cache/stats');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('hits');
      expect(response.body).toHaveProperty('misses');
      expect(response.body).toHaveProperty('hitRate');
    });
  });

  describe('POST /api/prices/multiple', () => {
    test('should return prices for multiple hotels', async () => {
      const response = await request(app)
        .post('/api/prices/multiple')
        .send({
          hotelIds: ['1', '2'],
          checkIn: '2025-12-20',
          checkOut: '2025-12-23'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('prices');
      expect(Array.isArray(response.body.prices)).toBe(true);
      expect(response.body.prices.length).toBe(2);
    });

    test('should return 400 for missing hotelIds', async () => {
      const response = await request(app)
        .post('/api/prices/multiple')
        .send({
          checkIn: '2025-12-20',
          checkOut: '2025-12-23'
        });
      
      expect(response.status).toBe(400);
    });
  });
});
