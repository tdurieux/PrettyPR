/**
 * Master Controller
 */

angular.module('prettyPr')
    .controller('MasterCtrl', ['$scope', '$location', MasterCtrl]);

function MasterCtrl($scope, $location) {
    /**
     * Sidebar Toggle
     */
    var mobileView = 992;

    $scope.currentPage = function(){
      var path = $location.path().substring(1);
      path = path.charAt(0).toUpperCase() + path.slice(1);
      return path;
    }

    $scope.descriptionCurrent = function(){
        switch ($location.path()) {
          case "/dropfile":
            return "Uploadez 2 fichiers et comparer les de manière sémantique";
          case "/github":
            return "Connectez vous à Github pour comparer des pullRequests";
          default:
            return "";
        }
    }

    $scope.getClass = function (path) {
      if ($location.path().substr(0, path.length) === path) {
        return 'active-menu';
      } else {
        return '';
      }
    }

    $scope.getWidth = function() {
        return window.innerWidth;
    };

    $scope.toggleSidebar = function() {
        $scope.toggle = !$scope.toggle;
    };

    window.onresize = function() {
        $scope.$apply();
    };
}
