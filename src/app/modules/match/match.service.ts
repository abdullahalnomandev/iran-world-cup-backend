import { Match } from './match.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { apiClient } from '../../../util/apiClient';
import { logger } from '../../../shared/logger';

const getAllMatchesFromDB = async (query: Record<string, any>) => {
  const leagueId = Number(query.league_id) || 28;

  const matchQuery: Record<string, any> = {
    league_id: leagueId,
  };

  const filterQuery = {
    ...query,
    sort: query.sort || { date: 1, time: 1 }, // Sort by date ascending, then by time ascending
  };

  console.log(filterQuery);
  // team filter
  if (query.team_id) {
    const teamId = Number(query.team_id);

    matchQuery.$or = [{ home_id: teamId }, { away_id: teamId }];
  }

  // date filter
  if (query.from && query.to) {
    matchQuery.date = {
      $gte: query.from,
      $lte: query.to,
    };
  }
  const queryBuilder = new QueryBuilder(Match.find(matchQuery), filterQuery)
    .filter(['from', 'to', 'team_id'])
    .sort()
    .paginate();

  const result = await queryBuilder.modelQuery;
  const pagination = await queryBuilder.getPaginationInfo();

  return {
    data: result,
    pagination,
  };
};




const updateMatchesData = async (leagueId: number = 28): Promise<void> => {
  try {
    const { data } = await apiClient.get('/matches', {
      params: {
        league_id: leagueId,
        from: '2026-06-29',
        to: '2026-07-31',
        limit: 200,
      },
    });

    const knockoutMatches = data?.data || [];

    if (!knockoutMatches.length) {
      logger.info(`No match data found for league ${leagueId}`);
      return;
    }

    for (const match of knockoutMatches) {
      await Match.updateOne(
        { match_id: match.match_id },
        {
          $set: {
            ...match,
            league_id: leagueId,
          },
        },
        { upsert: true },
      );
    }

    logger.info(
      `✅ Synced ${knockoutMatches.length} knockout matches for league ${leagueId}`,
    );
  } catch (error) {
    logger.error(`❌ Failed to update matches for league ${leagueId}:`, error);
    throw error;
  }
};


const updateLiveMatchesData = async (leagueId: number = 28): Promise<void> => {
  // try {
  //   const { data } = await apiClient.get('/matches', {
  //     params: {
  //       league_id: leagueId,
  //       from: '2026-06-29',
  //       to: '2026-07-31',
  //       limit: 200,
  //     },
  //   });

  //   const liveMatches = data?.data || [];

  //   if (!liveMatches.length) {
  //     logger.info(`No live match data found for league ${leagueId}`);
  //     return;
  //   }

  //   for (const match of liveMatches) {
  //     await Match.updateOne(
  //       { match_id: match.match_id },
  //       {
  //         $set: {
  //           ...match,
  //           league_id: leagueId,
  //         },
  //       },
  //       { upsert: true },
  //     );
  //   }

  //   logger.info(
  //     `✅ Synced ${liveMatches.length} live matches for league ${leagueId}`,
  //   );
  // } catch (error) {
  //   logger.error(`❌ Failed to update live matches for league ${leagueId}:`, error);
  //   throw error;
  // }
};

export const MatchService = {
  getAllMatchesFromDB,
  updateMatchesData,
  updateLiveMatchesData,
};
