var express = require('express');
var router = express.Router();
var User = require('../models/User.js');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config');
var mongoose = require('mongoose');

router.post('/', function (req, res, next) {
  User.findOne({
    name: req.body.name
  }, function (err, user) {
    if (err) return next(err);

    if (!user) {
      //user doesn't exist
      res.json({success: false, message: 'Authentication failed. User not found.'});
    } else if (user) {
      //check if the password matches
      if (user.password != req.body.password) {
        res.json({success: false, message: 'Authentication failed. Wrong password.'});
      } else {
        //user is found and password is correct
        //create a token
        var token = jwt.sign(user , config.secret, {
          expiresInMinutes: 1440
        });

        //return the information
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }
    }
  });
});

module.exports = router;
