import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { StandingController } from './standing.controller';

const router = express.Router();

router
  .route('/')
  .get(
    // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    StandingController.getAllStandings
  );

router
  .route('/:id')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    StandingController.getSingleStanding
  )
export const StandingRoutes = router;
