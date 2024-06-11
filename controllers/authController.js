import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { createJWT } from '../utils/tokenUtils.js';

export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const newUser = await User.create({ name, email, password, passwordConfirm });

  const token = createJWT({ id: newUser._id });

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

export const login = catchAs(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists && password is correct

  // 3) If everything ok, send token to client
  const token = '';

  res.status(200).json({
    status: 'success',
    token,
  });
});
