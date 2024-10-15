import Tour from '../models/tourModel.js';
import catchAsync from '../utils/catchAsync.js';

const getOverview = catchAsync(async (req, res) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // 2) Build template
  // 3) Render that template using tour data from 1)

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

const getTour = (req, res) => {
  res.status(200).render('tour', {
    tour: 'The Forest Hiker Tour',
  });
};

export const viewsController = {
  getOverview,
  getTour,
};
