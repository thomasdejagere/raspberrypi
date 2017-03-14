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
Description: TODO
To consider:
  - What do we return from this method? Now: we return the Id of the new customer
TODO:
  - Input validation
  - Required field validation
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
      const articleIds = purchase.map((article) => {
        return article.result._id;
      });

      return {
          articles: articleIds
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
  //TODO: Return the articles, not the id's
  Customer.findById(req.params.customerId, function (err, customer){
    if (err) return next(err);
    getPurchases(customer.purchases, function (purchases) {
      customer.purchases = purchases;
      res.json(customer);
    });
  });
});

/* PUT /customers/:customerId listing. */
/*
Description: TODO
TODO: Update the purchases with their articles.
*/
router.put('/:customerId', function (req, res, next) {
  //TODO: refacter => findByIdAndUpdate http://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
  Customer.findById(req.params.customerId, function (err, customer) {
    if (err) return next(err);

    updateCustomer(customer, req.body, function (err, response) {
      if (err) return next(err);
      res.json(response);
    })
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

/*
Description: TODO
*/
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


const updateCustomer = function (customer, body, callback) {
  customer.firstName = req.body.firstName;
  customer.lastName = req.body.lastName;
  customer.address = req.body.address;
  customer.postcode = req.body.postcode;
  customer.email = req.body.email;
  customer.createdOn = req.body.email;
  customer.extraInfo = req.body.extraInfo;
  customer.purchases = req.body.purchases;

  customer.save(function (err) {
    callback(err, {message: 'The customer was succesfully updated'})
  });
}

module.exports = router;
