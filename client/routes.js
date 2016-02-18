angular.module('prettyPr').config(function ($urlRouterProvider, $stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $stateProvider
    .state('dropfile', {
      url: '/dropfile',
      template: '<dropfile></dropfile>'
    });
  $urlRouterProvider.otherwise("/dropfile");
});
