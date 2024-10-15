import express from 'express';
import { viewsController } from '../controllers/viewsController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.get('/', viewsController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', viewsController.isLoggedIn, viewsController.getTour);
router.get('/login', viewsController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);

export default router;
