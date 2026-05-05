import mongoose, { Schema } from 'mongoose';
import { IRoomMember, RoomMemberModel } from './roomMember.interface';

const roomMemberSchema = new Schema<IRoomMember, RoomMemberModel>(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);



export const RoomMember = mongoose.model<IRoomMember, RoomMemberModel>('RoomMember', roomMemberSchema);
