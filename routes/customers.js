var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Customer = require('../models/Customer.js');
var Article = require('../models/Article.js');
var validator = require('validator');
var Promise = require('bluebird');
var util = require('util');

/* GET /customers listing. */
/*
Description: Call that returns all the customers with their purchases. The purchases contains the purchaseDate and the bought articles.
TODO: Return the articles, not just the id's
*/
router.get('/', function(req, res, next) {
  Customer.find(function (err, customers) {
    if (err) return next(err);
    res.json(customers);
  });
});

/* POST /customers listing. */
/*
Description: Saves a customer with all its properties
To consider:
  - What do we return from this method? Now: we return the Id of the new customer
  - What to do with discounts or other prices?
  - What to do with multiple articles bought?

TODO:
  - Input validation
  - Required field validation
  - Store articles like this:
  "articles": [
				{
					"ObjectId": qsmldfqslmfdkdlmfjlqsm
					"payedPricePerUnit": 120,
					"amount": 1
				},
				{
					ObjectId": qsmldfqslmfdkdlmfjlqsm,
					"payedPricePerUnit": 200,
					"amount": 1
				},
				{
					ObjectId": qsmldfqslmfdkdlmfjlqsm,
					"payedPricePerUnit": 100,
					"amount": 2
				}
			]
*/
router.post('/', function (req, res, next) {
  let customer = req.body;

  //controleer of de purchase array undefined is. Zoja maken we hier een lege array van.
  if (typeof customer.purchases === "undefined") {
    customer.purchases = [];
  }

  //TODO: check if the required properties are filled in.

  //controleer of de extraInfo objecten in de array de juiste structuur hebben.
  if (customer.extraInfo) {
    let errorInStructure = false;
    customer.extraInfo.forEach((element) => {
      !(element.hasOwnProperty("key") && element.hasOwnProperty("value")) ? errorInStructure = true : null;
    });
  }

  let isValidated = true;

  //controleer of de email een geldig emailadres is
  if (!validator.isEmail(customer.email)) {
    isValidated = false;
  }

  //puchase zal een datum hebben en een array van article objecten, alleen de Id's moeten worden opgeslaan
  //TODO: what to do when there's a discount?
  let purchases = null;
  if (customer.purchases && customer.purchases.length > 0) {
    purchases = customer.purchases.map((purchase) => {
      let promises = null;
      if(purchase && purchase.articles && purchase.articles.length > 0) {
        Article.addNewArticlesAndReturnIds(purchase.articles, function (result) {
            promises = result;
        });
      }

      return {
        promises,
        purchaseDate: purchase.purchaseDate
      }
    });
  }

  let result = [];

  var allPromise = Promise.all(
    purchases.map((purchase) => {
        return Promise.all(purchase.promises);
    })
  );

  allPromise.then(function (purchases) {
    let resultingPurchases = purchases.map((purchase) => {
      const resultingArticles = purchase.map((article) => {
        article.extraInfo._id = article.result._id;
        return article.extraInfo;
      });

      return {
          articles: resultingArticles
      };
    });

    Customer.doesCustomerExist(customer.firstName, customer.lastName, customer.email, function (err, response) {
      if (err) return next(err);
      customer.purchases = resultingPurchases;

      if (response.result) {
        //customer exists
        Customer.findByIdAndUpdate({_id: response.item._id}, customer, function (err, updateResponse) {
          if (err) return next(err);
          res.json(updateResponse._id);
        });
      } else {
        //customer doesn't exist
        Customer.create(customer, function (err, createResponse) {
          if (err) return next(err);
          res.json(createResponse._id);
        });
      }
    });
  });
});

/* GET /customers/:customerId listing. */
/*
Description: Call that returns a single customer based on the given customerId url parameter. The call returns the full customer object with the purchases and the bought articles.
*/
router.get('/:customerId', function (req, res, next) {
  Customer.findById(req.params.customerId, function (err, customer){
    if (err) return next(err);

    getPurchases(customer.purchases, function (purchases) {
      let purchasesWithExtraInfo = [];
      purchases.forEach((purchase) => {
        const purchaseWithExtraInfo = customer.purchases.find((p) => {
          return p.purchaseDate === purchase.purchaseDate;
        });

        let resultingArticles = purchase.articles.map((article) => {
          let articleObj = article.toObject();

          const articleWithExtraInfo = purchaseWithExtraInfo.articles.find((a) => {
            return String(a._id) === String(article._id);
          });

          let result = Object.assign({}, articleWithExtraInfo, articleObj);
          return result;
        });
        purchase.articles = resultingArticles;
        purchasesWithExtraInfo.push(purchase);
      });
      customer.purchases = purchasesWithExtraInfo;
      res.json(customer);
    });
  });
});

