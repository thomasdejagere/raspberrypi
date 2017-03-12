var mongoose = require('mongoose');

var CustomerSchema = new mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: false},
  address: {type: String, required: false},
  postcode: {type: Number, required: false},
  email: {type: String, required: true},
  createdOn: { type: Date, default: Date.now },
  extraInfo: [{ key: String, value: String }],
  purchases: [{
    purchaseDate: { type: Date, default: Date.now },
    articles: []
  }]
});
//articles: [{ type: mongoose.Schema.ObjectId, ref: 'Article' }]

CustomerSchema.statics.doesCustomerExist = function(firstName, lastName, email, callback) {
  this.find({firstName, lastName, email}, function (err, customers) {
    let customer = {};
    if (typeof customers === "undefined") {
      customer.result = false;
      callback (err, customer);
    } else {
      if (customers.length === 1) {
        //customer exists
        customer.item = customers[0];
        customer.result = true;
        callback (err, customer);
      } else if (customers.length === 0){
        //customer doesn't exist
        customer.result = false;
        callback (err, customer);
      } else {
        //something went horribly wrong: there are customers with the same firstName, lastName and email!
      }
    }
  });
}

//Important that the ref: 'Article' has the same name of the Schema.

/*
With the mixed objec type, mongoose can't tell if the value is changed. So call the .markModified(path) to tell mongoose that this just changed
This is the same with a date
person.anything = { x: [3, 4, { y: "changed" }] };
person.markModified('anything');
person.save(); // anything will now get saved
*/

module.exports = mongoose.model('Customer', CustomerSchema);


//TODO check if we can add static methods to the schema

/*
animalSchema.statics.findByName = function(name, cb) {
  return this.find({ name: new RegExp(name, 'i') }, cb);
};

var Animal = mongoose.model('Animal', animalSchema);
Animal.findByName('fido', function(err, animals) {
  console.log(animals);
});*/
