const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

// user auth
exports.get_order = (req, res, next) => {
  Order.findById(req.params.idOrder)
    .exec()
    .then(doc => res.status(200).json(doc))
    .catch(err => res.status(500).json({ error: err }));
};

exports.create_order = (req, res, next) => {
  Product.findById(req.body.productId)
    .exec()
    .then(product => {
      if (!product) {
        res.status(404).json({
          message: 'Product not found'
        });
      }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        ownerUid: req.user_data.userId,
        product: req.body.productId,
        quatityBuy: req.body.quatityBuy
      });
      return order.save().then(result => {
        // console.log(result);
        res.status(201).json({
          message: 'Order stored',
          createdOrder: {
            _id: result._id,
            ownerUid: result.ownerUid,
            product: result.product,
            quatityBuy: result.quantity
          }
        });
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
};

exports.update_order = (req, res, next) => {
  Order.update(
    { _id: req.params.idOrder },
    {
      $set: {
        status: req.body.status
      }
    }
  ).then(result => {
    res.status(200).json({
      message: 'Product update'
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
};

// admin auth
exports.get_all_orders = (req, res, next) => {
  Order.find({})
    .exec()
    .then(doc => res.status(200).json(doc))
    .catch(err => res.status(500).json({ error: err }));
};

exports.delete_order = (req, res, next) => {
  Order.remove({ _id: req.params.idOrder })
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Order deleted'
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};
