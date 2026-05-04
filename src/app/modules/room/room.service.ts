import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IRoom } from './room.interface';
import { Room } from './room.model';
import generateOTP from '../../../util/generateOTP';
import { RoomChant } from './roomChant/roomChant.model';

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
  console.log(data);
  const result = await Room.create(data);

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
const getAllRoomsFromDB = async (query: Record<string, any>) => {
  const roomQuery = new QueryBuilder(Room.find(), query)
    .search(['name', 'title', 'country'])
    .filter(['country', 'match_id'])
    .sort()
    .paginate()
    .fields();

  const result = await roomQuery.modelQuery.populate({
    path: 'creator',
    select: 'name email image',
  });
  const pagination = await roomQuery.getPaginationInfo();

  return {
    data: result,
    pagination,
  };
};

// Get single room by ID
const getSingleRoomFromDB = async (
  id: string,
  userId?: string,
): Promise<(Omit<IRoom, keyof Document> & { roomChants: any[]; isHost: boolean }) | null> => {
  const [result, roomChants] = await Promise.all([
    Room.findById(id, '-location -updatedAt -__v')
      .populate('creator', 'name image')
      .lean()
      .exec(),

    RoomChant.find({ room: id }, '-room -createdAt -updatedAt -__v')
      .populate('chant', '-isActive -createdAt -updatedAt -__v')
      .lean()
      .exec(),
  ]);

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');
  }

  return {
    ...result,
    isHost: result.creator._id.toString() === userId,
    roomChants: roomChants.filter(rc => rc.chant !== null),
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
};
