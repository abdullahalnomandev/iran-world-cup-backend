import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { IUser } from './user.interface';
import { User } from './user.model';

// DELETE (soft delete)
const willBeDeleteUser = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const isPasswordMatch = await User.isMatchPassword(password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Incorrect password');
  }

  user.status = 'delete';
  await user.save();

  return user;
};

// CREATE USER (simple)
const createUserToDB = async (
  payload: Partial<IUser>
): Promise<{ accessToken: string } | IUser> => {
  if (!payload.email) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email is required');
  }

  const isExist = await User.findOne({ email: payload.email });

  // যদি user already থাকে → login token দাও
  if (isExist) {
    const token = jwtHelper.createToken(
      { id: isExist._id, role: isExist.role, email: isExist.email },
      config.jwt.jwt_secret as Secret,
      config.jwt.jwt_expire_in as string
    );

    return { accessToken: token };
  }

  // create new user
  const user = await User.create(payload);

  const token = jwtHelper.createToken(
    { id: user._id, role: user.role, email: user.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  return { accessToken: token };
};

// GET PROFILE
const getUserProfileFromDB = async (user: JwtPayload) => {
  const foundUser = await User.findById(user.id).lean();

  if (!foundUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return foundUser;
};

// UPDATE PROFILE
const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
) => {
  const updatedUser = await User.findByIdAndUpdate(
    user.id,
    { $set: payload },
    { new: true }
  ).lean();

  if (!updatedUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return updatedUser;
};

// GET ALL USERS (simple)
const getAllUsers = async () => {
  const users = await User.find().lean();
  return users;
};

// UNFOLLOW
const unfollowUser = async (userId: string, targetId: string) => {
  if (userId === targetId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid action');
  }

  await User.findByIdAndUpdate(userId, {
    $pull: { 'profile.following': targetId },
  });

  await User.findByIdAndUpdate(targetId, {
    $pull: { 'profile.followers': userId },
  });

  return true;
};

// DELETE ACCOUNT (hard delete)
const deleteAccount = async (password: string, userId: string) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const isMatch = await User.isMatchPassword(password, user.password);
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Incorrect password');
  }

  await User.findByIdAndDelete(userId);

  return true;
};

export const UserService = {
  willBeDeleteUser,
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  getAllUsers,
  unfollowUser,
  deleteAccount,
};