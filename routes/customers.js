var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Customer = require('../models/Customer.js');
var Article = require('../models/Article.js');
var validator = require('validator');
var Promise = require('bluebird');
var util = require('util');

/* GET /customers listing. */
router.get('/', function(req, res, next) {
  Customer.find(function (err, articles) {
    if (err) return next(err);
    res.json(articles);
  });
});

/* POST /customers listing. */
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

      } else {
        //customer doesn't exist
        Customer.create(customer, function (err, response) {
          if (err) return next(err);
          res.json(response);
        })
      }
    });
  });
});

/* GET /customers/:customerId listing. */
router.get('/:customerId', function (req, res, next) {
  Customer.findById(req.params.customerId, function (err, customer){
    if (err) return next(err);
    res.json(customer);
  });
});

/* PUT /customers/:customerId listing. */
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
router.delete('/:customerId', function (req, res, next) {
  Customer.findByIdAndRemove(req.params.customerId, function (err, customer) {
    if (err) return next(err);
    res.json({message: 'The customer is successfully deleted!'});
  });
});

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
