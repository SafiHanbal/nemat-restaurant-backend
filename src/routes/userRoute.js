import express from 'express';

import {
  login,
  signUp,
  forgotPassword,
  resetPassword,
  logout,
  updatePassword,
  protect,
  strictTo,
} from '../controllers/authController.js';
import {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updatePhoto,
  resizePhoto,
  updateProfilePic,
} from '../controllers/userController.js';

const router = express.Router();

router.route('/login').post(login);
router.route('/signup').post(signUp);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);
router.route('/logout').get(logout);
router.route('/update-password').post(protect, updatePassword);
router
  .route('/update-photo')
  .post(protect, updatePhoto, resizePhoto, updateProfilePic);

router.use(protect);
router
  .route('/')
  .get(getAllUsers)
  .post(strictTo('admin'), createUser)
  .patch(updateUser);

router
  .route('/:id')
  .get(strictTo('admin'), getUser)
  .delete(strictTo('admin'), deleteUser);

export default router;
