angular.module('prettyPr').config(function ($urlRouterProvider, $stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $stateProvider
    .state('dropfile', {
      url: '/dropfile',
      template: '<dropfile></dropfile>'
    })
    .state('github', {
      url: '/github',
      template: '<github></github>'
    });

  $urlRouterProvider.otherwise("/dropfile");
});
