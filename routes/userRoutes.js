import { Router } from 'express';

import * as userController from '../controllers/userController.js';
import { login, signup } from '../controllers/authController.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
