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
  Article.upsertArticle(req.body)
    .then((result) => {
      Promise.all(result)
        .then((result2) => {
          res.json(result2);
        })
    })

}

/* PUT /articles/:articleId listing. */
function updateArticle(req, res) {
  Article.upsertArticle(req.body)
    .then((result) => {
      Promise.all(result)
        .then((result2) => {
          res.json(result2);
        })
    })
}

/* DELETE /articles/:articleId listing. */
function deleteArticle(req, res) {
  Article.remove({_id: req.params.id}, (err, result) => {
    if (err) return res.send(err);
    res.json({message: 'Article successfully deleted!', result});
  });
}

module.exports = {getArticles, postArticle, updateArticle, deleteArticle};
