import { Router } from 'express';
import Product from '../models/Product';
import { redis } from '../app';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/products - return list, cached in Redis
router.get('/products', async (req, res) => {
  try {
    const cacheKey = 'products:all';
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json({ source: 'cache', data: JSON.parse(cached) });
      }
    } catch (redisErr) {
      // Redis unavailable - log and continue to DB
      const e: any = redisErr as any
      console.warn('Redis unavailable, falling back to DB:', e.message || e);
    }

    const products = await Product.find().lean();
    try {
      await redis.set(cacheKey, JSON.stringify(products), 'EX', 60); // cache 60s
    } catch (redisErr) {
      // ignore cache set errors
      const e: any = redisErr as any
      console.warn('Failed to set redis cache:', e.message || e);
    }
    return res.json({ source: 'db', data: products });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/products - create product and invalidate cache
router.post('/products', requireAdmin, async (req, res) => {
  try {
    const payload = req.body;
    const created = await Product.create(payload);
    try {
      await redis.del('products:all');
    } catch (redisErr) {
      const e: any = redisErr as any
      console.warn('Failed to clear redis cache:', e.message || e);
    }
    return res.status(201).json(created);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

export default router;
