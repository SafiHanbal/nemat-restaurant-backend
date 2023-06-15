import express from 'express';
import { protect, strictTo } from '../controllers/authController.js';
import {
  getAllOrders,
  createOrder,
  getOrder,
  updateOrder,
  deleteOrder,
  getUserOrder,
} from '../controllers/orderController.js';

const router = express.Router();

router.route('/user-order').get(protect, strictTo('user'), getUserOrder);
router
  .route('/')
  .get(getAllOrders)
  .post(protect, strictTo('user'), createOrder);
router.route('/:id').get(getOrder).patch(updateOrder).delete(deleteOrder);

export default router;
