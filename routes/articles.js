var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Article = require('../models/Article.js');
var validator = require('validator');

/* GET /articles listing. */
router.get('/', function(req, res, next) {
  Article.find(function (err, articles) {
    if (err) return next(err);
    res.json(articles);
  });
});

/* POST /articles listing. */
router.post('/', function(req, res, next) {
  Article.create(req.body, function (err, article) {
    if (err) return next(err);
    res.json(article);
  });
});

/* PUT /articles/:articleId listing. */
router.put('/:articleId', function(req, res, next) {
  Article.findById(req.params.articleId, function (err, article) {
    if (err) return next(err);

    article.name = req.body.name;
    article.description = req.body.description;
    article.price = req.body.price;
    article.ref = req.body.ref;

    article.save (function (err) {
      if (err) return next(err);
      res.json({message: 'The article is successfully updated!'});
    });
  });
});

/* DELETE /articles/:articleId listing. */
router.delete('/:articleId', function (req, res, next) {
  Article.findByIdAndRemove(req.params.articleId, function (err, article) {
    if (err) return next(err);
    res.json({message: 'The article is successfully deleted!'});
  });
});

module.exports = router;
