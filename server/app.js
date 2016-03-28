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
        var fs = Meteor.npmRequire('fs');

        var filename1 = 'fileUploaded-' + idFile1 + '-' + FileUploaded.findOne({ _id: idFile1}).original.name;
        var filename2 = 'fileUploaded-' + idFile2 + '-' + FileUploaded.findOne({ _id: idFile2}).original.name;

        var data1 = fs.readFileSync(Meteor.settings.public.meteor_env + "/prettyPrUpload/" + filename1 , 'utf8');
        var data2 = fs.readFileSync(Meteor.settings.public.meteor_env + "/prettyPrUpload/" + filename2 , 'utf8');

        filename1 = filename1.split("-")[6].replace(/\.[^/.]+$/, "");
        filename2 = filename2.split("-")[6].replace(/\.[^/.]+$/, "");

        var oldFileName = filename1;
        var newFileName = filename2;

        try {
          var result =  HTTP.call( 'POST', 'http://localhost:8080/api/prettypr', {
            data: {
              "oldFileName": oldFileName,
              "newFileName": newFileName,
              "oldFile": data1,
              "newFile": data2
            }
          });


          result.oldFile = data1;
          result.newFile = data2;
          result.newFileName = newFileName;
          result.oldFileName = oldFileName;
          result.title = "File Uploaded";
          result.id = 0;
          result.url = "File Uploaded";
          result.body = "File Uploaded";
          result.repository = "File Uploaded";
          result.user = "File Uploaded";

          return result;

        } catch(e){
          console.log("Error with java serveur : ", e );
        }

  },

  traitementPr: function(username, repository, idPr){

    if(!github)
      initGithubApi(token);
    return;

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

      //Save in db cache
      GithubRepos.upsert({user:username}, {$set:{
        user:username,
        repos:repos.result
      }});


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

    if(pullRequests.error != null){
      throw new Meteor.Error(400, repos.error.message);
    }

    //Save in db cache
    GithubPr.upsert({user:username, repo: reponame}, {$set:{
      user:username,
      repo: reponame,
      pullRequests:pullRequests.result
    }});


    return pullRequests.result;
  }

});
