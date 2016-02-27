angular.module('prettyPr').directive('github', function() {
  return {
    restrict: 'E',
    templateUrl: 'client/github/github.html',
    controllerAs: 'github',
    controller: function($scope, $reactive) {
      $reactive(this).attach($scope);

      this.subscribe('users');

      this.repos = [];

      this.helpers({
        showRepos: () => {
          return this.getCollectionReactively('repos').length == 0;
        },
        reposUser: () => {
          return this.getCollectionReactively('repos');
        }
      });

      this.getRepo = () => {
        var userConnected = Meteor.user();
        var githubUsername = userConnected.services.github.username;

        var reposTemp = Meteor.call('getReposFromUser', githubUsername,
          function (error, result) {
            for (var i = 0; i < result.length; i++) {
              this.repos.push(result[i]);
            }
            console.log(this.repos);
        }.bind(this));



      }
    }
  }
});
