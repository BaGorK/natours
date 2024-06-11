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
} catch (error) {
  console.log('Something went wrong');
  process.exit(1);
}
