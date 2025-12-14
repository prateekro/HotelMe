const NodeCache = require('node-cache');
const fs = require('fs').promises;
const path = require('path');

class CacheService {
  constructor() {
    // In-memory cache
    this.memoryCache = new NodeCache({ 
      stdTTL: parseInt(process.env.CACHE_TTL_PRICES || 86400),
      checkperiod: 600 
    });
    
    // File cache configuration
    this.useFileCache = process.env.USE_FILE_CACHE === 'true';
    this.fileCacheDir = path.resolve(process.env.FILE_CACHE_DIR || './cache');
    
    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0
    };
    
    // Initialize file cache directory
    if (this.useFileCache) {
      this.initFileCacheDir();
    }
  }
  
  async initFileCacheDir() {
    try {
      await fs.mkdir(this.fileCacheDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create cache directory:', error);
    }
  }
  
  /**
   * Generate cache key from parameters
   */
  generateKey(hotelId, checkIn, checkOut, roomType = 'standard') {
    return `hotel_${hotelId}_${checkIn}_${checkOut}_${roomType}`;
  }
  
  /**
   * Get data from cache (checks memory first, then file)
   */
  async get(key) {
    // Try memory cache first
    const memoryData = this.memoryCache.get(key);
    if (memoryData !== undefined) {
      this.stats.hits++;
      return memoryData;
    }
    
    // Try file cache if enabled
    if (this.useFileCache) {
      try {
        const filePath = path.join(this.fileCacheDir, `${key}.json`);
        const fileData = await fs.readFile(filePath, 'utf8');
        const parsed = JSON.parse(fileData);
        
        // Check if cache is still valid
        if (parsed.expiry && parsed.expiry > Date.now()) {
          // Restore to memory cache
          this.memoryCache.set(key, parsed.data);
          this.stats.hits++;
          return parsed.data;
        } else {
          // Cache expired, delete file
          await fs.unlink(filePath);
        }
      } catch (error) {
        // File not found or error reading - cache miss
      }
    }
    
    this.stats.misses++;
    return null;
  }
  
  /**
   * Set data in cache (both memory and file if enabled)
   */
  async set(key, data, ttl = null) {
    const cacheTTL = ttl || parseInt(process.env.CACHE_TTL_PRICES || 86400);
    
    // Set in memory cache
    this.memoryCache.set(key, data, cacheTTL);
    
    // Set in file cache if enabled
    if (this.useFileCache) {
      try {
        const filePath = path.join(this.fileCacheDir, `${key}.json`);
        const cacheData = {
          data,
          expiry: Date.now() + (cacheTTL * 1000)
        };
        await fs.writeFile(filePath, JSON.stringify(cacheData), 'utf8');
      } catch (error) {
        console.error('Failed to write to file cache:', error);
      }
    }
    
    this.stats.sets++;
  }
  
  /**
   * Delete specific cache entry
   */
  async delete(key) {
    this.memoryCache.del(key);
    
    if (this.useFileCache) {
      try {
        const filePath = path.join(this.fileCacheDir, `${key}.json`);
        await fs.unlink(filePath);
      } catch (error) {
        // File not found - ignore
      }
    }
  }
  
  /**
   * Clear all cache
   */
  async clearAll() {
    this.memoryCache.flushAll();
    
    if (this.useFileCache) {
      try {
        const files = await fs.readdir(this.fileCacheDir);
        await Promise.all(
          files.map(file => fs.unlink(path.join(this.fileCacheDir, file)))
        );
      } catch (error) {
        console.error('Failed to clear file cache:', error);
      }
    }
    
    this.stats = { hits: 0, misses: 0, sets: 0 };
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(2) : 0;
    
    return {
      ...this.stats,
      total,
      hitRate: `${hitRate}%`,
      memoryKeys: this.memoryCache.keys().length
    };
  }
}

module.exports = new CacheService();
