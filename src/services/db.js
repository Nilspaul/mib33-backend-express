// 'build4bytes-server/src/data/db.sqlite'
import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import config from './../config/config.js';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, config.database);

/**
 * Database Handler
 * 
 * @use knex
 *
 * @return {*} 
 */
const dbHandler = () => {
  try {
    if (fs.existsSync(dbPath)) {
      return knex({
        client: 'better-sqlite3', // alternativ mit 'sqlite3'
        connection: {
          filename: dbPath
        },
        useNullAsDefault: true
      });
    } else {
      throw new Error('Database path not found');
    }
  } catch (error) {
    logger.error(error);
  }
  
  return false;
}

export default dbHandler
