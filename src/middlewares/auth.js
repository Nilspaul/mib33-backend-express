import config from './../config/config.js';
import jwt from 'jsonwebtoken';

import dbHandler from '../services/db.js';

const db = dbHandler();

export const jwtMiddleware = async (req, res, next) => {
  try {
    let token;
    let decoded;

    if (req.universalCookies.get(config.jwt.cookiename)) {
      token = req.universalCookies.get(config.jwt.cookiename);
    } else if (req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      decoded = jwt.verify(token, config.jwt.secret);
    }

    if(decoded) {
      let query = db.select('*').from('users').where('id', decoded.userId).first();
      const user = await query;
      if(user.id && user.role) {
        req.userId = user.id;
        req.userRole = parseInt(user.role);
      }

    } else {
      req.userRole = 0;
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'failed authentication', error: {name: error.name, message: error.message} });
  }
};


export const authAdmin = async (req, res, next) => {
  try {
    if(req.userRole != 2) {
      throw Error('wrong user permissions');
    }
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};