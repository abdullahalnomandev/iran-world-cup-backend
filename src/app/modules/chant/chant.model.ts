import { model, Schema } from 'mongoose';
import {
  IChant,
  ChantModel,
} from './chant.interface';

const chantSchema = new Schema<IChant, ChantModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    audio: {
      type: String
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Chant = model<IChant, ChantModel>(
  'Chant',
  chantSchema
);
