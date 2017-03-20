var User = require('../models/User.js');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config');
var mongoose = require('mongoose');

function authenticate (req, res) {
  User.findOne({
    name: req.body.name
  }, function (err, user) {
    if (err) return res.send(err);

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
        var token = jwt.sign(user, config.secret, {
          expiresIn: 1440 // expires in 24 hours
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
}

module.exports = {authenticate};
