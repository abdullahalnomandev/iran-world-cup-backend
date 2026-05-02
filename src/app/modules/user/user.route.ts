import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
const router = express.Router();

router
  .route('/profile')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.USER,USER_ROLES.SUPER_ADMIN), UserController.getUserProfile)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    fileUploadHandler(),
    validateRequest(UserValidation.updateUserZodSchema),
    UserController.updateProfile
  );


router
  .route('/')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.USER,USER_ROLES.SUPER_ADMIN), UserController.getAllUsers)
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  )
export const UserRoutes = router;
