import config from './config/config.js';
import app from './app.js';
import logger from './config/logger.js';
import dbHandler from './services/db.js';
import { createDatabaseSchemas } from './services/schema.js';

const db = dbHandler();

let server;
if(db) {
  let server = app.listen(config.port, () => {
    logger.info(`Listening under http://127.0.0.1:${config.port}`);
  });
} else {
  logger.error('Cant connect to database', db);
}


