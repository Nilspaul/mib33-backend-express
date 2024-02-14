import logger from "../config/logger.js";

export const logQueries = (req, res, next) => {
  if (req.baseQueries && Object.values(req.baseQueries).some(value => value !== undefined && value !== null && value !== '')) {
    logger.info(`Queries: ${JSON.stringify(req.baseQueries)}`);
  }
  
  next();
}

export const extractStandardQueries = (req, res, next) => {
  req.baseQueries = {
    sort: req.query.sort,
    limit: req.query.limit,
    offset: req.query.offset,
  };
  next();
};

export const postProcessQueries = (req, res, next) => {
  req.baseQueries = {
    sort: req.baseQueries.sort || 'desc',
    limit: parseInt(req.baseQueries.limit) || 200,
    offset: parseInt(req.baseQueries.offset) || 0,
  };
  next();
}