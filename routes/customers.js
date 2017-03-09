var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Customer = require('../models/Customer.js');
var Article = require('../models/Article.js');
var validator = require('validator');

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

  console.log("customer");
  console.log(customer);
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
  let purchases = [];
  if (customer.purchases && customer.purchases.length > 0) {
    customer.purchases.forEach((purchase) => {
      if(purchase && purchase.articles && purchase.articles.length > 0) {
        Article.addNewArticlesAndReturnIds(purchase.articles, function (err, articleIds) {
            //callback
        });
      }
    });
  }
  /*
  console.log("purchases");
  console.log(purchases);
  //UPDATE customer purchases
  customer.purchases = purchases;

  //controleren of er al een customer bestaat met dezelfde firstName + lastName + email
  Customer.doesCustomerExist(customer.firstName, customer.lastName, customer.email, function (err, customer) {
    if (err) return next(err);
    if (customer.result) {
      //customer exists
      customer.save(function (err) {
        if (err) next (err);
        res.json({message: 'The customer was succesfully updated'});
      });
    } else {
      //customer doesn't exist
      //update the created on
      customer.createdOn = Date.now();
      Customer.create(customer, function (err, response) {
        if (err) return next(err);
        res.json(response);
      })
    }
  });
  */
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
