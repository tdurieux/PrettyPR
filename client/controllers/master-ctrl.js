/**
 * Master Controller
 */

angular.module('prettyPr')
    .controller('MasterCtrl', ['$scope', MasterCtrl]);

function MasterCtrl($scope, $cookieStore) {
    /**
     * Sidebar Toggle
     */
    var mobileView = 992;

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
