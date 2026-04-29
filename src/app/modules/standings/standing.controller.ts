import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StandingService } from './standing.service';


const getAllStandings = catchAsync(async (req: Request, res: Response) => {
  const result = await StandingService.getAllStandingsFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Standings retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getSingleStanding = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await StandingService.getSingleStandingFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Standing retrieved successfully',
    data: result,
  });
});



export const StandingController = {
  getAllStandings,
  getSingleStanding,
};
