import * as reviewController from '../controllers/reviewController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

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
    reviewController.createReview
  );

export default router;
