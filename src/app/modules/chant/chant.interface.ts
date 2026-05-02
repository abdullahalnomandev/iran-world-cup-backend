import  { Document, Model } from 'mongoose';

export interface IChant extends Document {
  title: string;
  category: string;
  audio: string;
  country?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ChantModel = Model<IChant>;
