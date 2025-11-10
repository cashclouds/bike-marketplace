import express, { Router, Request, Response } from 'express';
import { query } from '../config/database';

const router: Router = express.Router();

// Get all models
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { brand_id, type, limit = 100, offset = 0 } = req.query;

    let sql = 'SELECT id, brand_id, name, type, frame_materials, years_available FROM models WHERE 1=1';
    const params: any[] = [];

    if (brand_id) {
      sql += ` AND brand_id = $${params.length + 1}`;
      params.push(brand_id);
    }

    if (type) {
      sql += ` AND type = $${params.length + 1}`;
      params.push(type);
    }

    sql += ' ORDER BY name ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit);
    params.push(offset);

    const result = await query(sql, params);

    res.json({
      models: result.rows,
      count: result.rows.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// Get single model
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT id, brand_id, name, type, frame_materials, years_available FROM models WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Model not found' });
      return;
    }

    res.json({ model: result.rows[0] });
  } catch (error) {
    console.error('Get model error:', error);
    res.status(500).json({ error: 'Failed to fetch model' });
  }
});

export default router;
