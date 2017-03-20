var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config');

let articles = require('./routes/articles');
let authenticator = require('./routes/authenticate');
let users = require('./routes/users');
let customers = require('./routes/customers');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/crm-pwnc')
	.then(() => console.log('connection to mongodb is succesful'))
	.catch((err) => console.log(err));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('superSecret', config.secret);
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => res.json({message: "Welcome to our PWNC CRM system!"}));

app.route('/articles')
	.get(articles.getArticles)
	.post(articles.postArticle);
app.route('/articles/:articleId')
	.put(articles.updateArticle)
	.delete(articles.deleteArticle);

app.route('/customers')
	.get(customers.getCustomers)
	.post(customers.postCustomer);
app.route('/customers/:customerId')
	.get(customers.getCustomer)
	.put(customers.updateCustomer)
	.delete(customers.deleteCustomer);
app.route('/customers/:customerId/purchases')
	.get(customers.getPurchases)
	.put(customers.updatePurchase)
	.delete(customers.deletePurchase);

app.route('/autenticate')
	.post(authenticator.authenticate);

app.route('/users')
	.get(users.getUsers)
	.post(users.postUser);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
