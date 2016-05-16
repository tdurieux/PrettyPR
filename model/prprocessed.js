export const PrProcessed = new Mongo.Collection("prprocessed");


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


  Meteor.publish('prprocessed', function() {
    return PrProcessed.find({});
  });

}
