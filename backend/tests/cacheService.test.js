const cacheService = require('../src/services/cacheService');

describe('CacheService', () => {
  beforeEach(async () => {
    await cacheService.clearAll();
  });

  test('should generate cache key correctly', () => {
    const key = cacheService.generateKey('1', '2025-12-20', '2025-12-23');
    expect(key).toBe('hotel_1_2025-12-20_2025-12-23_standard');
  });

  test('should set and get data from cache', async () => {
    const testData = { price: 100, available: true };
    await cacheService.set('test-key', testData);
    
    const retrieved = await cacheService.get('test-key');
    expect(retrieved).toEqual(testData);
  });

  test('should return null for non-existent key', async () => {
    const retrieved = await cacheService.get('non-existent-key');
    expect(retrieved).toBeNull();
  });

  test('should delete specific cache entry', async () => {
    const testData = { price: 100 };
    await cacheService.set('test-key', testData);
    
    await cacheService.delete('test-key');
    const retrieved = await cacheService.get('test-key');
    expect(retrieved).toBeNull();
  });

  test('should clear all cache', async () => {
    await cacheService.set('key1', { data: 1 });
    await cacheService.set('key2', { data: 2 });
    
    await cacheService.clearAll();
    
    const key1 = await cacheService.get('key1');
    const key2 = await cacheService.get('key2');
    expect(key1).toBeNull();
    expect(key2).toBeNull();
  });

  test('should track cache statistics', async () => {
    await cacheService.clearAll();
    
    // Miss
    await cacheService.get('miss-key');
    
    // Set and hit
    await cacheService.set('hit-key', { data: 1 });
    await cacheService.get('hit-key');
    
    const stats = cacheService.getStats();
    expect(stats.hits).toBeGreaterThan(0);
    expect(stats.misses).toBeGreaterThan(0);
    expect(stats.sets).toBeGreaterThan(0);
  });
});
