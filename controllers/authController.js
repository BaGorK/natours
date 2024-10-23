import crypto from 'crypto';

import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { Email } from '../utils/email.js';
import { createJWT, verifyJWT } from '../utils/tokenUtils.js';

const sendCookie = (res, token) =>
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
  });

  const url = `${process.env.BASE_URL}/me`;
  await new Email(newUser, url).sendWelcome();

  const token = createJWT({ id: newUser._id });
  sendCookie(res, token);

  // remove the password from the output
  newUser.password = undefined;

  res.status(201).json({
    status: 'success',
    token,
    message: 'user signed up successfully',
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
  sendCookie(res, token);

  sendCookie(res, token);

  res.status(200).json({
    status: 'success',
    message: 'user logged in successfully',
    token,
  });
});

export const logout = catchAsync(async (req, res, next) => {
  res.status(200).clearCookie('jwt').json({
    status: 'success',
    message: 'user logged out successfully',
  });
});

export const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token -- there are two issues to consider.
  // 2.1) Check if the token is a valid token --> handle JWTError
  // 2.2) Check if the token is not expired --> handle JWTExpiredError
  const decoded = verifyJWT(token);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The User belonging to the token doe no longer exist', 401)
    );
  }

  // 4) Check if user changed password after the token was issued
  // case: if malicious user gets access to the users token and the user changes his password to defend himself, we need to check if the password is changed after the token is signed
  const isChangedPasswordAfter = currentUser.changedPasswordAfter(decoded.iat);
  if (isChangedPasswordAfter) {
    return next(
      new AppError('User recently changed password! Please log in again')
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;

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
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    await new Email(user, resetURL).sendPasswordReset();
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!',
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // 3) Update changedPasswordAt property for the user and save the doc
  await user.save();

  // 4) Log the user in, send JWT
  const token = createJWT({ id: user._id });
  sendCookie(res, token);

  res.status(200).json({
    status: 'success',
    message: 'password reset successfully',
    token,
  });
});

export const updatePassword = catchAsync(async (req, res, next) => {
  // 1) check if the user has provided the required fields
  const { passwordCurrent, password, passwordConfirm } = req.body;

  if (!passwordCurrent || !password || !passwordConfirm) {
    return next(
      new AppError(
        'Please provide all the required fields, passwordCurrent, password, passwordConfirm',
        400
      )
    );
  }
  // 2) Get user from collection
  const user = await User.findById(req.user._id).select('+password');

  // 3) Check if POSTed current password is correct
  const isCorrectPass = await user?.isCorrectPassword(
    req.body.passwordCurrent,
    user.password
  );

  if (!user || !isCorrectPass) {
    return next(new AppError('Incorrect password', 401));
  }

  // 4) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 5) Log user in, send JWT
  const token = createJWT({ id: user._id });
  sendCookie(res, token);

  res.status(200).json({
    status: 'success',
    message: 'password updated successfully',
    token,
  });
});
