import express from 'express';
import logger from '../../config/logger.js';
import dbHandler from '../../services/db.js';
import { ulid } from 'ulidx';
import moment from 'moment';
import { extractStandardQueries, logQueries, postProcessQueries } from '../../middlewares/queries.js';

import { authAdmin } from './../../middlewares/auth.js';

const db = dbHandler();
const table = 'categories';

const router = express.Router();

// Middleware
router.use(extractStandardQueries);
router.use(logQueries);
router.use(postProcessQueries);

router.get('/', async (req, res) => {
  const { sort, limit, offset } = req.baseQueries;
  const { find = '', include = false } = req.query;

  try {
    // Base-Query
    let query = db.select('id','name','description','slug','image_url').from(table).orderBy('order', sort).limit(limit).offset(offset);
    let countQuery = db(table).count('* as total');

    // Search
    if (find.trim() !== '') {
      query = query.where('name', 'like', `%${find}%`).orWhere('description', 'like', `%${find}%`);
      countQuery = countQuery.where('name', 'like', `%${find}%`).orWhere('description', 'like', `%${find}%`);
    }

    if (include) {
      let ary_include = include.split(',');
      query = query.select(ary_include);
    }

    const categories = await query;
    const [{ total }] = await countQuery;

    let json = {
      data: categories,
      meta: {
        total: total,
        limit: limit,
        offset: offset
      }
    }
    res.json(json);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

router.post('/', async (req, res) => {
  const { name, description } = req.body;

  try {
    const id = ulid();
    await db(table).insert({
      id,
      name,
      description
    });

    const newCategory = await db(table).where('id', id).first();
    logger.info(newCategory);

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

router.patch('/:id', authAdmin, async (req, res) => {
  const { id } = req.params;

  let body = req.body;
  delete body.id;  // Can not patch ID!

  body.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');

  try {
    await db(table).where('id', id).update(body);

    const patchedCategorie = await db(table).where('id', id).first();
    logger.info(patchedCategorie);

    res.status(201).json(patchedCategorie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

// Router für Single-Kategorien
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const category = await db.select('id','name','description','slug','image_url').from(table).where('id', id).first();
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;
