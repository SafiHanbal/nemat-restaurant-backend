import multer from 'multer';
import sharp from 'sharp';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/userModel.js';
import AppError from '../utils/AppError.js';

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

export const createUser = (req, res, next) => {
  res.status(400).json({
    status: 'fail',
    message: 'Sign Up to create user.',
  });
};

export const getUser = catchAsync(async (req, res, next) => {
  const { id } = req.body;

  const user = await User.findById(id);

  if (!user) return next(new AppError('User can not be found.', 404));

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword)
    return next(new AppError('This route is not for password update.', 400));

  const { _id } = req.user;
  const filteredBody = filterObj(req.body, 'name', 'address', 'phone', 'email');

  const user = await User.findByIdAndUpdate(_id, filteredBody, { new: true });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  await User.findByIdAndRemove(id);

  res.status(204).json({
    status: 'success',
  });
});

// Upload Profile Pic

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file?.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('No image found', 400), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

export const updatePhoto = upload.single('photo');

export const resizePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError('No image found', 400));

  // Set filename with file property
  req.file.filename = `user-${req.user._id}-${Date.now()}.jpg`;

  await sharp(req.file.buffer)
    .resize({
      width: 150,
      height: 150,
      fit: 'cover',
    })
    .toFormat('jpeg')
    .jpeg({ quality: 60 })
    .toFile(`public/img/user/${req.file.filename}`);

  next();
});

export const updateProfilePic = catchAsync(async (req, res, next) => {
  const photoData = { photo: req.file.filename };
  const updatedUser = await User.findByIdAndUpdate(req.user._id, photoData, {
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
