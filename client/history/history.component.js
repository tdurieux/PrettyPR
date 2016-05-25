angular.module('prettyPr').directive('history', function() {
  return {
    restrict: 'E',
    templateUrl: 'client/history/history.html',
    controllerAs: 'history',
    controller: function($scope, $reactive, $location, sharedProperties) {
      $reactive(this).attach($scope);

      //Subscribe to differents sources to access data
      this.subscribe('users');
      this.subscribe('prprocessed');

      this.showPr = (url) => {
        if(!url){
          bertError("Url non valide");
          return;
        }
        var result = PrProcessed.findOne({url:url});
        if(!result){
          bertError("Aucune Pull Request trouvée avec cette url");
          return;
        }
        //Changement de page en stockant les résultats
        sharedProperties.setChangement(result.result);
        $location.path("/results");
      }

      Tracker.autorun(function() {
        if (Meteor.user() != undefined && Meteor.user().services != undefined && $location.path() == "/history" ) {
            this.helpers({
              pullRequests() {
                return PrProcessed.find({user:Meteor.user().services.github.username});
              }
            });
        }
      }.bind(this)); //Fin autorun

    }
  }
});
