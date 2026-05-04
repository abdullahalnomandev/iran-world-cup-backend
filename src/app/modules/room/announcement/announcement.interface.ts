import mongoose, { Document, Model } from 'mongoose';
import { IUser } from '../../user/user.interface';

export interface IRoomAnnouncement extends Document {
  room_id: mongoose.Types.ObjectId | IUser;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RoomAnnouncementModel = Model<IRoomAnnouncement>;
