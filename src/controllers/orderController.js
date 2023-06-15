import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/APIFeatures.js';
import Order from '../models/orderModel.js';

export const getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await new APIFeatures(Order.find(), req.query)
    .filter()
    .sort()
    .limit()
    .paginate()
    .query.populate('menuItems.menuItem');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
    },
  });
});

export const createOrder = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;

  const order = await Order.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

export const getOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id).populate('menuItems.menuItem');

  if (!order) return next(new AppError('Order not found.', 404));

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

export const updateOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  if (!order) return next(new AppError('Order not found.', 404));

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

export const deleteOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await Order.findByIdAndRemove(id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getUserOrder = catchAsync(async (req, res, next) => {
  const { user } = req;

  const orders = await Order.find({ user: user._id })
    .sort({ orderedAt: -1 })
    .populate('menuItems.menuItem');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
    },
  });
});
