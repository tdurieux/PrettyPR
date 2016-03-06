angular.module('prettyPr').directive('results', function() {
  return {
    restrict: 'E',
    templateUrl: 'client/results/results.html',
    controllerAs: 'results',
    controller: function($scope, $reactive) {
      $reactive(this).attach($scope);


    }
  }
});
