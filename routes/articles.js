var mongoose = require('mongoose');
var Article = require('../models/Article.js');
var validator = require('validator');

/* GET /articles listing. */
function getArticles(req, res) {
  Article.find(function (err, articles) {
    if (err) return res.send(err);
    res.json(articles);
  });
}

/* POST /articles listing. */
function postArticle(req, res) {
  Article.create(req.body, function (err, article) {
    if (err) return res.send(err);
    res.json(article);
  });
}

/* PUT /articles/:articleId listing. */
function updateArticle(req, res) {
  Article.findById(req.params.articleId, function (err, article) {
    if (err) return res.send(err);

    article.name = req.body.name;
    article.description = req.body.description;
    article.price = req.body.price;
    article.ref = req.body.ref;

    article.save (function (err) {
      if (err) return next(err);
      res.json({message: 'The article is successfully updated!'});
    });
  });
}

/* DELETE /articles/:articleId listing. */
function deleteArticle(req, res) {
  Article.findByIdAndRemove(req.params.articleId, function (err, article) {
    if (err) return res.send(err);
    res.json({message: 'The article is successfully deleted!'});
  });
}

module.exports = {getArticles, postArticle, updateArticle, deleteArticle};
