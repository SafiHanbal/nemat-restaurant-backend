import mongoose from 'mongoose';
import slugify from 'slugify';

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Menu item must have a name.'],
      unique: [true, 'Menu item should have unique name.'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a short description about menu item.'],
      trim: true,
    },
    slug: String,
    price: {
      type: Number,
      required: [true, 'Menu item must have a price.'],
    },
    servings: {
      type: Number,
      validate: {
        message: 'Servings should not be a decimal',
        validator: function (value) {
          return `${value}`.split('.')[1] ? false : true;
        },
      },
      default: 1,
    },
    image: {
      small: String,
      large: String,
    },
    category: {
      type: String,
      enum: {
        values: ['starter', 'main-course', 'bread', 'rice', 'sides', 'dessert'],
        message:
          'Please specify menu item as starter, main-course, bread, rice, sides or dessert.',
      },
      required: [true, 'Please specify a category.'],
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Ratings average can not be less than 1.'],
      max: [5, 'Ratings average can not be more than 5.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

menuSchema.pre('save', function (next) {
  this.slug = slugify(this.name.toLowerCase());
  next();
});

const Menu = mongoose.model('Menu', menuSchema);

export default Menu;
