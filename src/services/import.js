import fetch from 'node-fetch';
import csvtojson from "csvtojson";
import { ulid } from 'ulidx';

import config from '../config/config.js';

import logger from '../config/logger.js';
import dbHandler from './db.js';

const db = dbHandler()

const prepareJSON = (data) => {
  return data.map(item => {

    // Typisierung von Feldern
    if (item.price) item.price = parseFloat(item.price);
    if (item.stock) item.stock = parseFloat(item.stock);
    if (item.rating) item.rating = parseFloat(item.rating);
    if (item.weight) item.weight = parseFloat(item.weight);

    let specs = {};
    const defaultKeys = ['name', 'description', 'manufacturer', 'price', 'stock', 'image_url', 'rating'];
    Object.keys(item).forEach(key => {

      if (item[key] === '') {
        delete item[key];
      } else {

        let value = item[key];
        // Semi-Kolons separatiertes und als Array speichern
        if (typeof value === 'string' && value.includes(';')) {
          item[key] = value.split(';');
        }
      }

      // Alles andere als die Default-Key-Values in Unterobjekt 'specifications' verschieben
      if (!defaultKeys.includes(key)) {
        specs[key] = item[key];
        delete item[key];
      }
    });

    item.specifications = specs;
    return item;
  });
};


export const importSheets = async (db) => {
  const google_sheets_id = config.googlesheet;

  const matchCategoriesBySheet = {
    'table_case': '01HN1959PQN4H7RE77SAEMA60G',
    'table_cpu': '01HN195J9DDAW48WV30BZ39DPW',
    'table_ram': '01HN197E60M28APYAVF5887TJD',
    'table_gpu': '01HN196B2MRVTHYY3P1J3S0Q4K',
    'table_storage': '01HN198R9ZVREB9F675QQYGWBM',
    'table_cpufan': '01HN197MD0744C9AJRG8EDYA8F',
    'table_powersupply': '01HN1981668M1TZV3F25DV754A',
    'table_mainboard': '01HN195E6VV88G7DQFXMWG0R15',
  };

  if (db) {
    for (const [sheet_name, category_id] of Object.entries(matchCategoriesBySheet)) {
      try {
        console.log("try:", sheet_name, category_id);
        const url = `https://docs.google.com/spreadsheets/d/${google_sheets_id}/gviz/tq?tqx=out:csv&sheet=${sheet_name}`;
        const data = await importSheet(db, url, category_id);
      } catch (error) {
        logger.error(error);
        return false;
      }
    }
  }

  return false;
}

export const importSheet = async (db, url, category_id) => {
  if(db && url && category_id) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const csvData = await response.text();
  
    
      // CSV in JSON umwandeln
      const jsonData = await csvtojson().fromString(csvData);
  
      // Daten vorbereiten
      let preparedJson = prepareJSON(jsonData);
    
      // Elemente in DB schreiben
      for (const item of preparedJson) {
        try {
          const id = ulid();
          item.category_id = category_id;
          await db('products').insert({
            id,
            ...item
          });
    
          const newProduct = await db('products').where('id', id).first();
        } catch (error) {
          logger.error(error);
          return false
        }
      }
      return preparedJson;
    } catch (error) {
      logger.error(error);
      return false
    }
  }

  return false;
}