import express, { Router, Request, Response } from 'express';
import { query } from '../config/database';

const router: Router = express.Router();

// Get all components
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { category, limit = 100, offset = 0 } = _req.query;

    let sql = 'SELECT id, category, subcategory, brand, model FROM components WHERE 1=1';
    const params: any[] = [];

    if (category) {
      sql += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    sql += ' ORDER BY category ASC, subcategory ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit);
    params.push(offset);

    const result = await query(sql, params);

    res.json({
      components: result.rows,
      count: result.rows.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get components error:', error);
    res.status(500).json({ error: 'Failed to fetch components' });
  }
});

// Get component categories
router.get('/categories', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      'SELECT DISTINCT category FROM components ORDER BY category ASC'
    );

    const categories = result.rows.map((row: any) => row.category);

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single component
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT id, category, subcategory, brand, model FROM components WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Component not found' });
      return;
    }

    res.json({ component: result.rows[0] });
  } catch (error) {
    console.error('Get component error:', error);
    res.status(500).json({ error: 'Failed to fetch component' });
  }
});

export default router;
