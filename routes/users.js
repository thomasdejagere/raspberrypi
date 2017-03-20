var mongoose = require('mongoose');
var User = require('../models/User.js');


/* GET /users listing. */
function getUsers(req, res) {
  User.find(function (err, users) {
    if (err) return res.send(err);
    res.json(users);
  });
}

/* POST /users listing. */
function postUser(req, res) {
  User.create(req.body, function (err, user) {
    if (err) return res.send(err);
    res.json(user);
  });
}

module.exports = {getUsers, postUser};
