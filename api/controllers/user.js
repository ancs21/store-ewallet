const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// schema
const User = require('../models/user');
const Account = require('../models/account');

// no check auth
exports.user_signup = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: 'Mail exists'
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              name: req.body.name,
              email: req.body.email,
              password: hash
            });
            const account = new Account({
              accountId: user._id,
              balanced: 0,
              historyDeposit: [],
              historyOrder: []
            });
            account.save();
            user
              .save()
              .then(user => {
                const token = jwt.sign(
                  {
                    email: user.email,
                    userId: user._id
                  },
                  'serect'
                );
                return res.status(200).json({
                  message: 'Auth successful',
                  token: token
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.user_login = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: 'Auth failed'
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: 'Auth failed'
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id
            },
            'serect'
          );
          return res.status(200).json({
            message: 'Auth successful',
            token: token
          });
        }
        res.status(401).json({
          message: 'Auth failed'
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

// user auth
exports.user_update = (req, res, next) => {
  User.update(
    { _id: req.user_data.userId },
    {
      $set: {
        address: req.body.address,
        name: req.body.name,
        phone: req.body.phone
      }
    }
  )
    .then(result => {
      res.status(200).json({
        message: 'User updated!'
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
exports.get_all_users = (req, res, next) => {
  User.find({})
    .select('_id name avatar')
    .exec()
    .then(doc => res.status(200).json(doc))
    .catch(err => {
      // console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.user_delete = (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'User deleted'
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};
