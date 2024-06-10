import Tour from '../models/tourModel.js';
import APIFeatures from '../utils/apiFeatures.js';

export const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

export const getAllTours = async (req, res) => {
  try {
    /*
    // BUILD QUERY
    // 1) filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced Filtering
    // /api/v1/tours?difficulty=easy&duration[gte]=5
    // console.log(req.query); // {difficulty: easy, duration: {gte: 5}} // only the $ is missing
    // {difficulty: easy, duration: {$gte: 5}} // this is the query in mongodb to work with operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr));

    let query = Tour.find(JSON.parse(queryStr)); // this will return query so that we can chain other methods

    // Sorting
    if (req.query.sort) {
      // /tours?sort=-price,ratingsAverage
      // sort = '-price ratingsAverage'
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // to sort the newest first | in descending order
    }

    // FIELD LIMITING
    if (req.query.fields) {
      // /tours?fields=name,duration,price
      // query = query.select('name duration price');  // select only these field names | aka = projecting
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // PAGINATION
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;

    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }
    const tours = await query; // the we execute that query here and get the result
*/
    // EXECUTE THE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query; // the we execute that query here and get the result

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

export const createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(200).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

export const getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

export const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

export const deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

export const getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      /*
      // we can match multiple times
      {
        $match: { _id: { $ne: 'easy' } }, // we take _id  filed from the previous group stage and filter out the easy | we do not consider the original tour doc here. We are working with the data that is coming from the previous stage. 
      },
      */
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
    /*z
    // Response
      {
        "status": "success",
        "data": {
            "stats": [
                {
                    "_id": null,
                    "avgRating": 4.783333333333334,
                    "avgPrice": 1647,
                    "minPrice": 397,
                    "maxPrice": 2997
                }
            ]
        }
      }
    */
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
