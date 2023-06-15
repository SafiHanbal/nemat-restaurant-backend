import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import sendOTP from '../utils/sendOTP.js';

const createAndSendToken = (user, statusCode, res) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(statusCode).json({
    status: 'success',
    data: {
      token,
      user,
    },
  });
};

export const signUp = catchAsync(async (req, res, next) => {
  const { name, phone, address, password, confirmPassword } = req.body;

  const user = await User.create({
    name,
    phone,
    address,
    password,
    confirmPassword,
  });

  createAndSendToken(user, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { phone, password } = req.body;

  if (!phone || !password)
    return next(
      new AppError('Please provide registered number and password', 400)
    );

  const user = await User.findOne({ phone }).select('+password');
  if (!user) return next(new AppError('Incorrect Phone Number', 404));

  if (!(await user.checkPassword(password, user.password)))
    return next(new AppError('Incorrect Password.', 400));

  createAndSendToken(user, 200, res);
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { phone } = req.body;

  // Find User
  const user = await User.findOne({ phone });

  if (!user)
    return next(new AppError('Please enter a registered number.', 404));

  // Generate OTP and save encrypted version with expire time
  const OTP = await user.createOTP();
  await user.save({ validateBeforeSave: false });

  // Send OTP to phone using Twilio
  await sendOTP(phone, OTP);

  res.status(200).json({
    status: 'success',
    message: 'We have send an OTP to your number.',
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { phone, otp, password, confirmPassword } = req.body;

  // Check otp with encrypted reset token
  const user = await User.findOne({ phone });
  const validateOTP = await user.checkOTP(
    user.passwordResetToken,
    user.passwordResetExpires,
    otp,
    next
  );

  // if matched reset password
  if (!validateOTP) return next(new AppError('Incorrect OTP.', 400));

  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  createAndSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.checkPassword(currentPassword, user.password)))
    return next(new AppError('Your current password does not match', 400));

  user.password = newPassword;
  user.confirmPassword = confirmPassword;
  await user.save();

  createAndSendToken(user, 200, res);
});

export const logout = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'You are logged out successfully.',
  });
});

// Protect route from unauthenticated requests
export const protect = catchAsync(async (req, res, next) => {
  // Check for bearer jwt token
  if (
    !req.headers.authorization &&
    !req.headers.authorization.startsWith('Bearer')
  )
    return next(
      new AppError('You are not logged in. Please login to continue.', 401)
    );

  const token = req.headers.authorization.split(' ')[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded._id);

  // Check if user no longer exists.
  if (!user)
    return next(
      new AppError('User associated to this token no longer exists.', 401)
    );

  // Check if user changed password after the token issued
  if (await user.changedPasswordAfter(decoded.iat))
    next(
      new AppError('User recently changed password. Please login again.', 401)
    );

  req.user = user;
  next();
});

// Strict route to admin
export const strictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You are not allowed to access this route', 400)
      );
    next();
  };
