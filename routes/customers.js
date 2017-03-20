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
function getCustomers(req, res) {
  Customer.find(function (err, customers) {
    if (err) return res.send(err);
    res.json(customers);
  });
}

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
*/
function postCustomer(req, res) {
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
        Article.upsertArticle(purchase.articles, function (result) {
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
      if (err) return res.send(err);
      customer.purchases = resultingPurchases;

      if (response.result) {
        //customer exists
        Customer.findByIdAndUpdate({_id: response.item._id}, customer, function (err, updateResponse) {
          if (err) return res.send(err);
          res.json(updateResponse._id);
        });
      } else {
        //customer doesn't exist
        Customer.create(customer, function (err, createResponse) {
          if (err) return res.send(err);
          res.json(createResponse._id);
        });
      }
    });
  });
}

/* GET /customers/:customerId listing. */
/*
Description: Call that returns a single customer based on the given customerId url parameter. The call returns the full customer object with the purchases and the bought articles.
*/
function getCustomer (req, res) {
  Customer.findById(req.params.customerId, function (err, customer){
    if (err) return res.send(err);

    getAllPurchases(customer.purchases, function (purchases) {
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
}

/* PUT /customers/:customerId listing. */
/*
Description: If the user wants to update the customer this endpoint will be called => HE CAN'T UPDATE THE ARTICLES!!!

TODO: Update the purchases with their articles.
    : => Articles where added to the purchases => create the articles
      => Articles where left out of the purchases => delete the article from the purchase but not the article itself
      => Articles can be updated in the purchase => create a new article and update the articleId
      => Purchase info per article is updated => Update the info
      => Purchase was added to the customer (most common use case) => add the articles and store the purchase
      => Purchase was deleted from the customer => Delete the purchase
      => Purchase information was updated (e.g. the purchaseDate) => update the information
*/
function updateCustomer(req, res) {
  //TODO: refacter => findByIdAndUpdate http://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
  Customer.findById(req.params.customerId, function (err, customer) {
    if (err) return res.send(err);


  });
}

/* DELETE /customers/:customerId listing. */
/*
Description: Deletes a single customerId. It doesn't delete the articles that the customer bought. This way other customers can buy the articles that this customer bought witouth adding them.
*/
function deleteCustomer (req, res) {
  Customer.findByIdAndRemove(req.params.customerId, function (err, customer) {
    if (err) return res.send(err);
    res.json({message: 'The customer is successfully deleted!'});
  });
}

/* GET /customers/:customerId/purchases */
function getPurchases(req, res) {
  //TODO
}

/* POST /customer/:customerId/purchases */
/*
UPDATES THE LIST OF PURCHASES FOR A CUSTOMER
*/
function postPurchase(req, res) {
  Customer.findById(req.params.customerId, function (err, customer) {
    const purchases = req.body;

    //COPY FROM THE POST METHOD
    let allPurchases = null;
    if (purchases && purchases.length > 0) {
      allPurchases = purchases.map((purchase) => {
        let promises = null;
        if(purchase && purchase.articles && purchase.articles.length > 0) {
          Article.upsertArticle(purchase.articles, function (result) {
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
      allPurchases.map((purchase) => {
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
        if (err) return res.send(err);
        customer.purchases = resultingPurchases;

        if (response.result) {
          //customer exists
          Customer.findByIdAndUpdate({_id: response.item._id}, customer, function (err, updateResponse) {
            if (err) return res.send(err);
            res.json(updateResponse._id);
          });
        } else {
          //customer doesn't exist
          Customer.create(customer, function (err, createResponse) {
            if (err) return res.send(err);
            res.json(createResponse._id);
          });
        }
      });
    });
  });
}

/* PUT /customer/:customerId/purchases */
/*
INPUT: One purchase
OUTPUT:
*/
function updatePurchase(req, res) {
  //TODO
  const bodyPurchase = req.body;

  Customer.findById(req.params.customerId, function (err, customer) {
    const dbPurchases = customer.purchases;
    const dbPurchase = dbPurchases.find((purchase) => {return purchase.purchaseDate === bodyPurchase.purchaseDate;});

    if (typeof dbPurchase !== "undefined") {
      //purchase exists
      //upsert the articles;
    } else {
      //purchase doesn't exist
      //upsert the articles;
    }
  });
}

/* DELETE /customer/:customerId/purchases */
function deletePurchase (req, res) {
  //TODO
}

const getAllPurchases = function (purchases, callback) {
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

module.exports = {getCustomers, getCustomer, getPurchases, postCustomer, postPurchase, updateCustomer, updatePurchase, deletePurchase, deleteCustomer};
