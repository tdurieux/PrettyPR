GithubPr = new Mongo.Collection("GithubPr");


if (Meteor.isServer) {

  GithubPr.allow({
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


  Meteor.publish('GithubPr', function() {
    return GithubPr.find({});
  });

}
