var mongoose = require('mongoose');
var Promise = require('bluebird');

const defaultArticleAttributes = ["name", "price", "ref", "description"]

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

ArticleSchema.statics.upsertArticle = function(articles) {

  return new Promise((resolve, reject) => {
    let articleIds = [];


    let input = [];
    Array.isArray(articles) ? input = articles : input.push(articles);

    let promises = input.map((article) => {
      return new Promise((resolve, reject) => {
        query = article;

        let extraInfo = Object.keys(query).reduce(
          (result, key) => {
            result = typeof result === "undefined" ? {} : result;
            switch (key) {
              case "name": break;
              case "price": break;
              case "ref": break;
              case "description": break;
              default:
                result[key] = query[key];
                return result;
            }
          }, {}
        )

        this.findOneAndUpdate({'name': query.name}, query, {upsert: true, new: true}, (err, doc) => {
            resolve({'result': doc, 'extraInfo': extraInfo});
        });
      });
    });

    resolve(promises);
  });
}

ArticleSchema.statics.getArticlesFromIds = function(articles, callback) {
  let result = [];

  let ids = articles.map((article) => {
    return mongoose.Types.ObjectId(article._id);
  });

  return this.find({
    '_id': { $in: ids}}
  ).exec();
}

module.exports = mongoose.model('Article', ArticleSchema);
