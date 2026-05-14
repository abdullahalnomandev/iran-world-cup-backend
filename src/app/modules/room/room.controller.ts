import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { RoomService } from './room.service';

// Create room
const createRoom = catchAsync(async (req: Request, res: Response) => {
  const payload = {
    ...req.body,
    creator: req.user?.id,
  };

  const result = await RoomService.createRoomToDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Room created successfully',
    data: result,
  });
});

// Get all rooms
const getAllRooms = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await RoomService.getAllRoomsFromDB(query, req?.user?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Rooms retrieved successfully',
    pagination: result.pagination as any,
    data: result.data,
  });
});

// Get single room
const getSingleRoom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await RoomService.getSingleRoomFromDB(id , req?.user?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Room retrieved successfully',
    data: result,
  });
});

// Update room
const updateRoom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const result = await RoomService.updateRoomToDB(id, payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Room updated successfully',
    data: result,
  });
});

// Delete room
const deleteRoom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await RoomService.deleteRoomFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Room deleted successfully',
    data: result,
  });
});

// Get rooms by country
const getRoomsByCountry = catchAsync(async (req: Request, res: Response) => {
  const { country } = req.params;
  const query = req.query;
  const result = await RoomService.getRoomsByCountryFromDB(country, query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: `Rooms in country '${country}' retrieved successfully`,
    pagination: result.pagination,
    data: result.data,
  });
});

// Get rooms by match ID
const getRoomsByMatch = catchAsync(async (req: Request, res: Response) => {
  const { matchId } = req.params;
  const query = req.query;
  const result = await RoomService.getRoomsByMatchFromDB(matchId, query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: `Rooms for match '${matchId}' retrieved successfully`,
    pagination: result.pagination,
    data: result.data,
  });
});

// Get rooms near location
const getRoomsNearLocation = catchAsync(async (req: Request, res: Response) => {
  const { longitude, latitude } = req.query;
  const maxDistance = Number(req.query.maxDistance) || 10000; // 10km default
  
  if (!longitude || !latitude) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'Longitude and latitude are required',
    });
  }

  const result = await RoomService.getRoomsNearLocationFromDB(
    Number(longitude),
    Number(latitude),
    maxDistance,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: `Rooms near location retrieved successfully`,
    pagination: result.pagination,
    data: result.data,
  });
});

// Add chant to room
const addChantToRoom = catchAsync(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { chantId, order } = req.body;

  const result = await RoomService.addChantToRoomFromDB(roomId, chantId, order);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Chant added to room successfully',
    data: result,
  });
});

// Remove chant from room
const removeChantFromRoom = catchAsync(async (req: Request, res: Response) => {
  const { roomId, chantId } = req.params;

  const result = await RoomService.removeChantFromRoomFromDB(roomId, chantId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Chant removed from room successfully',
    data: result,
  });
});

// Create room announcement
const createRoomAnnouncement = catchAsync(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { content } = req.body;

  const result = await RoomService.createRoomAnnouncementFromDB(roomId, content);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Room announcement created successfully',
    data: result,
  });
});

// Join room
const joinRoom = catchAsync(async (req: Request, res: Response) => {
  const { room_code } = req?.body;

  const result = await RoomService.joinRoomFromDB(room_code, req.user?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Room joined successfully',
    data: result,
  });
});

// Trigger room chant
const triggerRoomChant = catchAsync(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { chant_id } = req.body;

  const result = await RoomService.triggerRoomChantFromDB(roomId, chant_id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Room chant triggered successfully',
    data: result,
  });
});

// Leave room
const leaveRoom = catchAsync(async (req: Request, res: Response) => {
  const { roomId } = req.params;

  const result = await RoomService.leaveRoomFromDB(roomId, req.user?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Room left successfully',
    data: result,
  });
});

export const RoomController = {
  createRoom,
  getAllRooms,
  getSingleRoom,
  updateRoom,
  deleteRoom,
  getRoomsByCountry,
  getRoomsByMatch,
  getRoomsNearLocation,
  addChantToRoom,
  removeChantFromRoom,
  createRoomAnnouncement,
  joinRoom,
  triggerRoomChant,
  leaveRoom
};
