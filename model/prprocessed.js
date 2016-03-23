PrProcessed = new Mongo.Collection("prprocessed");


if (Meteor.isServer) {

  PrProcessed.allow({
    insert: function () {
      return true;
    },
    remove: function () {
      return true;
    },
    update: function () {
      return true;
    }
  });


  Meteor.publish('PrProcessed', function() {
    return PrProcessed.find({});
  });

}
