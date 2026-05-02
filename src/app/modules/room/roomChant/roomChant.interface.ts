
import mongoose, { Document, Model } from 'mongoose';

export interface IRoomChant extends Document {
  room: mongoose.Types.ObjectId;
  chant: mongoose.Types.ObjectId;
  order?: number; // optional (for UI sorting)
  createdAt: Date;
  updatedAt: Date;
}

export type RoomChantModel = Model<IRoomChant>;
