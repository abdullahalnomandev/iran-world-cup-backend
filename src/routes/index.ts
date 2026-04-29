import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { StandingRoutes } from '../app/modules/standings/standing.route';
import { MatchRoutes } from '../app/modules/match/match.route';

const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/standing',
    route: StandingRoutes,
  },
  {
    path: '/match',
    route: MatchRoutes,
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
