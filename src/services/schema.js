import logger from '../config/logger.js';
import db from './db.js';

const schema_products = async (db, tablename) => {
  return await db.schema.createTable(tablename, function(table) {
    table.string('id').primary().notNullable(); // ULID als Primärschlüssel
    table.string('category_id').references('id').inTable('categories'); // Fremdschlüssel zur 'catalog'-Tabelle
    table.integer('status').defaultTo(1); // Status zum deaktivieren etc.
    table.string('name'); // Produktname
    table.string('description'); // Produktbeschreibung
    table.string('manufacturer'); // Hersteller
    table.float('price').unsigned(); // Preis in Cent (oder kleinstmöglicher Währungseinheit)
    table.integer('stock').unsigned(); // Lagerbestand
    table.string('sku'); // Evtl. für EAN oder sonstiges
    table.string('image_url'); // URL des Produktbildes
    table.float('rating'); // Bewertung von 1-5
    table.string('specifications', 4096); // Technische Spezifikationen als Text oder JSON
    table.timestamps(true, true); // Erstellungs- und Aktualisierungszeitstempel
  });
}

const schema_categories = async (db, tablename) => {
  return await db.schema.createTable(tablename, function(table) {
    table.string('id').primary().notNullable(); // ULID als Primärschlüssel
    table.integer('status').defaultTo(1); // Status zum deaktivieren und so
    table.string('name'); // Name der Kategorie, z.B. "CPU", "Grafikkarte"
    table.string('slug'); // Kurze/Eindeutige Bezeichnung (z.B. cpu, gpu)
    table.string('description'); // Beschreibung der Kategorie
    table.string('image_url'); // Link zum Image
    table.integer('order');
    table.timestamps(true, true); // Erstellungs- und Aktualisierungszeitstempel
  });
}

const schema_users = async (db, tablename) => {
  return await db.schema.createTable(tablename, function(table) {
    table.string('id').primary().notNullable(); // ULID als Primärschlüssel
    table.integer('status').defaultTo(1); // Status zum deaktivieren
    table.string('name'); // Name des Users
    table.string('email'); // E-Mail des Users
    table.string('password_hash'); // Password des Users (bcrypt evtl.)
    table.integer('role').defaultTo(1); // Rolle des Nutzers
    table.timestamp('last_login'); // Letzter Login
    table.timestamps(true, true); // Erstellungs- und Aktualisierungszeitstempel
  });
}

const schema_baskets = async (db, tablename) => {
  return await db.schema.createTable(tablename, function(table) {
    table.string('id').primary().notNullable(); // ULID als Primärschlüssel
    table.string('user_id').references('id').inTable('users'); // Fremdschlüssel zur 'users'-Tabelle
    table.integer('status').defaultTo(1); // Status des Warenkorbs (z.B. active, completed, cancelled)
    table.timestamps(true, true); // Erstellungs- und Aktualisierungszeitstempel
  });
}

const schema_basket_products = async (db, tablename) => {
  return await db.schema.createTable(tablename, function(table) {
    table.string('basket_id').references('id').inTable('baskets');
    table.string('product_id').references('id').inTable('products');
    table.integer('quantity').unsigned().defaultTo(1); // Anzahl der Produkte
    table.primary(['basket_id', 'product_id']); // Kombinierter Primärschlüssel
  });
}


const registerSchemaList = [
  {
    "name": 'products', 
    "schema": schema_products
  },
  {
    "name": 'categories', 
    "schema": schema_categories
  },
  {
    "name": 'users', 
    "schema": schema_users
  },
  {
    "name": 'baskets', 
    "schema": schema_baskets
  },
  {
    "name": 'basket_products', 
    "schema": schema_basket_products
  },
];

/**
 * Creates Database Table if not already exists
 *
 * @param {*} db
 * @param {string} table_name
 * @param {*} table_schema
 * @return {*} 
 */
const createTableIfNotExists = async (db, table_name, table_schema) => {
  if (db) {
    const exists = await db.schema.hasTable(table_name);
    if (!exists) {
      return table_schema(db, table_name);
    }
  }
  return false;
};

/**
 * Creates Database Tables by schemas
 *
 * @param {*} db
 */
export const createDatabaseSchemas = async (db) => {
  try {
    const schemaPromises = registerSchemaList.map(table =>
      createTableIfNotExists(db, table.name, table.schema)
    );

    const results = await Promise.all(schemaPromises);
    results.forEach((result, i) => {
      const table = registerSchemaList[i];
      if (result) {
        logger.info(`'${table.name}' created`);
      } else {
        logger.warn(`couldnt create table '${table.name}' - maybe already exists`);
      }
    });
  } catch (error) {
    logger.error(error);
  }
};

/**
 * Updates Database Tables by schema
 *
 * @param {*} db
 * @return {boolean} 
 */
export const updateDatabaseSchemas = async (db) => {
  if(db) {
    try {

      // Add/Remove
      await db.schema.table('products', function (table) {
        logger.info(`Add/Remove columns of table ${table}`);
        //table.integer('name');
      });

      // Change types
      await db.schema.alterTable('users', function(table) {
        logger.info(`Update column types of table ${table}`);
        // table.string('name').alter();
      });

      return true;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }

  return false;
}

/**
 * Drops Database Tables by name
 *
 * @param {*} db
 * @param {string} table - name of table
 * @return {boolean} 
 */
export const dropDatabaseTable = async (db, table) => {
  if(db) {
    try {
      await db.schema.dropTableIfExists(table);
      return true;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }

  return false;
}