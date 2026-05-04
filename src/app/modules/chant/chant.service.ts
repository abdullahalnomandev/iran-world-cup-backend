import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IChant } from './chant.interface';
import { Chant } from './chant.model';
import { getTranslation } from './chant.util';

// Create chant
const createChantToDB = async (payload: Partial<IChant>): Promise<IChant> => {
  const translation = await getTranslation(payload.title || '');

  const result = await Chant.create({
    ...payload,
    translation: translation.translation,
    transliteration: translation.transliteration
  });
  return result;
};

// Get all chants with filtering and pagination
const getAllChantsFromDB = async (query: Record<string, any>) => {
  console.log(query);
  const chantQuery = new QueryBuilder(Chant.find(), query)
    .search(['title', 'category', 'country'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await chantQuery.modelQuery;
  const pagination = await chantQuery.getPaginationInfo();

  return {
    data: result,
    pagination,
  };
};

// Get single chant by ID
const getSingleChantFromDB = async (id: string): Promise<IChant | null> => {
  const result = await Chant.findOne({ _id: id, isActive: true });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Chant not found');
  }
  return result;
};

// Update chant by ID
const updateChantToDB = async (
  id: string,
  payload: Partial<IChant>
): Promise<IChant | null> => {
  const isExist = await Chant.findOne({ _id: id, isActive: true });
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Chant not found');
  }

  const result = await Chant.findOneAndUpdate(
    { _id: id },
    { $set: payload },
    { new: true, runValidators: true }
  );
  return result;
};

// Delete chant (soft delete - set isActive to false)
const deleteChantFromDB = async (id: string): Promise<IChant | null> => {
  const result = await Chant.findByIdAndDelete(id);
  return result;
};

// Get chants by category
const getChantsByCategoryFromDB = async (category: string, query: Record<string, any>) => {
  const chantQuery = new QueryBuilder(
    Chant.find({ category, isActive: true }),
    query
  )
    .search(['title'])
    .filter(['country'])
    .sort()
    .paginate()
    .fields();

  const result = await chantQuery.modelQuery;
  const pagination = await chantQuery.getPaginationInfo();

  return {
    data: result,
    pagination,
  };
};

// Get chants by country
const getChantsByCountryFromDB = async (country: string, query: Record<string, any>) => {
  const chantQuery = new QueryBuilder(
    Chant.find({ country, isActive: true }),
    query
  )
    .search(['title', 'category'])
    .sort()
    .paginate()
    .fields();

  const result = await chantQuery.modelQuery;
  const pagination = await chantQuery.getPaginationInfo();

  return {
    data: result,
    pagination,
  };
};

export const ChantService = {
  createChantToDB,
  getAllChantsFromDB,
  getSingleChantFromDB,
  updateChantToDB,
  deleteChantFromDB,
  getChantsByCategoryFromDB,
  getChantsByCountryFromDB,
};
