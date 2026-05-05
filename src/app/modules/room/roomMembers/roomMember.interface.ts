import mongoose, { Document, Model } from 'mongoose';
import { IUser } from '../../user/user.interface';

export interface IRoomMember extends Document {
  user: mongoose.Types.ObjectId | IUser;
  room: mongoose.Types.ObjectId | any;
  createdAt: Date;
  updatedAt: Date;
}



export type RoomMemberModel = Model<IRoomMember>;
