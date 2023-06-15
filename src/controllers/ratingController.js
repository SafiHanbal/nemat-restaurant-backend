import catchAsync from '../utils/catchAsync.js';
import Rating from '../models/ratingModel.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/APIFeatures.js';

export const getAllRatings = catchAsync(async (req, res, next) => {
  const ratings = await new APIFeatures(Rating.find(), req.query)
    .filter()
    .sort()
    .limit()
    .paginate().query;

  res.status(200).json({
    status: 'success',
    results: ratings.length,
    data: {
      ratings,
    },
  });
});

export const createRating = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { rating, review = '', menuItem } = req.body;

  const newRating = await Rating.create({
    rating,
    review,
    menuItem,
    user: user._id,
  });

  if (!newRating) return next(new AppError('Unable to create rating.', '400'));

  res.status(201).json({
    status: 'success',
    data: {
      rating: newRating,
    },
  });
});

export const getRating = catchAsync(async (req, res, next) => {
  const user = req.user._id;
  const { id: menuItem } = req.params;
  const rating = await Rating.findOne({ user, menuItem });

  res.status(200).json({
    status: 'success',
    data: {
      rating,
    },
  });
});

export const updateRating = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedRating = await Rating.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      rating: updatedRating,
    },
  });
});

export const deleteRating = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  await Rating.findOneAndRemove(id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
