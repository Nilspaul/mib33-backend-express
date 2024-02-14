import express from 'express';
import logger from '../../config/logger.js';
import config from '../../config/config.js';
import dbHandler from '../../services/db.js';
import { ulid } from 'ulidx';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { extractStandardQueries, logQueries, postProcessQueries } from '../../middlewares/queries.js';

const db = dbHandler();
const table = 'users';

const router = express.Router();

// Middleware
router.use(logQueries);

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    
    let query = db.select().from(table).where('email', email).first();
    const user = await query;

    if(user && user.password_hash) {
      const result = await bcrypt.compare(password, user.password_hash);
      if(result === true) {
        const token = jwt.sign({ userId: user.id }, config.jwt.secret, { expiresIn: parseInt(config.jwt.accessExpirationMinutes) * 60 * 1000 });

        res.cookie(config.jwt.cookiename, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: parseInt(config.jwt.accessExpirationMinutes) * 60 * 1000
        });
        res.status(200).json({
          token: token,
          userId: user.id,
          roleId: user.role,
          name: user.name,
          email: user.email,
        });

      } else {
        throw new Error(`wrong email or password`);
      }

    } else {
      throw new Error(`wrong email or password`);
    }

  } catch (error) {
    res.status(401).json({ error: error.message });
  }

});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await db.select('*').from(table).where('email', email).first();
    if(existingUser) {
      throw new Error(`user already exists`);
    }

    const salt = await bcrypt.genSalt(parseInt(config.saltrounds));
    const password_hash = await bcrypt.hash(password, salt);

    const id = ulid();
    await db(table).insert({
      id,
      name,
      email,
      password_hash
    });

    const newUser = await db.select('name','email').from(table).where('id', id).first();
    logger.info(newUser);

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

router.get('/logout', (req, res) => {
  if(req.userId) {
    res.cookie(config.jwt.cookiename, '');
    return res.json({message: "user successfully logged out"});
  }

  res.json({message: "no active session"});
});

// Router für Single-Kategorien
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const category = await db.select('id','name','description').from(table).where('id', id).first();
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
