import { readFileSync } from 'fs';
import { connect } from 'mongoose';
import { config } from 'dotenv';

import Menu from '../../src/models/menuModel.js';
import User from '../../src/models/userModel.js';
import Rating from '../../src/models/ratingModel.js';

config({ path: `./config.env` });

const DB = process.env.DATABASE_URI.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

connect(DB, {
  useNewUrlParser: true,
})
  .then(() => console.log('Connected to DB!'))
  .catch((err) => console.log(err.message));

const importDataToDB = async () => {
  try {
    const menuData = JSON.parse(
      readFileSync('./dev-data/data/menu.json', {
        encoding: 'utf-8',
      })
    );

    const userData = JSON.parse(
      readFileSync('./dev-data/data/user.json', {
        encoding: 'utf-8',
      })
    );

    const menu = await Menu.create(menuData);
    const user = await User.create(userData, { validateBeforeSave: false });

    if (menu) console.log('Menu data imported successfully!');
    if (user) console.log('User data imported successfully!');
  } catch (err) {
    console.log(err.message, err);
  }
  process.exit();
};

const deleteDataFromDB = async () => {
  try {
    await Menu.deleteMany();
    await User.deleteMany();
    await Rating.deleteMany();

    console.log('Menu data deleted successfully!');
    console.log('User data deleted successfully!');
    console.log('Rating data deleted successfully!');
  } catch (err) {
    console.log(err.message, err);
  }
  process.exit();
};

const importRating = async () => {
  try {
    const ratingData = JSON.parse(
      readFileSync('./dev-data/data/rating.json', {
        encoding: 'utf-8',
      })
    );
    const rating = await Rating.create(ratingData);
    if (rating) console.log('Rating data imported successfully!');
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') importDataToDB();
if (process.argv[2] === '--delete') deleteDataFromDB();
if (process.argv[2] === '--importRating') importRating();
