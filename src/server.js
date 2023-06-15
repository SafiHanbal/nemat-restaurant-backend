import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config({ path: 'config.env' });

const db = process.env.DATABASE_URI.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(db)
  .then(() => console.log('Connected to database.'))
  .catch((err) => console.error(err));

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App running at port: ${port}`);
});
