import express from 'express';
import { MatchController } from './match.controller';

const router = express.Router();

router
  .route('/')
  .get(
    // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    MatchController.getAllMatches
  );

export const MatchRoutes = router;
