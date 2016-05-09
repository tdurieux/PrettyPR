describe('Collections tests', function () {

  var server = meteor();
  var db = mongo({});

  describe('Simple database methods', function () {

    var collection = db.collection('test_collection');

    it('should be able to insert a document on dynamic collection', function () {
      return collection
      .insert({ x: 1 })
      .findOne({ x: 1 })
      .then(function (data) {
        expect(data).to.have.property('x', 1);
      });
    });

    it('should be able to remove a document on dynamic collection', function () {
      return collection
        .remove({ x: 3 })
        .findOne({ x: 3 })
        .then(function (data) {
          expect(data).to.be.null;
        });
    });

    it('should be able to insert on own collection', function () {
      return server.execute(function () {
        return GithubRepos
        .insert({ x: 1 });
      });
    });

    it('should be able to remove on own collection', function () {
      return server.execute(function () {
        return GithubRepos
        .remove({ x: 1 });
      });
    });



  });

  describe('Using cursor.', function () {

    var collection = db.collection('cursor_test');

    before(function () {
      return collection.insert([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (value) {
        return { x: value };
      }));
    });

    it('should be able to iterate over all documents', function () {
      var counter = 0;
      return collection.find()
        .each(function (data) {
          counter += data.x;
        }).then(function () {
          expect(counter).to.equal(45);
        });
    });

    it('should be able to access all data at once', function () {
      return collection.find({}).toArray().then(function (listOfItems) {
        expect(listOfItems.reduce(function (sum, data) { return sum + data.x; }, 0)).to.equal(45);
      });
    });

  });


});
