import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ChantService } from './chant.service';
import { getSingleFilePath } from '../../../shared/getFilePath';

// Create chant
const createChant = catchAsync(async (req: Request, res: Response) => {
  // Handle audio file upload
  const audio = getSingleFilePath(req.files as any, 'audio');
  const payload = {
    ...req.body,
    audio: audio || req.body.audio,
  };

  const result = await ChantService.createChantToDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Chant created successfully',
    data: result,
  });
});

// Get all chants
const getAllChants = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ChantService.getAllChantsFromDB(query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Chants retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

// Get single chant
const getSingleChant = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ChantService.getSingleChantFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Chant retrieved successfully',
    data: result,
  });
});

// Update chant
const updateChant = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Handle audio file upload if present
  const audio = getSingleFilePath(req.files as any, 'audio');
  const payload = {
    ...req.body,
    audio: audio || req.body.audio,
  };

  const result = await ChantService.updateChantToDB(id, payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Chant updated successfully',
    data: result,
  });
});

// Delete chant
const deleteChant = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ChantService.deleteChantFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Chant deleted successfully',
    data: result,
  });
});

// Get chants by category
const getChantsByCategory = catchAsync(async (req: Request, res: Response) => {
  const { category } = req.params;
  const query = req.query;
  const result = await ChantService.getChantsByCategoryFromDB(category, query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: `Chants in category '${category}' retrieved successfully`,
    pagination: result.pagination,
    data: result.data,
  });
});

// Get chants by country
const getChantsByCountry = catchAsync(async (req: Request, res: Response) => {
  const { country } = req.params;
  const query = req.query;
  const result = await ChantService.getChantsByCountryFromDB(country, query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: `Chants from country '${country}' retrieved successfully`,
    pagination: result.pagination,
    data: result.data,
  });
});

export const ChantController = {
  createChant,
  getAllChants,
  getSingleChant,
  updateChant,
  deleteChant,
  getChantsByCategory,
  getChantsByCountry,
};
