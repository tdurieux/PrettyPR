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

        var filename1 = 'FileUploaded-' + idFile1 + '-' + FileUploaded.findOne({ _id: idFile1}).original.name;
        var filename2 = 'FileUploaded-' + idFile2 + '-' + FileUploaded.findOne({ _id: idFile2}).original.name;

        var data1 = fs.readFileSync(Meteor.settings.public.meteor_env + "/prettyPrUpload/" + filename1 , 'utf8');
        var data2 = fs.readFileSync(Meteor.settings.public.meteor_env + "/prettyPrUpload/" + filename2 , 'utf8');

        filename1 = filename1.split("-")[6].replace(/\.[^/.]+$/, "");
        filename2 = filename2.split("-")[6].replace(/\.[^/.]+$/, "");

        var oldFileName = filename1;
        var newFileName = filename2;

        try {
          var resultPr =  HTTP.call( 'POST', 'http://localhost:8080/api/prettypr', {
            data: {
              "oldFileName": oldFileName,
              "newFileName": newFileName,
              "oldFile": data1,
              "newFile": data2
            }
          });

          var result = new Object();
          result.changes = new Array();
          result.title = "File Uploaded";
          result.id = 0;
          result.url = "File Uploaded";
          result.body = "File Uploaded";
          result.repository = "File Uploaded";
          result.user = "File Uploaded";

          var change = new Object();

          change.oldFile = data1;
          change.newFile = data2;
          change.actions = resultPr.data.actions;
          change.location = new Object();
          change.location.path = "/helloworld.java";
          change.location.type = "Class";
          change.location.class = "HelloWorld";
          //result.newFileName = newFileName;
          //result.oldFileName = oldFileName;

          result.changes.push(change);

          //Remove files
          FileUploaded.remove({});

          return result;

        } catch(e){
          console.log("Error with java serveur : ", e );
        }

  },

  traitementPr: function(username, repository, idPr, token, title, url){

    if(!github)
      initGithubApi(token);

    var oldFiles = [];
    var prFiles = [];
    var otherFiles = [];
    var regex = /(?:\.([^.]+))?$/;

    //Get Pull Request info
    var pr_info = Async.runSync(function(done) {
      github.pullRequests.get({
          user: username,
          number: idPr,
          repo: repository
      }, function(err, res) {
          done(err, res);
      });
    });

    //Negate the diff file to get original file instead of downloading each file
    var diffs = HTTP.call( 'GET', pr_info.result.diff_url).content.split("diff --git");
    diffs.forEach(function (diff){
        var file = new Object();

        file.path = diff.substring(diff.indexOf("a/") + 2, diff.indexOf("b/") - 1);
        file.name = file.path.replace(/^.*[\\\/]/, '');

        diff = diff.substring(diff.lastIndexOf('@@') + 2, diff.length);
        diff = diff.replace("-", " ");

        // break the textblock into an array of lines
        var lines = diff.split('\n');

        //get lines that begins with a +
        var numbers = [];
        lines.forEach(function (diff, index){
            if(diff.substring(0,1) == "+")
              numbers.push(index);
        });

        // remove line that begins with a +
        var counter = 0;
        numbers.forEach(function (number){
          lines.splice(number - counter, 1);
          counter++;
        });

        // join the array back into a single string
        diff = lines.join('\n');

        file.content = diff;

        oldFiles.push(file);
    });

    //Remove first empty element created by split
    oldFiles.splice(0,1);

    //Get Pull Request File
    //Loop to get more than 100 files
    var contentPrFiles;
    var currentPage = 0;
    while(true){
      var contentPrFilesTemp = Async.runSync(function(done) {
        github.pullRequests.getFiles({
            user: username,
            per_page: 100,
            repo: repository,
            number: idPr,
            page : currentPage
        }, function(err, res) {
            done(err, res);
        });
      });

      if(contentPrFilesTemp.error != null){
        throw new Meteor.Error(400, contentPrFilesTemp.error.message);
      }

      //Its ok we get all files
      if(contentPrFilesTemp.result.length % 100 != 0) {
        if(!contentPrFiles)
          contentPrFiles = contentPrFilesTemp;
        break;
      }
      //Going to next page and save elements in final variable
      else {
        currentPage++;
        if(!contentPrFiles)
          contentPrFiles = contentPrFilesTemp;
        else {
          contentPrFiles.result = contentPrFiles.result.concat(contentPrFilesTemp.result);
        }
      }
    }

    //Download modified files
    contentPrFiles.result.forEach(function (contentFile) {
      if (contentFile.status == 'modified'){

        if(regex.exec(contentFile.filename)[1] == "java"){
          var file = new Object();
          file.path = contentFile.filename;
          file.name = contentFile.filename.replace(/^.*[\\\/]/, '');
          file.content = HTTP.call( 'GET', contentFile.raw_url).content;
          prFiles.push(file);
        } else {
          var file = new Object();
          file.path = contentFile.filename;
          file.name = contentFile.filename.replace(/^.*[\\\/]/, '');
          file.content = HTTP.call( 'GET', contentFile.raw_url).content;
          otherFiles.push(file);
        }
      }
    });


    var result = new Object();
    result.changes = new Array();
    result.title = title;
    result.id = idPr;
    result.url = url;
    result.body = "";
    result.repository = repository;
    result.user = username;

    //PrettyPr on Java Modified file
    prFiles.forEach(function (prFile){
      oldFiles.forEach(function (oldFile){
        if(oldFile.name == prFile.name){

          var resultPr =  HTTP.call( 'POST', 'http://localhost:8080/api/prettypr', {
            data: {
              "oldFileName": oldFile.name,
              "newFileName": prFile.name,
              "oldFile": oldFile.content,
              "newFile": prFile.content
            }
          });

          var change = new Object();
          change.newFile = prFile.content;
          change.oldFile = oldFile.content;
          change.actions = resultPr.data.actions;

          change.location = new Object();
          change.location.path = prFile.path;
          change.location.class = prFile.name.replace(/\.[^/.]+$/, "");

          if(prFile.content.search("class") != -1)
            change.location.type = "Class";
          else if(prFile.content.search("interface") != -1)
            change.location.type = "Interface";
          else
            change.location.type = "Test";

          result.changes.push(change);
        }
      });
    });

    //Simple diff on Other Modified file
    otherFiles.forEach(function (otherFile){
        oldFiles.forEach(function (oldFile){
          if(otherFile.name == oldFile.name){

            var base = difflib.stringAsLines(oldFile.content);
            var newtxt = difflib.stringAsLines(otherFile.content);

            // create a SequenceMatcher instance that diffs the two sets of lines
            sm = new difflib.SequenceMatcher(base, newtxt);
  		      var resultPr = sm.get_opcodes();


            var change = new Object();
            change.oldFile = base;
            change.newFile = newtxt;
            change.actions = resultPr;

            change.location = new Object();
            change.location.path = otherFile.path;
            change.location.class = otherFile.name.replace(/\.[^/.]+$/, "");

            change.location.type = "Other";

            result.changes.push(change);

          }
        });
    });

    return result;

  },

  traitementPr: function(username, repository, idPr){

    return;

  },

  getReposFromUser: function (username, token) {

      if(!github)
        initGithubApi(token);

      //save token for hook uses
      GithubUser.upsert({user:Meteor.user().services.github.username}, {$set:{
        user:Meteor.user().services.github.username,
        token:token
      }});


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

    //save token for hook uses
    GithubUser.upsert({user:Meteor.user().services.github.username}, {$set:{
      user:Meteor.user().services.github.username,
      token:token
    }});

    var pullRequests = Async.runSync(function(done) {
      github.pullRequests.getAll({
          user: username,
          repo: reponame,
          per_page: 100
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
