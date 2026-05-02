import { IRoomChant } from "./roomChant.interface";
import mongoose from "mongoose";

const RoomChantSchema = new mongoose.Schema<IRoomChant>(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    chant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chant',
      required: true,
    },
    order: Number,
  },
  { timestamps: true }
);

export const RoomChant = mongoose.model<IRoomChant>(
  'RoomChant',
  RoomChantSchema
);