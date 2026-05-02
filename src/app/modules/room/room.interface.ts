import mongoose, { Document, Model } from 'mongoose';
import { IUser } from '../user/user.interface';

export interface IRoom extends Document {
  name: string;
  creator: mongoose.Types.ObjectId | IUser;
  title: string;
  location: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  match_id: string;
  country: string;
  roomChant: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export type RoomModel = Model<IRoom>;
