const axios = require('axios');

class RateLimiter {
  constructor() {
    this.minDelay = parseInt(process.env.MIN_REQUEST_DELAY || 2000);
    this.maxDelay = parseInt(process.env.MAX_REQUEST_DELAY || 5000);
    this.queue = [];
    this.processing = false;
    this.lastRequestTime = 0;
    
    // Circuit breaker
    this.failureCount = 0;
    this.circuitBreakerThreshold = parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD || 5);
    this.circuitBreakerTimeout = parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || 60000);
    this.circuitOpen = false;
    this.circuitOpenTime = 0;
    
    // User agents for rotation
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
  }
  
  /**
   * Get random delay between min and max
   */
  getRandomDelay() {
    return Math.floor(Math.random() * (this.maxDelay - this.minDelay + 1)) + this.minDelay;
  }
  
  /**
   * Get random user agent
   */
  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }
  
  /**
   * Wait for specified milliseconds
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Check if circuit breaker is open
   */
  isCircuitOpen() {
    if (this.circuitOpen) {
      const timeSinceOpen = Date.now() - this.circuitOpenTime;
      if (timeSinceOpen > this.circuitBreakerTimeout) {
        // Try to close circuit
        this.circuitOpen = false;
        this.failureCount = 0;
        console.log('Circuit breaker closed, attempting requests again');
        return false;
      }
      return true;
    }
    return false;
  }
  
  /**
   * Record request failure
   */
  recordFailure() {
    this.failureCount++;
    if (this.failureCount >= this.circuitBreakerThreshold) {
      this.circuitOpen = true;
      this.circuitOpenTime = Date.now();
      console.log(`Circuit breaker opened after ${this.failureCount} failures`);
    }
  }
  
  /**
   * Record request success
   */
  recordSuccess() {
    this.failureCount = Math.max(0, this.failureCount - 1);
  }
  
  /**
   * Make HTTP request with rate limiting and retry logic
   */
  async makeRequest(url, options = {}, retries = 3) {
    // Check circuit breaker
    if (this.isCircuitOpen()) {
      throw new Error('Circuit breaker is open. Too many failures. Please try again later.');
    }
    
    // Calculate delay since last request
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    const delay = this.getRandomDelay();
    
    if (timeSinceLastRequest < delay) {
      await this.wait(delay - timeSinceLastRequest);
    }
    
    // Prepare request headers
    const headers = {
      'User-Agent': this.getRandomUserAgent(),
      'Accept': 'application/json, text/html, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      ...options.headers
    };
    
    try {
      this.lastRequestTime = Date.now();
      
      const response = await axios({
        url,
        method: options.method || 'GET',
        headers,
        timeout: options.timeout || 30000,
        ...options
      });
      
      this.recordSuccess();
      return response;
    } catch (error) {
      // Handle rate limiting (429) and server errors (5xx)
      if (error.response) {
        const status = error.response.status;
        
        if (status === 429 || (status >= 500 && status < 600)) {
          if (retries > 0) {
            // Exponential backoff
            const backoffDelay = Math.min(30000, delay * Math.pow(2, 3 - retries));
            console.log(`Request failed with status ${status}. Retrying in ${backoffDelay}ms... (${retries} retries left)`);
            await this.wait(backoffDelay);
            return this.makeRequest(url, options, retries - 1);
          }
        }
      }
      
      this.recordFailure();
      throw error;
    }
  }
  
  /**
   * Add request to queue
   */
  async queueRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }
  
  /**
   * Process queued requests
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const { requestFn, resolve, reject } = this.queue.shift();
      
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
      
      // Add delay between queued requests
      if (this.queue.length > 0) {
        await this.wait(this.getRandomDelay());
      }
    }
    
    this.processing = false;
  }
  
  /**
   * Get status of rate limiter
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      circuitOpen: this.circuitOpen,
      failureCount: this.failureCount,
      lastRequestTime: this.lastRequestTime
    };
  }
}

module.exports = new RateLimiter();
