//Peut servir à ajouté des données au démerrage de meteor avec .startup

//Permet à la collection Upload d'accéder au chemin vers les uploads
Meteor.settings.public.meteor_env = process.env.PWD;




//Github hook to catch pull request
var githubhook = Meteor.npmRequire('githubhook');
 // configure listener for github changes
 var github = githubhook({/* options */
    host: "0.0.0.0",
    port: 8082,
    path: "/pushchanges",
    secret: "prettypr586"
 });

 // listen to push on github on branch master
 github.on('*', function (event, repo, ref, data) {
   console.log("New event !");

   if(event != "pull_request"){
     console.log("Event is not a pr : " + event);
     return;
   } else {
     console.log("Its a pull request !")

     if(data.action == "reopened" || data.action == "opened"){
       console.log("And its reopened or opened ! Lets go for PrettyPr !");

      console.log("Login : " + data.pull_request.user.login);
      console.log("repo : " + data.repository.name);
      console.log("number : " + data.pull_request.number);

       Meteor.call('traitementPr', data.pull_request.user.login , data.repository.name , data.pull_request.number, "prettypr586",
         function (error, result) {

             if(error){
               console.log("Erreur lors de la comparaison. Detail : " + error);
             } else {

               console.log("Succes ! ");
               console.log(result);


             }
       }.bind(this));

     } else {
       console.log("But not an open or reopen action. Action : " + data.action);
     }

   }
   console.log("Repo : " + repo);
   console.log("Ref : " + ref);
   console.log("Data : ");
   console.log(data);



 });

 // listen to github push
 github.listen();
