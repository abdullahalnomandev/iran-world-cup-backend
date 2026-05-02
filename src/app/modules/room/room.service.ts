import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IRoom } from './room.interface';
import { Room } from './room.model';

// Create room
const createRoomToDB = async (payload: Partial<IRoom>): Promise<IRoom> => {
  const result = await Room.create(payload);
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

  const result = await roomQuery.modelQuery;
  const pagination = await roomQuery.getPaginationInfo();

  return {
    data: result,
    pagination,
  };
};

// Get single room by ID
const getSingleRoomFromDB = async (id: string): Promise<IRoom | null> => {
  const result = await Room.findById(id).populate('creator', 'name email image');
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');
  }
  return result;
};

// Update room by ID
const updateRoomToDB = async (
  id: string,
  payload: Partial<IRoom>
): Promise<IRoom | null> => {
  const isExist = await Room.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');
  }

  const result = await Room.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true }
  ).populate('creator', 'name email image');
  
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
const getRoomsByCountryFromDB = async (country: string, query: Record<string, any>) => {
  const roomQuery = new QueryBuilder(
    Room.find({ country }),
    query
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

// Get rooms by match ID
const getRoomsByMatchFromDB = async (matchId: string, query: Record<string, any>) => {
  const roomQuery = new QueryBuilder(
    Room.find({ match_id: matchId }),
    query
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

// Get rooms near location (geospatial query)
const getRoomsNearLocationFromDB = async (
  longitude: number,
  latitude: number,
  maxDistance: number = 10000, // 10km default
  query: Record<string, any>
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
    query
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
  order?: number
): Promise<IRoom | null> => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');
  }

  // Add chant to room's chant array if not already present
  if (!room.roomChant.includes(chantId as any)) {
    room.roomChant.push(chantId as any);
    
    if (order !== undefined) {
      // Set order if provided, otherwise use array length
      room.roomChant[room.roomChant.length - 1] = { 
        chant: chantId, 
        order: order 
      } as any;
    }
    
    await room.save();
  }

  return room;
};

// Remove chant from room
const removeChantFromRoomFromDB = async (
  roomId: string,
  chantId: string
): Promise<IRoom | null> => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');
  }

  room.roomChant = room.roomChant.filter(
    (chant: any) => chant.toString() !== chantId
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
