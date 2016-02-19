angular.module('prettyPr').directive('github', function() {
  return {
    restrict: 'E',
    templateUrl: 'client/github/github.html',
    controllerAs: 'github',
    controller: function($scope, $reactive) {
      $reactive(this).attach($scope);

    }
  }
});
