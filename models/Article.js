var mongoose = require('mongoose');

var ArticleSchema = new mongoose.Schema({
  name: String,
  price: Number,
  ref: String,
  description: String
});

ArticleSchema.statics.addNewArticlesAndReturnIds = function(articles, callback) {
  let articleIds = [];
  articles.forEach((article) => {
    var newArticles = [];
    this.create(article, function (err, article) {
      if (err) return next(err);
      console.log("Created an article with name " + article.name);
    });
    /*this.findOne({name: article.name, ref: article.ref, price: article.price}, function (err, result) {
      if (result !== null) {
        console.log("found one!");
        console.log(result._id);
        articleIds.push(result._id);
      }
    });*/
  });
}

module.exports = mongoose.model('Article', ArticleSchema);
