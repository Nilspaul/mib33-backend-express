import config from '../../config/config.js';
import express from 'express';

import authRoute from './auth.route.js';
import categoriesRoute from './categories.route.js';
import productsRoute from './products.route.js';

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/categories',
    route: categoriesRoute,
  },
  {
    path: '/products',
    route: productsRoute,
  },
  // {
  //   path: '/users',
  //   route: userRoute,
  // },
];

// const devRoutes = [
//   {
//     path: '/test',
//     route: testRoute,
//   },
// ];

const router = express.Router();

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

// if (config.env === 'development') {
//   devRoutes.forEach((route) => {
//     router.use(route.path, route.route);
//   });
// }

export default router;