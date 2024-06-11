import * as dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3000;

try {
  await mongoose.connect(process.env.DB);
  app.listen(PORT, () =>
    console.log(`DB connected & App running on port ${PORT}...`)
  );
} catch (err) {
  console.log('Something went wrong');
  console.log(err.name, err.message);
  process.exit(1);
}

// unhandled promise rejections for asynchronous code
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
