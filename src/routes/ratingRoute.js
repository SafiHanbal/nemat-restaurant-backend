import express from 'express';
import {
  getAllRatings,
  createRating,
  getRating,
  updateRating,
  deleteRating,
} from '../controllers/ratingController.js';
import { protect, strictTo } from '../controllers/authController.js';

const router = express.Router();

router.use(protect, strictTo('user'));
router.route('/').get(getAllRatings).post(createRating);
router.route('/:id').get(getRating).patch(updateRating).delete(deleteRating);

export default router;
