require('dotenv').config()
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routers/products');
const userRoutes = require('./api/routers/user');
const accountRoutes = require('./api/routers/account');
const orderRoutes = require('./api/routers/orders');
const paymentRoutes = require('./api/routers/payment');

mongoose.connect(
  process.env.MONGODB
);

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit:'50mb'
  })
);
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

app.use('/products', productRoutes);
app.use('/user', userRoutes);
app.use('/account', accountRoutes);
app.use('/orders', orderRoutes);
app.use('/payment', paymentRoutes);

app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
