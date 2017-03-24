process.env.NODE_ENV = "test";

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../app');
let expect = chai.expect;
let sinon = require('sinon');
let should = chai.should();

require('sinon-mongoose');

var articleFactory = require('../Factory/ArticleFactory/articleFactory');
var Article = require('../../models/Article');

chai.use(chaiHttp);
//parent
describe('Article', () => {
  beforeEach((done) => {
    Article.remove({}, (err) => {
      done();
    });
  });

  describe('Article model', function() {
    it('should be invalid if name is empty', function (done) {
      var a = new Article();
      a.price = 0;

      a.validate((err) => {
        expect(err.errors.name).to.exist;
        done();
      });
    });

    it('should be invalid if price is emtpy', (done) => {
      var a = new Article();
      a.name = "Test Article";

      a.validate((err) => {
        expect(err.errors.price).to.exist;
        done();
      });
    });

    it('should be valid if price and name is filled in', (done) => {
      var a = new Article();
      a.name = "Test article";
      a.price = 0;

      a.validate((err) => {
        expect(err).to.not.exist;
        done();
      });
    });


  });

  describe('GET /articles', function () {
    it('should return all the articles', function(done) {
      chai.request(server)
        .get('/articles')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
        });
    });
  })


})
