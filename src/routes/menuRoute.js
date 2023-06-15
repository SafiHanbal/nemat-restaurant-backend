import express from 'express';
import { protect, strictTo } from '../controllers/authController.js';
import {
  getMenu,
  createMenuItem,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';

const router = express.Router();

router.route('/').get(getMenu).post(protect, strictTo('admin'), createMenuItem);
router
  .route('/:slug')
  .get(getMenuItem)
  .patch(protect, strictTo('admin'), updateMenuItem)
  .delete(protect, strictTo('admin'), deleteMenuItem);

export default router;
