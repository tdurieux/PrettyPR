GithubUser = new Mongo.Collection("GithubUser");


if (Meteor.isServer) {

  GithubUser.allow({
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

  Meteor.publish('GithubUser', function() {
    return GithubUser.find({});
  });

}
