import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hotels API
export const hotelsApi = {
  getAll: (params) => api.get('/hotels', { params }),
  getById: (id) => api.get(`/hotels/${id}`),
  getFilterOptions: () => api.get('/hotels/filters/options'),
};

// Prices API
export const pricesApi = {
  getHotelPrice: (hotelId, checkIn, checkOut) => 
    api.get(`/prices/hotel/${hotelId}`, { params: { checkIn, checkOut } }),
  
  getPriceRange: (hotelId, startDate, endDate, nights = 1) =>
    api.get(`/prices/range/${hotelId}`, { params: { startDate, endDate, nights } }),
  
  getCheapestDates: (hotelId, startDate, endDate, nights = 1) =>
    api.get(`/prices/cheapest/${hotelId}`, { params: { startDate, endDate, nights } }),
  
  getMultiplePrices: (hotelIds, checkIn, checkOut) =>
    api.post('/prices/multiple', { hotelIds, checkIn, checkOut }),
};

// Cache API
export const cacheApi = {
  getStats: () => api.get('/cache/stats'),
  clearAll: () => api.delete('/cache/clear'),
  deleteEntry: (key) => api.delete(`/cache/${key}`),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
