Meteor.methods({

  traitementFichier: function (idFile1, idFile2) {

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

      var GithubApi = Meteor.npmRequire('github');
      var github = new GithubApi({
          version: "3.0.0"
      });

      var repos = Async.runSync(function(done) {
        github.repos.getFromUser({
            user: username
        }, function(err, res) {
            done(null, res);
        });
      });

      return repos.result;
  },

  getPullFromRepo: function (username, reponame) {

    console.log("Récupération du répo " + reponame + " de l'utilisateur : " + username);

    var GithubApi = Meteor.npmRequire('github');
    var github = new GithubApi({
        version: "3.0.0"
    });

    var pullRequests = Async.runSync(function(done) {
      github.pullRequests.getAll({
          user: username,
          repo: reponame
      }, function(err, res) {
          done(null, res);
      });
    });

    return pullRequests.result;
  }



});
