import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import QueryBuilder from '../../builder/QueryBuilder';
import {
  USER_AUTH_PROVIDER,
  userSearchableField,
} from './user.constant';
import { IUser } from './user.interface';
import { User } from './user.model';
import { getUserInfoWithToken } from './user.util';
import generateOTP from '../../../util/generateOTP';

const updateUserAccessFeature = async (userId: string) => {
  // This function can be used for future access control features
  // For now, just ensure the user is active
  await User.findByIdAndUpdate(userId, { status: 'active' });
};


const createUserToDB = async (
  payload: Partial<IUser>
): Promise<IUser | { accessToken: string }> => {
  if (!payload.password && !payload.google_id_token) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Password or Google ID token is required'
    );
  }

  let isValid = false;
  let authorization: { oneTimeCode: string; expireAt: Date } | null = null;

  //GOOGLE
  if (
    payload.auth_provider === USER_AUTH_PROVIDER.GOOGLE &&
    payload.google_id_token
  ) {
    const tokenData = await getUserInfoWithToken(payload?.google_id_token);
    payload.email = tokenData?.data?.email;
    payload.name = tokenData?.data?.name;
    isValid = true;
    if (tokenData) payload.verified = true;

    const isExist = await User.exists({ email: tokenData?.data?.email }).lean();
    await updateUserAccessFeature(isExist?._id as any);

    if (isExist) {
      const createToken = jwtHelper.createToken(
        { id: isExist._id, role: isExist.role, email: isExist.email },
        config.jwt.jwt_secret as Secret,
        config.jwt.jwt_expire_in as string
      );
      return { accessToken: createToken };
    }
  }
  //LOCAL
  else {
    if (payload.auth_provider === 'local' && payload.password) {
      isValid = true;

      const otp = generateOTP();
      authorization = {
        oneTimeCode: otp.toString(),
        expireAt: new Date(Date.now() + 3 * 60000),
      };
    }
  }
  const createUser = await User.create(payload);

  if (!createUser || !isValid)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');

  if (isValid && createUser && payload.auth_provider === 'local') {
    if (!authorization?.oneTimeCode || !createUser?.email) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to generate OTP or missing email'
      );
    }
    const createAccountTemplate = emailTemplate.createAccount({
      otp: authorization.oneTimeCode,
      email: createUser.email,
    });
    emailHelper.sendEmail(createAccountTemplate);
    await User.findByIdAndUpdate(createUser._id, { $set: { authorization } });
    return createUser;
  } else {
    // Fix: 'isExist' is not defined in this scope. Use createUser instead.
    await updateUserAccessFeature(createUser._id as any);
    //create token
    const createToken = jwtHelper.createToken(
      { id: createUser._id, role: createUser.role, email: createUser.email },
      config.jwt.jwt_secret as Secret,
      config.jwt.jwt_expire_in as string
    );
    return { accessToken: createToken };
  }
};

const getUserProfileFromDB = async (user: JwtPayload): Promise<any> => {

  console.log("id", user.id);
  // Only unselect the arrays but still need to count their lengths, so will fetch their counts
  const isExistUser = await User.findById(user.id).lean();

  console.log("isExistUser", isExistUser);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Return user data
  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null> | undefined> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (payload.email) {
    delete payload.email;
  }

  if (payload.image === isExistUser.image) {
    unlinkFile(payload.image as string);
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true }
  ).lean();

  if (updatedUser) {
    delete (updatedUser as any).authorization;
    delete (updatedUser as any).status;
  }

  return updatedUser;
};

const getAllUsers = async (query: Record<string, any>) => {
  const club_id = query.club_id;

  // Build base query
  let baseQuery = User.find();

  const userQuery = new QueryBuilder(baseQuery, query)
    .paginate()
    .search(userSearchableField)
    .fields()
    .filter(['club_id'])
    .sort();

  const result = await userQuery.modelQuery.lean();
  const pagination = await userQuery.getPaginationInfo();

  return {
    pagination,
    data: result,
  };
};
// .populate({
//   path: "airlineVerification",
//   match: { paymentStatus: "paid" },
//   select: "designation plan employeeId images paymentStatus paymentMethod",
//   populate: {
//     path: "plan",
//     select: "-active",
//   },

export const unfollowUser = async (userId: string, targetId: string) => {
  if (userId === targetId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot unfollow yourself');
  }

  // For now, this is a placeholder function
  // In a full implementation, you would need to add following/followers fields to the user model
  // or create a separate relationships model
  
  // Just verify both users exist
  const [user, target] = await Promise.all([
    User.findById(userId),
    User.findById(targetId)
  ]);

  if (!user || !target) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return { message: 'Unfollow functionality not yet implemented' };
};


const getUserProfileByIdFromDB = async (
  userId: string,
  requestUserId: string
): Promise<any> => {
  // Only unselect the arrays but still need to count their lengths, so will fetch their counts
  const isExistUser = await User.findById(
    requestUserId,
    '-status -role -authorization'
  )
    .lean();

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Return user data
  return isExistUser;
};



// DASHBOARD ANALYTICS

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  getAllUsers,
  getUserProfileByIdFromDB,
};