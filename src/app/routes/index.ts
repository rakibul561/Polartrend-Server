import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { TrendRoutes } from '../modules/trend/trend.route';




const router = express.Router();

const moduleRoutes = [
    {
        path: '/user',
        route: UserRoutes
    },
    {
        path: '/auth',
        route: AuthRoutes
    },
    {
        path: '/trends',
        route: TrendRoutes
    },
   
   
  
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;