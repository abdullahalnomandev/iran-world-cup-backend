import { z } from 'zod';

const createRoomZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Room name is required' }),
    title: z.string({ required_error: 'Room title is required' }),
    location: z.object({
      coordinates: z.array(z.number()).length(2, {
        message: 'Coordinates must be [longitude, latitude]'
      })
    }),
    match_id: z.string({ required_error: 'Match ID is required' }),
    country: z.string({ required_error: 'Country is required' }),
    roomChant: z.array(z.string()).optional(),
  }),
});

const updateRoomZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    title: z.string().optional(),
    location: z.object({
      coordinates: z.array(z.number()).length(2, {
        message: 'Coordinates must be [longitude, latitude]'
      })
    }).optional(),
    match_id: z.string().optional(),
    country: z.string().optional(),
    roomChant: z.array(z.string()).optional(),
  }),
});

const addChantToRoomZodSchema = z.object({
  body: z.object({
    chantId: z.string({ required_error: 'Chant ID is required' }),
    order: z.number().optional(),
  }),
});

const getRoomsNearLocationZodSchema = z.object({
  query: z.object({
    longitude: z.number({ required_error: 'Longitude is required' }),
    latitude: z.number({ required_error: 'Latitude is required' }),
    maxDistance: z.number().optional(),
  }),
});

export const RoomValidation = {
  createRoomZodSchema,
  updateRoomZodSchema,
  addChantToRoomZodSchema,
  getRoomsNearLocationZodSchema,
};
