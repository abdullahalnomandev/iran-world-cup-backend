import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { StandingRoutes } from '../app/modules/standings/standing.route';
import { MatchRoutes } from '../app/modules/match/match.route';
import { SettingsRoutes } from '../app/modules/settings/settings.route';
import { ChantRoutes } from '../app/modules/chant/chant.route';
import { RoomRoutes } from '../app/modules/room/room.route';
import { NotificationRoutes } from '../app/modules/notification/notification.route';

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
  },
  {
    path: '/settings',
    route:SettingsRoutes
  },
  {
    path: '/chant',
    route: ChantRoutes
  },
  {
    path: '/room',
    route: RoomRoutes
  },
  {
    path: '/notification',
    route: NotificationRoutes
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
