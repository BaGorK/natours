import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { createJWT, verifyJWT } from '../utils/tokenUtils.js';

export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
  });

  const token = createJWT({ id: newUser._id });

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  const isCorrectPass = await user?.isCorrectPassword(password, user.password);

  if (!user || !isCorrectPass) {
    return next(new AppError(' Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  const token = createJWT({ id: user._id });

  res.status(200).json({
    status: 'success',
    token,
  });
});

export const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = verifyJWT(token);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The User belonging to the token doe no longer exist', 401)
    );
  }

  // 4) Check if user changed password after the token was issued
  const isChangedPasswordAfter = currentUser.changedPasswordAfter(decoded.iat);
  if (isChangedPasswordAfter) {
    return next(
      new AppError('User recently changed password! Please log in again')
    );
  }

  req.user = currentUser;

  // GRANT ACCESS TO PROTECTED ROUTE
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError('Please provide your email', 400));
  }

  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!',
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  // 2) If token has not expired, and there is user, set the new password
  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
});
