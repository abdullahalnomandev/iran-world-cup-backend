
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IStanding } from './standing.interface';
import { Standing } from './standing.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { apiClient } from '../../../util/apiClient';


const getAllStandingsFromDB = async (query: Record<string, any>) => {
  const leagueId = query.league_id || 28;

  const queryObject = {
    ...query,
    sort: 'team'
  }
  const queryBuilder = new QueryBuilder(
    Standing.find({ league_id: leagueId }),
    queryObject
  )
    .search(['team'])
    .paginate()
    .sort()

  const result = await queryBuilder.modelQuery;
  const pagination = await queryBuilder.getPaginationInfo();

  return {
    data: result,
    pagination,
  };
};

const getSingleStandingFromDB = async (id: string): Promise<IStanding | null> => {
  const result = await Standing.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Standing not found');
  }
  return result;
};



const updateStandingsData = async (leagueId: number = 28): Promise<void> => {
  try {
    const { data } = await apiClient.get('/standings', {
      params: { league_id: leagueId },
    });

    const rows = data?.data?.total || [];

    if (rows.length) {
      // Clear existing standings for this league
      await Standing.deleteMany({ league_id: leagueId });

      const seen = new Set();

      const uniqueRows = rows
        .map((r: any) => ({ ...r, league_id: leagueId }))
        .filter((r: any) => {
          const key = `${r.league_id}_${r.team_id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

      await Standing.insertMany(uniqueRows, { ordered: false });
      console.log(`Successfully updated ${uniqueRows.length} standings records for World Cup -> league ${leagueId}`);
    } else {
      console.log(`No standings data found for league ${leagueId}`);
    }
  } catch (error) {
    console.error(`Failed to update standings for league ${leagueId}:`, error);
    throw error;
  }
};



export const StandingService = {
  getAllStandingsFromDB,
  getSingleStandingFromDB,
  updateStandingsData,
};
