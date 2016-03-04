var GithubApi = null;
var github = null;

function initGithubApi(){
  GithubApi = Meteor.npmRequire('github');
  github = new GithubApi({
      version: "3.0.0"
  });

  tokenGithub = Assets.getText("secret.properties").replace(/(\r\n|\n|\r)/gm,"");;

  // or oauth
  github.authenticate({
    type: "oauth",
    token: tokenGithub
  });


}

Meteor.methods({

  traitementFichier: function(idFile1, idFile2){
        var exec = Meteor.npmRequire('child_process').exec, child;
        var base = process.env.PWD;
        child = exec('/usr/bin/java -jar ' + base + '/server/prettyPR.jar HelloWord ~/prettyPrUpload/' + pathFichierOld + '~/prettyPrUpload/' + pathFichierNew,
          function (error, stdout, stderr){
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if(error !== null){
              console.log('exec error: ' + error);
            }
        });
  },

  traitementFichierOld: function (idFile1, idFile2) {

    //Vu qu'on est dans un callback avec le readstream
    //On doit bindEnvironment sinon meteor ne nous laisse
    //pas appeler la collection
    removeFile = Meteor.bindEnvironment(function (key) {
      return FileUploaded.remove({_id: key});
    });

    //Fichier 1
    var file = FileUploaded.findOne({ _id: idFile1});
    fichier1 = "";

    file.createReadStream("fileUploaded")
    .on('data', function (chunk) {
      fichier1 += chunk;
    })
    .on('close', function() {
      console.log(fichier1);
      removeFile(idFile1);
    });


    //Fichier 2
    var file2 = FileUploaded.findOne({ _id: idFile2});
    fichier2 = "";

    file2.createReadStream("fileUploaded")
    .on('data', function (chunk) {
      fichier2 += chunk;
    })
    .on('close', function() {
      console.log(fichier2);
      removeFile(idFile2);
    });


  },

  getReposFromUser: function (username) {

      if(!github)
        initGithubApi();

      var currentPage = 0;
      var repos = null;
      var reposTemp = null;

      //On va boucler car on peut avoir que 100 repos à la fois
      while(true){
        var reposTemp = Async.runSync(function(done) {
          github.repos.getFromUser({
              user: username,
              page: currentPage,
              per_page: 100
          }, function(err, res) {
              done(err, res);
          });
        });

        if(reposTemp.error != null){
          if(reposTemp.error.message.search("Not Found") != -1)
            throw new Meteor.Error(400, "User not found");
          else
            throw new Meteor.Error(400, reposTemp.error.message);
        }


        //On a tous les repos de l'utilisateur
        if(reposTemp.result.length % 100 != 0){
          if(!repos)
            repos = reposTemp;
          break;
        }
        else{
          currentPage++;
          if(!repos)
            repos = reposTemp;
          else {
            repos.result = repos.result.concat(reposTemp.result);
          }
        }
      }

      return repos.result;
  },

  getPullFromRepo: function (username, reponame) {

    if(!github)
      initGithubApi();

    var pullRequests = Async.runSync(function(done) {
      github.pullRequests.getAll({
          user: username,
          repo: reponame
      }, function(err, res) {
          done(err, res);
      });
    });

    if(pullRequests.error != null)
        throw new Meteor.Error(400, repos.error.message);

    return pullRequests.result;
  }

});
