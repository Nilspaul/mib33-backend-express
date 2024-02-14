import config from './config/config.js';
import app from './app.js';
import logger from './config/logger.js';
import moment from 'moment';
import dbHandler from './services/db.js';
import { createDatabaseSchemas, updateDatabaseSchemas, dropDatabaseTable } from './services/schema.js';
import { importSheets } from './services/import.js';

const db = dbHandler();

logger.info(`Migration-Script`);
if (process.argv.includes('--init')) {
  logger.info(`Build Database-Schemas`);
  try {
    let create = await createDatabaseSchemas(db);
  } catch (error) {
    logger.error(error);
    process.exit(1)
  }

  logger.info(`Migration done`);
  process.exit()
}


if (process.argv.includes('--update')) {
  logger.info(`Update Database-Schemas`);
  logger.info(`Start: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);

  try {
    let update = await updateDatabaseSchemas(db);
  } catch (error) {
    logger.error(error);
    process.exit(1)
  }

  logger.info(`Update done`);
  logger.info(`End: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
  process.exit()
}

if (process.argv.includes('--import')) {
  logger.info(`Import Data`);
  logger.info(`Start: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);

  try {
    let _import = await importSheets(db);
  } catch (error) {
    logger.error(error);
    process.exit(1)
  }

  logger.info(`Import done`);
  logger.info(`End: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
  process.exit()
}

if (process.argv.includes('--drop')) {
  logger.info(`Drop Database-Table`);

  try {
    const args = process.argv;
    const dropIndex = args.indexOf('--drop');

    if (dropIndex !== -1 && args.length > dropIndex + 1) {
      // Erster Wert nach --drop
      const table = args[dropIndex + 1]; 
      logger.info('Tabelle zum Löschen: ' + table);

      let drop = await dropDatabaseTable(db, table);
    } else {
      throw new Error('Table name is missing');
    }
  } catch (error) {
    logger.error(error);
    process.exit(1)
  }

  logger.info(`Drop done`);
  process.exit()
}