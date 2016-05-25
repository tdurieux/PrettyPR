//Peut servir à ajouté des données au démerrage de meteor avec .startup
Meteor.publish('users', function(){
  return Meteor.users.find({});
});

//Permet à la collection Upload d'accéder au chemin vers les uploads
Meteor.settings.public.meteor_env = process.env.PWD;

//Starting java server
var exec = Meteor.npmRequire('child_process').exec, child;
child = exec('/usr/bin/java -jar ' + process.env.PWD + '/server/prettyPR_jar_funct/prettyPR.jar',
function (error, stdout, stderr){
  console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);
  if(error !== null){
    console.log('exec error: ' + error);
  }
});

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
github.on('*', Meteor.bindEnvironment(function (event, repo, ref, data) {
  console.log("New event !");

  if(event != "pull_request"){
    console.log("Event is not a pr : " + event);
    return;
  } else {
    console.log("Its a pull request !")

    if(data.action == "reopened" || data.action == "opened"){
      console.log("And its reopened or opened ! Lets go for PrettyPr !");

      console.log("Login repo : " + data.pull_request.user.login);
      console.log("repo : " + data.repository.name);
      console.log("number : " + data.pull_request.number);
      console.log("Login sender : " + data.sender.login);


      //Try to get token from db
      var token = GithubUser.findOne({user:data.sender.login});
      if(!token){
        console.log("Erreur lors de la récupération du token du sender ! Celui-ci doit se conncter à PrettyPr");
      } else {
        token = token.token;
      }
      Meteor.call('traitementPr', data.pull_request.user.login , data.repository.name , data.pull_request.number, token, data.pull_request.title, data.pull_request.html_url,
      function (error, result) {
        if(error){
          console.log("Erreur lors de la comparaison. Detail : " + error);
        } else {
          console.log("Succes ! Pr sauvegardé avec l'utilisateur : " + data.sender.login);
          console.log(result);

          PrProcessed.upsert(
            {
              user:data.sender.login,
              url:result.url
            },
            {$set:
              {
                user:data.sender.login,
                url:result.url,
                result:result
              }
            });
          }
        }.bind(this));
      } else {
        console.log("But not an open or reopen action. Action : " + data.action);
      }
    }
    /*console.log("Repo : " + repo);
    console.log("Ref : " + ref);
    console.log("Data : ");
    console.log(data);*/
  }));

  // listen to github push
  github.listen();
