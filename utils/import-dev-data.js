import * as dotenv from 'dotenv';
dotenv.config();

import { readFileSync } from 'fs';
import mongoose from 'mongoose';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

import Tour from '../models/tourModel.js';
import User from '../models/userModel.js';
import Review from '../models/reviewModel.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
mongoose
  .connect(process.env.DB)
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.log(err));

// READ JSON FILE
const tours = JSON.parse(
  readFileSync(`${__dirname}/../dev-data/data/tours.json`, 'utf-8')
);
const users = JSON.parse(
  readFileSync(`${__dirname}/../dev-data/data/users.json`, 'utf-8')
);
const reviews = JSON.parse(
  readFileSync(`${__dirname}/../dev-data/data/reviews.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('Data successfully deleted!');
  } catch (err) {
    console.log('dele data failed');
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
