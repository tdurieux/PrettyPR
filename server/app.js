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

      var GithubApi = Meteor.npmRequire('github');
      var github = new GithubApi({
          version: "3.0.0"
      });

      var repos = Async.runSync(function(done) {
        github.repos.getFromUser({
            user: username
        }, function(err, res) {
            done(err, res);
        });
      });

      if(repos.error != null){
        if(repos.error.message.search("Not Found") != -1)
          throw new Meteor.Error(400, "User not found");
        else
          throw new Meteor.Error(400, repos.error.message);
      }

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
          done(err, res);
      });
    });

    if(pullRequests.error != null)
        throw new Meteor.Error(400, repos.error.message);

    return pullRequests.result;
  }

});
