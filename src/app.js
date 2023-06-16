import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';

import menuRouter from './routes/menuRoute.js';
import userRouter from './routes/userRoute.js';
import orderRouter from './routes/orderRoute.js';
import ratingRouter from './routes/ratingRoute.js';
import globalErrorHandler from './controllers/errorController.js';

const app = express();

app.use(express.json());
app.use(express.static('./public'));
app.use(cors());
app.use(compression());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({ whitelist: ['ratingsAverage', 'ratingsCount', 'price', 'category'] })
);

const limiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: 'Too namy request from this IP, please try again in an hour.',
});

app.use('/api', limiter);
app.use('/api/v1/menu', menuRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/order', orderRouter);
app.use('/api/v1/rating', ratingRouter);

app.use('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `${req.originalUrl} route is not defined.`,
  });
});

app.use(globalErrorHandler);

export default app;
