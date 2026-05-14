import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IRoom } from './room.interface';
import { Room } from './room.model';
import generateOTP from '../../../util/generateOTP';
import { RoomChant } from './roomChant/roomChant.model';
import { IRoomAnnouncement } from './announcement/announcement.interface';
import { RoomAnnouncement } from './announcement/announcement.model';
import { RoomMember } from './roomMembers/roomMember.model';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enums/user';
import { IUser } from '../user/user.interface';
import admin from '../../../helpers/firebaseConfig';
import { Chant } from '../chant/chant.model';
import { Notification } from '../notification/notification.mode';
import { NotificationCount } from '../notification/notificationCountModel';
import { Match } from '../match/match.model';
import { IMatch } from '../match/match.interface';

// Create room
const createRoomToDB = async (payload: Partial<IRoom>): Promise<IRoom> => {
  const room_id = generateOTP();
  const data = {
    ...payload,
    room_id,
    location: {
      type: 'Point',
      coordinates: [payload.log, payload.lat],
    },
  };
  delete data.lat;
  delete data.log;
  delete data?.roomChants;
  const result = await Room.create(data);

  await RoomMember.create({
    room: result._id,
    user: payload.creator,
  });

  if (payload.roomChants && payload.roomChants.length > 0) {
    RoomChant.insertMany(
      payload.roomChants.map((chant: any) => ({
        room: result._id,
        chant,
      })) || [],
    );
  }

  return result;
};

