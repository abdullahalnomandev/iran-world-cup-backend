import { Model, Types } from 'mongoose';

export interface IStanding {
  _id?: Types.ObjectId;

  position: number;
  position_type: string; // e.g. Promotion - World Cup (Play Offs)

  team: string;
  team_id: number;
  team_badge: string;

  played: number;
  wins: number;
  draws: number;
  losses: number;

  goals_for: number;
  goals_against: number;
  goal_difference: number;

  points: number;

  league_id: number;
  league: string;
  league_season: string;

  stage_name: string;
  country: string;

  updated_at: string | Date;
}

// Mongoose Model type
export interface StandingModel extends Model<IStanding> {
  isExistByTeamId(team_id: number): Promise<IStanding | null>;
  bulkUpsertStandings(data: IStanding[]): Promise<void>;
}