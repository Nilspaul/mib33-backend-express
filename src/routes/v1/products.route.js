import express from 'express';
import logger from '../../config/logger.js';
import dbHandler from '../../services/db.js';
import moment from 'moment';
import { extractStandardQueries, logQueries, postProcessQueries } from '../../middlewares/queries.js';
import { ulid } from 'ulidx';

import { authAdmin } from './../../middlewares/auth.js';

const db = dbHandler();
const router = express.Router();

const table = 'products';

// Middleware
router.use(extractStandardQueries);
router.use(logQueries);
router.use(postProcessQueries);

router.get('/', async (req, res) => {
  const { sort, limit, offset } = req.baseQueries;
  const { find = '', category = false, categoryid = false, ids = false, price = false, stock = false } = req.query;

  try {
    // Base-Query
    let query = db.select(`${table}.id`, `${table}.name`, `${table}.description`, `${table}.manufacturer`, `${table}.category_id`, `${table}.price`, `${table}.stock`, `${table}.image_url`, `${table}.rating`, `${table}.specifications`, `categories.name as category_name`)
      .from(table)
      .join('categories', `${table}.category_id`, '=', 'categories.id')
      .orderBy(`${table}.created_at`, sort)
      .limit(limit)
      .offset(offset);
    let countQuery = db(table).count('* as total');

    // Filter
    // TODO: Query für price[min]|price[max]|stock[min]|stock[min]
    if (ids) {
      let ary_ids = ids.split(',');
      query = query.whereIn(`${table}.id`, ary_ids);
      countQuery = countQuery.whereIn(`${table}.id`, ary_ids);
    }
    if (categoryid) {
      query = query.where('category_id', categoryid);
      countQuery = countQuery.where('category_id', categoryid);
    }
    if (category) {
      query = query.join('categories', 'categories.id', '=', `${table}.category_id`).where('categories.name', category);
      countQuery = countQuery.join('categories', 'categories.id', '=', `${table}.category_id`).where('categories.name', category);
    }
    // Search
    if (find.trim() !== '') {
      query = query.where(`${table}.name`, 'like', `%${find}%`).orWhere(`${table}.description`, 'like', `%${find}%`);
      countQuery = countQuery.where(`${table}.name`, 'like', `%${find}%`).orWhere(`${table}.description`, 'like', `%${find}%`);
    }

    const products = await query;
    const [{ total }] = await countQuery;

    let json = {
      data: products,
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

// Create Product
router.post('/', authAdmin, async (req, res) => {
  const { name, description, manufacturer, stock, price, category_id } = req.body;

  try {
    const id = ulid();
    await db(table).insert({
      id,
      ...req.body
    });

    const newProduct = await db(table).where('id', id).first();
    logger.info(newProduct);

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

// Patch Product
router.patch('/:id', authAdmin, async (req, res) => {
  const { id } = req.params;

  let body = req.body;
  delete body.id;  // Can not patch ID!

  body.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');

  try {
    await db(table).where('id', id).update(body);

    const patchedProduct = await db(table).where('id', id).first();
    logger.info(patchedProduct);

    res.status(201).json(patchedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

// Single-Product
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const product = await db.select('id','name','description','manufacturer','category_id','price','stock','image_url').from(table).where('id', id).first();
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