// Get all rooms with filtering and pagination
const getAllRoomsFromDB = async (
  query: Record<string, any>,
  userId?: string,
) => {
  const { lat, log, km, page = 1, limit = 10, searchTerm, ...rest } = query;

  const skip = (Number(page) - 1) * Number(limit);

  // =========================
  // GEO MODE
  // =========================
  if (lat && log) {
    const radiusInMeters = (Number(km) || 5) * 1000;

    const pipeline: any[] = [
      // 1️⃣ GEO SORT (must be first)
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [Number(log), Number(lat)],
          },
          distanceField: 'distance',
          maxDistance: radiusInMeters,
          spherical: true,
        },
      },

      // 2️⃣ FILTERS
      {
        $match: {
          ...(rest.match_id && { match_id: rest.match_id }),
          ...(rest.country && { country: rest.country }),
        },
      },

      // 3️⃣ SEARCH
      ...(searchTerm
        ? [
            {
              $match: {
                $or: [
                  { name: { $regex: searchTerm, $options: 'i' } },
                  { title: { $regex: searchTerm, $options: 'i' } },
                ],
              },
            },
          ]
        : []),

      // 4️⃣ MEMBERS JOIN
      {
        $lookup: {
          from: 'roommembers',
          localField: '_id',
          foreignField: 'room',
          as: 'members',
        },
      },

      // 5️⃣ CALCULATE memberCount + isMember
      {
        $addFields: {
          memberCount: { $size: '$members' },

          isMember: {
            $cond: [
              {
                $in: [
                  userId ? new mongoose.Types.ObjectId(userId) : null,
                  '$members.user',
                ],
              },
              true,
              false,
            ],
          },
        },
      },

      // 6️⃣ REMOVE TEMP FIELD
      {
        $project: {
          members: 0,
        },
      },

      // 7️⃣ CREATOR JOIN
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creator',
        },
      },
      {
        $unwind: '$creator',
      },

      // 8️⃣ PAGINATION
      { $skip: skip },
      { $limit: Number(limit) },
    ];

    const data = await Room.aggregate(pipeline);

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
      },
    };
  }

  // =========================
  // NORMAL MODE
  // =========================
  const roomQuery = new QueryBuilder(Room.find(), query)
    .search(['name', 'title', 'country'])
    .filter(['lat', 'log', 'searchTerm'])
    .sort()
    .paginate()
    .fields();

  const result = await roomQuery.modelQuery
    .populate({
      path: 'creator',
      select: 'name email image',
    })
    .lean();

  const pagination = await roomQuery.getPaginationInfo();

  // 👉 member stats fallback
  const roomIds = result.map(r => r._id);

  const memberStats = await RoomMember.aggregate([
    {
      $match: {
        room: { $in: roomIds },
      },
    },
    {
      $group: {
        _id: '$room',
        memberCount: { $sum: 1 },
        isUserMember: {
          $sum: {
            $cond: [
              {
                $eq: [
                  '$user',
                  userId ? new mongoose.Types.ObjectId(userId) : null,
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const statsMap = memberStats.reduce(
    (acc, stat) => {
      acc[stat._id.toString()] = {
        memberCount: stat.memberCount,
        isMember: userId ? stat.isUserMember > 0 : false,
      };
      return acc;
    },
    {} as Record<string, { memberCount: number; isMember: boolean }>,
  );

  const data = result.map((room: any) => {
    const stats = statsMap[room._id.toString()] || {
      memberCount: 0,
      isMember: false,
    };

    return {
      ...room,
      memberCount: stats.memberCount,
      isMember: stats.isMember,
    };
  });

  return {
    data,
    pagination,
  };
};
// Get single room by ID
const getSingleRoomFromDB = async (
  id: string,
  userId?: string,
): Promise<
  | (Omit<IRoom, keyof Document> & {
      roomChants: any[];
      isHost: boolean;
      announcements: IRoomAnnouncement[];
      roomMembers: number;
      match: IMatch | null;
    })
  | null
> => {
  const [result, roomChants, announcements, roomMembers] = await Promise.all([
    Room.findById(id, '-location -updatedAt -__v')
      .populate('creator', 'name image')
      .lean()
      .exec(),

    RoomChant.find({ room: id }, '-room -createdAt -updatedAt -__v')
      .populate('chant', '-isActive -createdAt -updatedAt -__v')
      .lean()
      .exec(),

    RoomAnnouncement.find({ room_id: id }, '-room_id -updatedAt -__v')
      .lean()
      .exec(),

    RoomMember.countDocuments({ room: id }),
  ]);

  const match = await Match.findOne(
    { match_id: Number(result?.match_id) }  );

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');
  }

  return {
    ...result,
    isHost: result.creator._id.toString() === userId,
    roomChants: roomChants.filter(rc => rc.chant !== null),
    announcements: announcements,
    roomMembers: roomMembers,
    match: match || null,
  };
};

// Update room by ID
const updateRoomToDB = async (
  id: string,
  payload: Partial<IRoom>,
): Promise<IRoom | null> => {
  const isExist = await Room.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');
  }

  // 🔹 Prepare data like create
  const data: any = { ...payload };

  // handle location
  if (payload.lat !== undefined && payload.log !== undefined) {
    data.location = {
      type: 'Point',
      coordinates: [payload.log, payload.lat],
    };
  }

  // cleanup unwanted fields
  delete data.lat;
  delete data.log;

  // 🔹 Update room
  const result = await Room.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true },
  ).populate('creator', 'name email image');

  // 🔹 Handle roomChants (replace strategy)
  if (payload.roomChants) {
    // remove old chants
    await RoomChant.deleteMany({ room: id });

    // insert new chants
    if (payload.roomChants.length > 0) {
      await RoomChant.insertMany(
        payload.roomChants.map((chant: any) => ({
          room: id,
          chant,
        })),
      );
    }
  }

  return result;
};
// Delete room
const deleteRoomFromDB = async (id: string): Promise<IRoom | null> => {
  const isExist = await Room.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');
  }

  const result = await Room.findByIdAndDelete(id);
  return result;
};

// Get rooms by country
const getRoomsByCountryFromDB = async (
  country: string,
  query: Record<string, any>,
) => {
  const roomQuery = new QueryBuilder(Room.find({ country }), query)
    .search(['name', 'title'])
    .sort()
    .paginate()
    .fields();

  const result = await roomQuery.modelQuery;
  const pagination = await roomQuery.getPaginationInfo();

  return {
    data: result,
    pagination,
  };
};

// Get rooms by match ID
const getRoomsByMatchFromDB = async (
  matchId: string,
  query: Record<string, any>,
) => {
  const roomQuery = new QueryBuilder(Room.find({ match_id: matchId }), query)
    .search(['name', 'title'])
    .sort()
    .paginate()
    .fields();

  const result = await roomQuery.modelQuery;
  const pagination = await roomQuery.getPaginationInfo();

  return {
    data: result,
    pagination,
  };
};

// Get rooms near location (geospatial query)
const getRoomsNearLocationFromDB = async (
  longitude: number,
  latitude: number,
  maxDistance: number = 10000, // 10km default
  query: Record<string, any>,
) => {
  const roomQuery = new QueryBuilder(
    Room.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance,
        },
      },
    }),
    query,
  )
    .search(['name', 'title'])
    .sort()
    .paginate()
    .fields();

  const result = await roomQuery.modelQuery;
  const pagination = await roomQuery.getPaginationInfo();

  return {
    data: result,
    pagination,
  };
};

// Add chant to room
const addChantToRoomFromDB = async (
  roomId: string,
  chantId: string,
  order?: number,
): Promise<IRoom | null> => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');
  }

  // Add chant to room's chant array if not already present
  if (!room.roomChants.includes(chantId as any)) {
    room.roomChants.push(chantId as any);

    if (order !== undefined) {
      // Set order if provided, otherwise use array length
      room.roomChants[room.roomChants.length - 1] = {
        chant: chantId,
        order: order,
      } as any;
    }

    await room.save();
  }

  return room;
};

