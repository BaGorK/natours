import express from 'express';

import * as reviewController from '../controllers/reviewController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router({ mergeParams: true });
// By default each router has access to the parameters of their specific routes. to enable access to tourId in this route from the tour route , we set mergeParams to true

// POST /tours/:tourId/reviews
// POST /reviews   --- they both handled in the same route

router
  .route('/')
  .get(
    // authController.protect,
    // authController.restrictTo('admin'),
    reviewController.getAllReviews
  )
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview)
  .get(reviewController.getReview);

export default router;
