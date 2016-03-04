var GithubApi = null;
var github = null;

var filename1 = null;
var fichier1 = null;

var fichier2 = null;
var filename2 = null;

function initGithubApi(token){
  GithubApi = Meteor.npmRequire('github');
  github = new GithubApi({
      version: "3.0.0"
  });

  // or oauth
  github.authenticate({
    type: "oauth",
    token: token
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

    callJava = Meteor.bindEnvironment(function (key) {

      if(filename1 && filename2){

        //TODO : ici tu peux appeler ton java
        //fichier1 (contient le contenu du fichier 1)
        //fichier2 (contient le contenu du fichier 2)
        //filename1 : nom du fichier1
        //filename2 : nom du fichier2
        console.log(filename1);
        console.log(filename2);
      }
    });


    //Fichier 1
    var file = FileUploaded.findOne({ _id: idFile1});
    filename1 = file.original.name;
    fichier1 = "";

    file.createReadStream("fileUploaded")
    .on('data', function (chunk) {
      fichier1 += chunk;
    })
    .on('close', function() {
      //removeFile(idFile1);
      callJava();
    });


    //Fichier 2
    var file2 = FileUploaded.findOne({ _id: idFile2});
    filename2 = file2.original.name;
    fichier2 = "";

    file2.createReadStream("fileUploaded")
    .on('data', function (chunk) {
      fichier2 += chunk;
    })
    .on('close', function() {
      //removeFile(idFile2);
      //callJava();
    });


  },

  getReposFromUser: function (username, token) {

      if(!github)
        initGithubApi(token);

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

      if(repos.error != null){
        if(repos.error.message.search("Not Found") != -1)
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

  getPullFromRepo: function (username, reponame, token) {

    if(!github)
      initGithubApi(token);

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
