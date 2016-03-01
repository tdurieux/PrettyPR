angular.module('prettyPr').directive('github', function() {
  return {
    restrict: 'E',
    templateUrl: 'client/github/github.html',
    controllerAs: 'github',
    controller: function($scope, $reactive) {
      $reactive(this).attach($scope);

      this.subscribe('users');

      this.repos = new ReactiveArray();
      this.pullRequests = new ReactiveArray();
      this.otherAccount = null;
      this.userselected = "mine";
      this.reposelected = null;
      this.prselected = null;

      this.helpers({
        showRepos: () => {
          return this.repos.list().length == 0;
        },
        reposUser: () => {
          return this.repos.list();
        },
        showPr: () => {
          return this.pullRequests.list().length == 0;
        },
        pullRequests: () => {
          return this.pullRequests.list();
        }
      });

      this.getRepo = () => {
        var githubUsername = Meteor.user().services.github.username;

        if(!githubUsername)
          bertError("Vous n'êtes pas connecté à Github !");

        Meteor.call('getReposFromUser', githubUsername,
          function (error, result) {
              if(error){
                bertError("Erreur lors de la récupération de vos repos. Detail : " + error);
              } else {
                for (var i = 0; i < result.length; i++) {
                  this.repos.push(result[i]);
                  if(i == 0){
                    this.reposelected = result[i].name;
                  }
                }
                bertInfo("Récupération de vos repos réussie !");
              }
        }.bind(this));
      }

      this.getPr = (reponame) => {
        var githubUsername = Meteor.user().services.github.username;

        if(!reponame)
          bertError("Vous n'avez pas sélectionné de repo !");

        if(!githubUsername)
          bertError("Vous n'êtes pas connecté à Github !");

        Meteor.call('getPullFromRepo', githubUsername, reponame,
          function (error, result) {
              if(error){
                bertError("Erreur lors de la récupération de vos pullRequests. Detail : " + error);
              } else {
                for (var i = 0; i < result.length; i++) {
                  this.pullRequests.push(result[i]);
                  if(i == 0){
                    this.prselected = result[i].title;
                  }
                }
                if(this.pullRequests.length == 0){
                  bertError("Il n'y a aucune pull requests sur ce repository !");
                }
              }
        }.bind(this));
      }

      //Le tracker va s'occuper d'appeler la méthode si la valeur de l'user change
      //Celle-ci change si l'user etait deja connecté auparavant à la fin du chargement
      //de la page
      Tracker.autorun(function() {
        if (Meteor.user() != undefined && Meteor.user().services != undefined ) {
          this.getRepo();
        }
      }.bind(this));


      /*TODO : tester la valeur du radio button pour le compte */
      /*TODO : verifier que github api utiliser bien des requetes authentifié */
      /*TODO : Rajouter un ng click sur le radio button 'Autre compte'
      qui va forcer le focus sur l'input
      De même quand on click sur l'input, forcer le radio button */

    }
  }
});
