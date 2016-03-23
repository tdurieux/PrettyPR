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
   }
   console.log("Repo : " + repo);
   console.log("Ref : " + ref);
   console.log("Data : ");
   console.log(data);
 });

 // listen to github push
 github.listen();
