import express from 'express';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { USER_ROLES } from '../../../enums/user';
import { ChantController } from './chant.controller';

const router = express.Router();

// Create chant (with audio file upload)
router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  fileUploadHandler(),
  ChantController.createChant
);

// Get all chants (public)
router.get(
  '/',
  ChantController.getAllChants
);

// Get single chant (public)
router.get(
  '/:id',
  ChantController.getSingleChant
);

// Update chant (with optional audio file upload)
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  fileUploadHandler(),
  ChantController.updateChant
);

// Delete chant (admin only)
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ,USER_ROLES.USER),
  ChantController.deleteChant
);

// Get chants by category (public)
router.get(
  '/category/:category',
  ChantController.getChantsByCategory
);

// Get chants by country (public)
router.get(
  '/country/:country',
  ChantController.getChantsByCountry
);

export const ChantRoutes = router;
