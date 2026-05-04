import mongoose, { Schema } from 'mongoose';
import { IRoomAnnouncement, RoomAnnouncementModel } from './announcement.interface';

const roomSchema = new Schema<IRoomAnnouncement, RoomAnnouncementModel>(
  {
    room_id: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);



export const RoomAnnouncement = mongoose.model<IRoomAnnouncement, RoomAnnouncementModel>('RoomAnnouncement', roomSchema);
