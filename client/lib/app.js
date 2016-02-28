angular.module('prettyPr', [
  'angular-meteor',
  'ui.router',
  'ngMaterial',
  'ngFileUpload',
  'ui.bootstrap',
  'ngAnimate',
  'accounts.ui'
]);

bertError = function bertError(message){
  Bert.alert({
    title: "Erreur",
    message: message,
    type: 'danger',
    style: 'growl-top-right',
    icon: 'fa-times'
  });
};


bertInfo = function bertInfo(message){
  Bert.alert({
    title: 'Info',
    message: message,
    type: 'info',
    style: 'growl-top-right',
    icon: 'fa-check-circle'
  });
};
