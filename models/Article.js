var mongoose = require('mongoose');
var Promise = require('bluebird');
var findOrCreate = require('findorcreate-promise');

var ArticleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  ref: String,
  description: String
});

ArticleSchema.plugin(findOrCreate);

ArticleSchema.statics.addNewArticlesAndReturnIds = function(articles, callback) {
  let articleIds = [];

  var promises = articles.map((article) => {
    return this.findOrCreate(article);
  });

  callback(promises);
}

module.exports = mongoose.model('Article', ArticleSchema);