/* PUT /customers/:customerId listing. */
/*
Description: TODO
TODO: Update the purchases with their articles.
    : => Articles where added to the purchases => create the articles
      => Articles where left out of the purchases => delete the article from the purchase but not the article itself
      => Articles can be updated in the purchase => create a new article and update the articleId
      => Purchase info per article is updated => Update the info
      => Purchase was added to the customer (most common use case) => add the articles and store the purchase
      => Purchase was deleted from the customer => Delete the purchase
      => Purchase information was updated (e.g. the purchaseDate) => update the information
*/
router.put('/:customerId', function (req, res, next) {
  //TODO: refacter => findByIdAndUpdate http://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
  Customer.findById(req.params.customerId, function (err, customer) {
    if (err) return next(err);
    //get all the purchases that have an id
    //initialize an "resultingPurchases" array
    //loop over the purchases and check if their purchaseDate is updated
        //If so: update the purchaseDate
      //Get all the articles from the dbpurchase
      //make a copy of the articles and store them in the array "oldArticles";
      //loop over the articles
        //do a find function on the oldArticles to check if their are articles who have the same primary keys (name, ref)
          //if an article was found
            //check if the other properties aren't changed from the original
              //add the article to the list "updateArticle"; and delete them from the newArticles array and oldArticles array
            //check if the extrainfo properties aren't changed from the original
              //add the article to the list "updateExtraInfo"; and delete them from the newArticles array and oldArticles array
            //if the normal properties and the extra properties changed add them to the list "updateAll"; and delete them from the newArticles array and oldArticles array

            //if all the properties are the same
              //Remove the articles that are known from the db from the array so that only the new articles are left on the array; and delete them from the newArticles array and oldArticles array
          //if the article wasn't found
            //if there are articles left on the newArticles array, add them to the list "newArticles";
       //if an there are oldArticles still in the array, add them to the "deleteArticleFromPurchase";

      //Result of the article loop are lists of new(newArticles)/updated(updateArticle, updateExtraInfo)/deleted(deleteArticleFromPurchase)/all(updateAll) articles. The articles have the extraInfo and normal properties.
      //declare a variable "resultingArticles"
      //loop over the "newArticles" array
        //do a Article.create and retreive the ObjectId
        //add the ObjectId with the extraInfo properties to an object and add the object to the "resultingArticles" array;
      //loop over the "updateArticle" array
        //do a Article.findByIdAndUpdate, pass the normal properties (not the extra ones) and retreive the ObjectId
        //add the ObjectId with the extraInfo properties to an object and add the object to the "resultingArticles" array;
      //loop over the "updateExtraInfo" array
        //Get the article.ObjectId from the article (is in object, no call needed) and get the extraInfo objects, put them in an object and store the object in the "resultingArticles" array
      //loop over the "updateAll" array
        //do a Article.findByIdAndUpdate, pass the normal properties (not the extra ones) and retreive the ObjectId;
        //Put the ObjectId, with the extraInfo properties, put them in an object and store the object in the "resultingArticles" array;
      //loop over the "deleteArticleFromPurchase" array
        //Do nothing, if you don't add the articles to the "resultingArticles" array they won't be saved onto the updated customer;

      //put the resultingArticles in the articles property of the purchase object;
      //push the updatedPurchase to the resultingPurchases array
    //end loop purchases

    //add the resultingPurchases to the purchases property of the customer
    //perform the customer.findByIdAndUpdate and pass the updated customer object;

  });
});

/* DELETE /customers/:customerId listing. */
/*
Description: Deletes a single customerId. It doesn't delete the articles that the customer bought. This way other customers can buy the articles that this customer bought witouth adding them.
*/
router.delete('/:customerId', function (req, res, next) {
  Customer.findByIdAndRemove(req.params.customerId, function (err, customer) {
    if (err) return next(err);
    res.json({message: 'The customer is successfully deleted!'});
  });
});

const getPurchases = function (purchases, callback) {
  let allArticles = purchases.map((purchase) => {
    return {
      promise: Article.getArticlesFromIds(purchase.articles),
      purchaseDate: purchase.purchaseDate
    }
  });

  //due to the promise.all docs that states that the order of the array won't change we can get the purchaseDate from the length property
  Promise.all(allArticles.map((obj) => { return obj.promise; }))
    .then((result) => {
      const purchases = result.map((articles, index) => {
        return {
          purchaseDate: allArticles[index].purchaseDate,
          articles: articles
        }
      });
      callback(purchases);
    });
}
module.exports = router;
