import config from './config/config.js';
import express from 'express';
import helmet from 'helmet';
// import compression from 'compression';
import cors from 'cors';
// import httpStatus from 'http-status';
import morgan from './config/morgan.js';
import routes from './routes/v1/index.js';
import cookiesMiddleware from 'universal-cookie-express';
import { jwtMiddleware } from './middlewares/auth.js';

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// gzip compression
// app.use(compression());

// enable cors
app.use(cors({
  origin: config.frontend_domains,
  credentials: true,
}));
app.options('*', cors());

app.use(cookiesMiddleware());
app.use(jwtMiddleware);

// v1 api routes
app.use('/v1', routes);

export default app;