// Remove chant from room
const removeChantFromRoomFromDB = async (
  roomId: string,
  chantId: string,
): Promise<IRoom | null> => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');
  }

  room.roomChants = room.roomChants.filter(
    (chant: any) => chant.toString() !== chantId,
  );

  await room.save();
  return room;
};

// Create room announcement
const createRoomAnnouncementFromDB = async (
  roomId: string,
  content: string,
): Promise<IRoomAnnouncement | null> => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');
  }

  const io = (global as any).io;

  const announcement = await RoomAnnouncement.create({
    room_id: roomId,
    content,
  });

  // Emit announcement to room
  io.emit(`room::${roomId}`, announcement);

  // SEND PUSH NOTIFICATION TO ROOM MEMBERS EXCEPT CREATOR/HOST
  const creatorId = room.creator.toString();
  const users = await RoomMember.find({
    room: roomId,
    user: { $ne: creatorId },
  })
    .populate('user', 'fcmToken _id role active')
    .lean();

  // Push notifications
  await Promise.allSettled(
    users
      .filter(user => (user.user as IUser)?.fcmToken)
      .map(user =>
        admin.messaging().send({
          token: (user.user as IUser)?.fcmToken!,
          notification: {
            title: 'New Announcement',
            body: content,
          },
          data: {
            roomId,
            content,
          },
        }),
      ),
  );

  // DB operations (with logging)
  await Promise.allSettled(
    users.map(async user => {
      try {
        await Notification.create({
          receiver: user._id,
          title: 'New Announcement',
          message: content,
          refId: roomId,
          sender: null,
          path: '/room',
          seen: false,
        });

        await NotificationCount.findOneAndUpdate(
          { user: user._id },
          { $inc: { count: 1 } },
          { new: true, upsert: true },
        );
      } catch (err) {
        console.error('Notification DB error for user:', user._id, err);
      }
    }),
  );

  return announcement;
};
// Join room
const joinRoomFromDB = async (
  room_code: string,
  userId: string,
): Promise<any> => {
  const room = await Room.findOne({ room_id: room_code });
  if (!room) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found!');
  }

  // Add user to room's members array if not already present
  const isMemberExist = await RoomMember.findOne({
    room: room._id,
    user: userId,
  });

  if (isMemberExist) {
    return isMemberExist;
  }

  const member = await RoomMember.create({
    room: room._id,
    user: userId,
  });

  return member;
};

// Trigger room chant
const triggerRoomChantFromDB = async (
  roomId: string,
  chantId: string,
): Promise<any> => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');
  }

  // Validate chant exists
  const chant = await Chant.findById(chantId);
  if (!chant) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Chant not found');
  }

  // Emit chant to room
  const io = (global as any).io;
  io.emit(`chant::${roomId}`, chant);

  // SEND PUSH NOTIFICATION TO ROOM MEMBERS EXCEPT CREATOR/HOST
  const roomMembers = await RoomMember.find({
    room: roomId,
    user: { $ne: room.creator },
  })
    .populate('user', 'fcmToken _id role active')
    .lean();

  // Send push notifications to room members
  await Promise.allSettled(
    roomMembers
      .filter(member => (member.user as IUser)?.fcmToken)
      .map(member =>
        admin.messaging().send({
          token: (member.user as IUser)?.fcmToken!,
          notification: {
            title: 'New Chant',
            body: chant.title,
          },
          data: {
            roomId,
            chantId,
            chantTitle: chant.title,
          },
        }),
      ),
  );

  // Create notifications for room members
  await Promise.allSettled(
    roomMembers.map(async member => {
      try {
        await Notification.create({
          receiver: member.user._id,
          title: 'New Chant',
          message: chant.title,
          refId: roomId,
          sender: null,
          path: '/room',
          seen: false,
        });

        await NotificationCount.findOneAndUpdate(
          { user: member.user._id },
          { $inc: { count: 1 } },
          { new: true, upsert: true },
        );
      } catch (err) {
        console.error('Notification DB error for user:', member.user._id, err);
      }
    }),
  );

  return chant;
};

// Leave room
const leaveRoomFromDB = async (roomId: string, userId: string): Promise<any> => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');
  }

  const member = await RoomMember.findOneAndDelete({
    room: roomId,
    user: userId,
  });

  return member;
};



export const RoomService = {
  createRoomToDB,
  getAllRoomsFromDB,
  getSingleRoomFromDB,
  updateRoomToDB,
  deleteRoomFromDB,
  getRoomsByCountryFromDB,
  getRoomsByMatchFromDB,
  getRoomsNearLocationFromDB,
  addChantToRoomFromDB,
  removeChantFromRoomFromDB,
  createRoomAnnouncementFromDB,
  joinRoomFromDB,
  triggerRoomChantFromDB,
  leaveRoomFromDB,
};
