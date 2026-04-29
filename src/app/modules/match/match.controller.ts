import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MatchService } from './match.service';


const getAllMatches = catchAsync(async (req: Request, res: Response) => {
  const result = await MatchService.getAllMatchesFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Matches retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});




export const MatchController = {
  getAllMatches
};
