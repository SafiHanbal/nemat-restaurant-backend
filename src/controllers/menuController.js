import APIFeatures from '../utils/APIFeatures.js';
import catchAsync from '../utils/catchAsync.js';
import Menu from '../models/menuModel.js';
import AppError from '../utils/AppError.js';

export const getMenu = catchAsync(async (req, res, next) => {
  const query = new APIFeatures(Menu.find(), req.query)
    .filter()
    .sort()
    .limit()
    .paginate().query;

  const menu = await query;

  res.status(200).json({
    status: 'success',
    results: menu.length,
    data: {
      menu,
    },
  });
});

export const createMenuItem = catchAsync(async (req, res, next) => {
  const menuItem = await Menu.create(req.body);

  if (!menuItem) return next(new AppError('Unable to create menu item.', 400));
  res.status(201).json({
    status: 'success',
    data: {
      menuItem,
    },
  });
});

export const getMenuItem = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const menuItem = await Menu.findOne({ slug });

  res.status(200).json({
    status: 'success',
    data: {
      menuItem,
    },
  });
});

export const updateMenuItem = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const menuItem = await Menu.findOneAndUpdate({ slug }, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      menuItem,
    },
  });
});

export const deleteMenuItem = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  await Menu.findOneAndRemove({ slug });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
