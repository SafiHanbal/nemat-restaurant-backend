import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please login to order.'],
    },
    menuItems: [
      {
        menuItem: {
          type: mongoose.Types.ObjectId,
          ref: 'Menu',
          required: [true, 'Please provide a menu Item.'],
        },
        quantity: {
          type: Number,
          required: [true, 'Please provide quantity.'],
        },
      },
    ],
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi'],
      required: [true, 'Please select a payment method.'],
    },
    deliveryOption: {
      type: String,
      enum: ['home-delivery', 'pick-up'],
      required: [true, 'Please select a delivery type.'],
    },
    orderedAt: {
      type: Date,
      default: new Date(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
