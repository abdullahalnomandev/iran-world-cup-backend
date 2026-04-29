import { model, Schema } from 'mongoose';
import { IStanding, StandingModel } from './standing.interface';

const standingSchema = new Schema<IStanding, StandingModel>(
  {
    position: { type: Number, required: true },
    position_type: { type: String },

    team: { type: String },
    team_id: { type: Number },
    team_badge: { type: String },

    played: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },

    goals_for: { type: Number, default: 0 },
    goals_against: { type: Number, default: 0 },
    goal_difference: { type: Number, default: 0 },

    points: { type: Number, default: 0 },

    league_id: { type: Number, required: true },
    league: { type: String, required: true },
    league_season: { type: String, required: true },

    stage_name: { type: String, required: true },
    country: { type: String, required: true },

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

// Check if standing exists by team_id
standingSchema.statics.isExistByTeamId = async function (
  team_id: number
) {
  return this.findOne({ team_id });
};


export const Standing = model<IStanding, StandingModel>(
  'Standing',
  standingSchema
);