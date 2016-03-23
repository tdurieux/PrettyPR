function validationUsername(selected, meteorAccount, otherAccount){

  if(!meteorAccount){
    bertError("Veuillez vous connecter à Github !");
    return null;
  }

  meteorAccount = meteorAccount.services.github.username;

  if(selected != "other" && selected != "mine"){
    bertError("Aucune radiobox pour l'utilisateur sélectionnée !");
    return null;
  }

  if(selected == "other"){
    if(!otherAccount){
      bertError("Veuillez rentrer un nom de compte !");
      return null;
    }
    return otherAccount;
  }else{
    if(!meteorAccount){
      bertError("Vous n'êtes pas connecté à Github !");
      return null;
    }
    return meteorAccount;
  }
}

angular.module('prettyPr')
  .filter('startFrom', function() {
      return function(input, start) {
          start = +start; //parse to int
          return input.slice(start);
      }
  })
  .directive('github', function() {
  return {
    restrict: 'E',
    templateUrl: 'client/github/github.html',
    controllerAs: 'github',
    controller: function($scope, $reactive, cfpLoadingBar, $location, sharedProperties) {
      $reactive(this).attach($scope);

      //Subscribe to differents sources to access data
      this.subscribe('users');
      this.subscribe('GithubRepos');
      this.subscribe('GithubPr');


      //######################## Vars #############################

      this.repos = new ReactiveArray();
      this.pullRequests = new ReactiveArray();
      this.otherAccount = null;
      this.userselected = "mine";
      this.reposelected = null;
      this.prselected = null;
      this.currentPageRepo = 0;
      this.forceRepo = false;
      this.forcePr = false;

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
        },
        numberOfPagesRepo: () => {
          return Math.ceil(this.repos.list().length/10);
        }
      });


      //######################## METHODS #############################


      //######## GET REPOS
      this.getRepo = () => {
        var githubUsername = validationUsername(this.userselected,
          Meteor.user(), this.otherAccount);
        if(!githubUsername)
          return;

        var accessToken = Meteor.user().services.github.accessToken;

        this.currentPageRepo = 0;

        cfpLoadingBar.start();



        //Try to get repos from cache
        var reposCache = GithubRepos.findOne({user:githubUsername});

        if(!this.forceRepo && reposCache){
          reposCache = reposCache.repos;
          this.repos.splice(0, this.repos.length);
          for (var i = 0; i < reposCache.length; i++) {
            this.repos.push(reposCache[i]);
            if(i == 0){
              this.reposelected = reposCache[i].name;
            }
          }
          cfpLoadingBar.complete();
          bertInfo("Récupération de vos repos réussie !");
          return;
        }

        Meteor.call('getReposFromUser', githubUsername, accessToken,
          function (error, result) {
              cfpLoadingBar.complete();
              if(error){
                bertError("Erreur lors de la récupération de vos repos. Detail : " + error);
              } else {
                //Remove old
                this.repos.splice(0, this.repos.length);

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

      //######## GET PULL REQUESTS
      this.getPr = () => {

        var githubUsername = validationUsername(this.userselected,
          Meteor.user(), this.otherAccount);

        if(!githubUsername)
          return;

        if(!this.reposelected){
          bertError("Vous n'avez pas sélectionné de repo !");
          return;
        }

        var accessToken = Meteor.user().services.github.accessToken;
        cfpLoadingBar.start();

        //Try to get pr from cache
        var prCache = GithubPr.findOne({user:githubUsername, repo: this.reposelected});

        if(!this.forcePr && prCache){
          prCache = prCache.pullRequests;

          //Remove old
          this.pullRequests.splice(0, this.pullRequests.length);

          for (var i = 0; i < prCache.length; i++) {
            this.pullRequests.push(prCache[i]);
            if(i == 0){
              this.prselected = prCache[i].title;
            }
          }
          if(this.pullRequests.length == 0){
            bertError("Il n'y a aucune pull requests sur ce repository !");
          }
          cfpLoadingBar.complete();
          return;
        }

        Meteor.call('getPullFromRepo', githubUsername, this.reposelected, accessToken,
          function (error, result) {
              cfpLoadingBar.complete();
              if(error){
                bertError("Erreur lors de la récupération de vos pullRequests. Detail : " + error);
              } else {
                //Remove old
                this.pullRequests.splice(0, this.pullRequests.length);

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



      this.compare = () => {

        console.log(this.prselected);
        var idPr = this.prselected.split('/').pop();

        var githubUsername = validationUsername(this.userselected,
          Meteor.user(), this.otherAccount);

        if(!githubUsername)
          return;

        if(!this.prselected){
          bertError("Vous n'avez pas sélectionné de pullRequest !");
          return;
        }

        var accessToken = Meteor.user().services.github.accessToken;

        Meteor.call('traitementPr', githubUsername, this.reposelected, idPr, accessToken,
          function (error, result) {

              if(error){
                bertError("Erreur lors de la comparaison. Detail : " + error);
              } else {


                sharedProperties.setChangement(result);
                $location.path("/results");
                $scope.$apply();

              }
        }.bind(this));

      };


      //Le tracker va s'occuper d'appeler la méthode si la valeur de l'user change
      //Celle-ci change si l'user etait deja connecté auparavant à la fin du chargement
      //de la page
      Tracker.autorun(function() {
        if (Meteor.user() != undefined && Meteor.user().services != undefined ) {
          this.getRepo();
        }
      }.bind(this));


      /*TODO : le lien dans les pull requests n'est pas cliquable */
      /*TODO : Rajouter un ng click sur le radio button 'Autre compte'
      qui va forcer le focus sur l'input
      De même quand on click sur l'input, forcer le radio button */
      /*TODO : Rajouter une recherche sur l'utilisateur github ? */

    }
  }
});
