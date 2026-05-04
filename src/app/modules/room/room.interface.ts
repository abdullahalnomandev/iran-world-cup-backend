import mongoose, { Document, Model } from 'mongoose';
import { IUser } from '../user/user.interface';

export interface IRoom extends Document {
  creator: mongoose.Types.ObjectId | IUser;
  roomChants: mongoose.Types.ObjectId[] | any[];
  name: string;
  title: string;
  location: {
    type: string;
    coordinates: [number, number]; // [log, lat]
  };
  lat: number;
  log: number;
  match_id: string;
  room_id: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RoomModel = Model<IRoom>;
