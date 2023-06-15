import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import AppError from '../utils/AppError.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
  },
  email: {
    type: String,
  },
  phone: {
    type: Number,
    required: [true, 'Please provide a contact number.'],
    unique: [true, 'This number is alredy registered. Please login.'],
    min: [1000000000, 'Please provide a valid contact number.'],
    max: [9999999999, 'Please provide a valid contact number.'],
  },
  address: {
    house: {
      type: String,
      required: [true, 'Please provide your house location details.'],
    },
    area: {
      type: String,
      required: [true, 'Please provide your area details.'],
    },
    city: {
      type: String,
      required: [true, 'Please provide your city.'],
    },
    pincode: {
      type: Number,
      required: [true, 'Please provide a pincode.'],
      min: [100000, 'Please provide a valide pincode!'],
      max: [999999, 'Please provide a valid pincode!'],
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password should be atleast 8 characters.'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password.'],
    validate: {
      message: 'Confirm password does not match password.',
      validator: function (val) {
        return this.password === val;
      },
    },
  },
  role: {
    type: String,
    enum: ['user', 'staff', 'admin'],
    default: 'user',
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  acitve: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Encrypt Password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

// Check password for Login
userSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Create OTP to Reset Password
userSchema.methods.createOTP = async function () {
  const OTP = String(Math.floor(Math.random() * (9999 - 1000) + 1000));
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(OTP)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return OTP;
};

userSchema.methods.checkOTP = async function (
  passwordResetToken,
  passwordResetExpires,
  OTP,
  next
) {
  if (Date.now() > passwordResetExpires)
    return next(new AppError('OTP expired request a new OTP.', 400));
  const hashedToken = crypto.createHash('sha256').update(OTP).digest('hex');

  return passwordResetToken === hashedToken;
};

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

export default User;
