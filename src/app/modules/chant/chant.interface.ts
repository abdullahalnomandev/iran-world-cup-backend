import  { Document, Model } from 'mongoose';

export interface IChant extends Document {
  title: string;
  category: string;
  audio: string;
  country?: string;
  isActive: boolean;
  translation?: string;
  transliteration?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ChantModel = Model<IChant>;
