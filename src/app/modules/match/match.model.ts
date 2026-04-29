import { model, Schema } from 'mongoose';
import { IMatch, MatchModel } from './match.interface';

const matchSchema = new Schema<IMatch, MatchModel>(
  {
    match_id: { type: Number, required: true, unique: true },
    date: { type: String, required: true },
    time: { type: String, required: true },

    home: { type: String, required: true },
    home_id: { type: Number, required: true },
    home_badge: { type: String, required: true },

    away: { type: String, required: true },
    away_id: { type: Number, required: true },
    away_badge: { type: String, required: true },

    ht_score: { type: String },
    score: { type: String },

    status: { type: String },
    minute: { type: Number, default: null },
    live: { type: Boolean, default: false },

    league: { type: String },
    league_id: { type: Number },
    league_round: { type: String },
    league_season: { type: String },
    league_logo: { type: String },

    country: { type: String },
    country_id: { type: Number },

    stadium: { type: String },
    referee: { type: String },

    home_formation: { type: String },
    away_formation: { type: String },

    stage_name: { type: String },

    vars: {
      home_team: [{ type: Schema.Types.Mixed }],
      away_team: [{ type: Schema.Types.Mixed }],
    },

    goals: [{
      time: { type: String },
      player: { type: String },
      player_id: { type: Number },
      type: { type: String },
      team: { type: String },
    }],

    cards: [{
      time: { type: String },
      player: { type: String },
      player_id: { type: Number },
      type: { type: String },
      team: { type: String },
    }],

    subs: [{
      time: { type: String },
      player_in: { type: String },
      player_in_id: { type: Number },
      player_out: { type: String },
      player_out_id: { type: Number },
      team: { type: String },
    }],

    stats: [{
      type: { type: String },
      home: { type: String },
      away: { type: String },
    }],

    lineups: { type: Schema.Types.Mixed },

    updated_at: {
      type: Schema.Types.Mixed,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/* ---------------- STATIC METHODS ---------------- */

// Check if match exists by match_id
matchSchema.statics.isExistByMatchId = async function (
  match_id: number
) {
  return this.findOne({ match_id });
};

export const Match = model<IMatch, MatchModel>(
  'Match',
  matchSchema
);
