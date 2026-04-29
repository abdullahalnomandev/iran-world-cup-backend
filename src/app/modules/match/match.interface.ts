import { Model, Types } from 'mongoose';
import { MATCH_STATUS } from './match.constant';

export interface IMatch {
    _id?: Types.ObjectId;

    match_id: number;
    date: string;
    time: string;

    home: string;
    home_id: number;
    home_badge: string;

    away: string;
    away_id: number;
    away_badge: string;

    ht_score?: string;
    score?: string;

    status?: MATCH_STATUS;
    minute?: number | null;
    live?: boolean;

    league?: string;
    league_id?: number;
    league_round?: string;
    league_season?: string;
    league_logo?: string;

    country?: string;
    country_id?: number;

    stadium?: string;
    referee?: string;

    home_formation?: string;
    away_formation?: string;

    stage_name?: string;

    vars?: {
        home_team?: any[];
        away_team?: any[];
    };

    goals?: {
        time?: string;
        player?: string;
        player_id?: number;
        type?: string;
        team?: string;
    }[];

    cards?: {
        time?: string;
        player?: string;
        player_id?: number;
        type?: string;
        team?: string;
    }[];

    subs?: {
        time?: string;
        player_in?: string;
        player_in_id?: number;
        player_out?: string;
        player_out_id?: number;
        team?: string;
    }[];

    stats?: {
        type?: string;
        home?: string;
        away?: string;
    }[];

    lineups?: any;

    updated_at?: string | Date;
}

// Mongoose Model type
export interface MatchModel extends Model<IMatch> { }