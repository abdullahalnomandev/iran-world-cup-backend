import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { RoomController } from './room.controller';

const router = express.Router();

// Create room (admin only)
router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  RoomController.createRoom
);

// Get all rooms (public)
router.get(
  '/',
  RoomController.getAllRooms
);

// Get single room (public)
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  RoomController.getSingleRoom
);

// Update room (admin only)
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  RoomController.updateRoom
);

// Delete room (admin only)
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  RoomController.deleteRoom
);

// Get rooms by country (public)
router.get(
  '/country/:country',
  RoomController.getRoomsByCountry
);

// Get rooms by match ID (public)
router.get(
  '/match/:matchId',
  RoomController.getRoomsByMatch
);

// Get rooms near location (public)
router.get(
  '/near',
  RoomController.getRoomsNearLocation
);

// Add chant to room (authenticated users)
router.post(
  '/:roomId/chants',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  RoomController.addChantToRoom
);

// Remove chant from room (authenticated users)
router.delete(
  '/:roomId/chants/:chantId',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  RoomController.removeChantFromRoom
);

export const RoomRoutes = router;
