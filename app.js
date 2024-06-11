import express from 'express';
import morgan from 'morgan';

import userRouter from './routes/userRoutes.js';
import tourRouter from './routes/tourRoutes.js';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import AppError from './utils/appError.js';
import globalErrorHandlerMiddleWare from './controllers/errorController.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(path.resolve(__dirname, `/public`)));

app.get('/api/v1/test', (req, res) => {
  return res
    .status(200)
    .json({ message: 'Hello from the server side', app: 'Natours' });
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`
  // })

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  // next(err);

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandlerMiddleWare);

export default app;
