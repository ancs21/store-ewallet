const mongoose = require('mongoose');

const Account = require('../models/account');
const Order = require('../models/order');
const Product = require('../models/product');

exports.get_info_account = (req, res, next) => {
  // console.log(req.user_data.userId);
  Account.findOne({ accountId: req.user_data.userId })
    .populate('accountId')
    .exec()
    .then(doc => {
      console.log(doc);
      return res.status(200).json(doc);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.deposit_account = (req, res, next) => {
  const deposit = {
    createAt: new Date(),
    numberDeposit: req.body.balance
  };
  Account.findOne({ accountId: req.user_data.userId }, 'balanced')
    .exec()
    .then(doc => {
      Account.update(
        { accountId: req.user_data.userId },
        {
          $push: {
            historyDeposit: deposit
          },
          $set: {
            balanced: doc.balanced + parseInt(deposit.numberDeposit)
          }
        }
      )
        .exec()
        .then(doc => {
          // console.log(doc);
          return res.status(200).json({
            message: 'Deposit Ok'
          });
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            error: err
          });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.order_payment = (req, res, next) => {
  // find order id
  Order.findOne({
    ownerUid: req.user_data.userId,
    _id: req.body._id
  })
    .populate('products.product', 'price quatity')
    .exec()
    .then(order => {
      Account.findOne({ accountId: req.user_data.userId })
        .select('balanced historyOrder')
        .exec()
        .then(account => {
          // console.log(order.product.price);
          // console.log(account.balanced);
          const getPriceOrder = order.products.reduce(
            (p, c) => p + c.product.price * c.quatityBuy, 0
          );
          const history_product = {
            createAt: new Date(),
            paid: getPriceOrder
          };
          // // console.log(history_product);
          // // check balance
          const balanced_account = account.balanced;
          // change status order
          Order.update(
            {
              _id: order._id
            },
            {
              $set: {
                status: 'paid'
              }
            }
          )
            .exec()
            .then(doc => {
              return res.status(200).json({
                message: 'Payment Success'
              });
            })
            .catch(err => {
              console.log(err);
              res.status(500).json({
                error: err
              });
            });
          // push deposit history
          const downBalanced = balanced_account - getPriceOrder;
          Account.update(
            { accountId: req.user_data.userId },
            {
              $push: {
                historyOrder: history_product
              },
              $set: {
                balanced: downBalanced
              }
            }
          ).exec()
          // update quatity product
          order.products.map((v, i) => {
            Product.findByIdAndUpdate(v.product._id, {
              $set: {
                quatity: v.product.quatity - v.quatityBuy
              }
            }).exec();
          });
        })
        .catch(err => {
          res.status(500).json({ error: err });
        });
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
};
