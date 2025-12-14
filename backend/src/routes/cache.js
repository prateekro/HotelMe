const express = require('express');
const router = express.Router();
const cacheService = require('../services/cacheService');

/**
 * GET /api/cache/stats - Get cache statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = cacheService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/cache/clear - Clear all cache
 */
router.delete('/clear', async (req, res) => {
  try {
    await cacheService.clearAll();
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/cache/:key - Delete specific cache entry
 */
router.delete('/:key', async (req, res) => {
  try {
    await cacheService.delete(req.params.key);
    res.json({ message: 'Cache entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
