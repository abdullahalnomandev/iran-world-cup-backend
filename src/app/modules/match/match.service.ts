import { Match } from './match.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { apiClient } from '../../../util/apiClient';
import { logger } from '../../../shared/logger';
import { IMatch } from './match.interface';
import { pushNotificationToAllUsers } from './match.util';

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
        from: '2026-06-25',
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

// const updateLiveMatchesData = async (leagueId: number = 28): Promise<void> => {
//   const today = new Date();
//   const formattedDate = `${today.getFullYear()}-${String(
//     today.getMonth() + 1,
//   ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
//   console.log('formattedDate', formattedDate);
//   try {
//     const { data } = await apiClient.get('/matches', {
//       params: {
//         league_id: leagueId,
//         date: '2026-06-12',
//         // date: formattedDate,
//         limit: 10,
//       },
//     });

//     const liveMatches = data?.data || [];
//     //! TODO: Will be rmove !== true
//     const getLiveMatch = liveMatches.filter((match: any) => match.live !== true);
//     console.log('getLiveMatch', getLiveMatch);

//     const updateToDBIfGoralOrStatusChanged = await Promise.all(
//       getLiveMatch.map(async (match: IMatch) => {
//         const updateMach = await Match.findByIdAndUpdate(
//           { match_id: match.match_id },
//           {
//             $set: {
//               ...match,
//               league_id: leagueId,
//             },
//           },
//           { upsert: true },
//         );
//         return updateMach?.goals !== match.goals || updateMach?.status !== match.status;
//       }),
//     );

//   } catch (error) {
//     logger.error(
//       `❌ Failed to update live matches for league ${leagueId}:`,
//       error,
//     );
//     throw error;
//   }
// };

const updateLiveMatchesData = async (leagueId: number = 28): Promise<void> => {
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  try {
    const { data } = await apiClient.get('/matches', {
      params: {
        league_id: leagueId,
        // date: '2026-06-12',
        date: formattedDate,
        limit: 50,
      },
    });

    const matches = data?.data || [];
    let isGoal = false;

    await Promise.all(
      matches.map(async (match: any) => {
        const existing = await Match.findOne({
          match_id: match.match_id,
        });

        // 🆕 create if not exists
        if (!existing) {
          await Match.create({
            match_id: match.match_id,
            league_id: leagueId,
            status: match.status,
            score: match.score,
            minute: match.minute,
            live: match.live,
          });
          return;
        }

        // 🔍 only check important fields
        const statusChanged = existing.status !== match.status;
        const scoreChanged = existing.score !== match.score;
        const minuteChanged = existing.minute !== match.minute;
        const isLive = existing.live !== match.live;

        // 🚀 update only if needed
        if (statusChanged || scoreChanged || minuteChanged || isLive) {
          const io = (global as any).io;

          const updatedMatch = await Match.findOneAndUpdate(
            { match_id: match.match_id },
            {
              $set: {
                status: match.status,
                score: match.score,
                minute: match.minute,
                live: match.live,
              },
            },
            { new: true },
          );
          if (!!updatedMatch) {
            io.emit('match::updated', match);
            if (updatedMatch.score !== existing.score) {
              isGoal = true;
            }
          }
        }
      }),
    );
    // SET PUSH notification for goal
    if (isGoal) {
      pushNotificationToAllUsers(isGoal);
    }
  } catch (error) {
    logger.error('❌ Failed to update live matches:', error);
    throw error;
  }
};

export const MatchService = {
  getAllMatchesFromDB,
  updateMatchesData,
  updateLiveMatchesData,
};
