import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
const router = express.Router();

router.post(
  '/login',
  AuthController.loginUser
);

router.post(
  '/resend-otp',
  validateRequest(AuthValidation.createResendEmailZodSchema),
  AuthController.resendEmail
);

router.post(
  '/forget-password',
  validateRequest(AuthValidation.createForgetPasswordZodSchema),
  AuthController.forgetPassword
);

router.post(
  '/verify-email',
  validateRequest(AuthValidation.createVerifyEmailZodSchema),
  AuthController.verifyEmail
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.createResetPasswordZodSchema),
  AuthController.resetPassword
);

router.post(
  '/verify-otp',
  AuthController.verifyOTPToDb
);

router.post(
  '/change-password',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  AuthController.changePassword
);

router.delete(
  '/delete-account',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  AuthController.deleteAccount
);
export const AuthRoutes = router;
