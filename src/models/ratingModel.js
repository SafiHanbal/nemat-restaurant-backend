import mongoose from 'mongoose';
import Menu from './menuModel.js';

const ratingSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: [1, 'Please provide a number more than 1.'],
    max: [5, 'Please provide a number less than 5.'],
    required: [true, 'Please provide a rating.'],
  },
  review: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  menuItem: {
    type: mongoose.Types.ObjectId,
  },
  user: {
    type: mongoose.Types.ObjectId,
  },
});

ratingSchema.index({ menuItem: 1, user: 1 }, { unique: true });

ratingSchema.statics.calcAverageRatings = async function (menuItem) {
  const stats = await this.aggregate([
    {
      $match: { menuItem: new mongoose.Types.ObjectId(menuItem) },
    },
    {
      $group: {
        _id: null,
        ratingsAverage: { $avg: '$rating' },
        ratingsCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    const { ratingsAverage, ratingsCount } = stats[0];
    await Menu.findByIdAndUpdate(menuItem, {
      ratingsAverage: ratingsAverage.toFixed(1),
      ratingsCount,
    });
  } else {
    await Menu.findByIdAndUpdate(menuItem, {
      ratingsAverage: 4,
      ratingsCount: 0,
    });
  }
};

ratingSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.menuItem);
});

ratingSchema.post(/findOneAnd/, async function (docs) {
  await docs.constructor.calcAverageRatings(docs.menuItem);
});

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
