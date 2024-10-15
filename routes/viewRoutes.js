import express from 'express';
import { viewsController } from '../controllers/viewsController.js';

const router = express.Router();

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);

export default router;
