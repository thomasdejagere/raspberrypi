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

ArticleSchema.statics.upsertArticle = function(articles, callback) {
  let articleIds = [];

  let promises = articles.map((article) => {
    return this.findOrCreate(article);
  });

  callback(promises);
}

ArticleSchema.statics.findOrCreate = function findOrCreate(query, data, options) {
    return new Promise((resolve, reject) => {

      const Collection = this;
      let _id = null;

      // If create option is not defined, set default value to true.
      if (options && typeof options.create === 'undefined') options.create = true;

      /**
       * Rather than returning error if only two arguments are passed, we'll check here
       * if the second argument is an 'options' object and not a 'data' object.
       * In this case, options will be initialized to data. And data will be an empty object.
       */
      if (data && (typeof data.upsert !== 'undefined' || typeof data.create !== 'undefined')) {
        options = data;
        data = {};
      }

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

      // Find document
      this.findOne({_id: query})
        .then(result => {
          // If document exist
          if (result) {
            if (options && options.upsert) {
              /**
               * Update document
               * Find the new document
               * Return new document
               */
              _id = result._id;
              return Collection.update(query, data);
            }
            // Return document
            resolve({ result, extraInfo, created: false });

            return null;
          } else {
            // Create document
            resolve(
              Collection.create(data ? Object.assign({}, query, data) : query)
              .then(doc => ({ result: doc, extraInfo, created: true }))
              .catch(err => (err))
            );
          }
          return null;
        })
        .then(() => Collection.findOne({ _id }))
        .then(result => resolve({ result, extraInfo, created: false }))
        .catch(reject);
    });
  };

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
