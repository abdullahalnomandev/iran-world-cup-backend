import mongoose, { Schema } from 'mongoose';
import { IRoom, RoomModel } from './room.interface';

const roomSchema = new Schema<IRoom, RoomModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number] as unknown as [number, number], // TS trick for tuple
        required: true,
      },
    },
    match_id: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create geospatial index for location-based queries
roomSchema.index({ location: '2dsphere' });

export const Room = mongoose.model<IRoom, RoomModel>('Room', roomSchema);
