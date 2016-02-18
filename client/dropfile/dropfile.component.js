function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}


angular.module('prettyPr').directive('dropfile', function() {
  return {
    restrict: 'E',
    templateUrl: 'client/dropfile/dropfile.html',
    controllerAs: 'dropfile',
    controller: function($scope, $reactive) {
      $reactive(this).attach($scope);

      var file1 = "";
      var file2 = "";

      this.subscribe('FileUploaded');

      this.addFile1 = (files) => {
        if (files.length > 0) {
          var yourFile = new FS.File(files[0]);
          file1 = guid();
          yourFile._id = file1;
          console.log(yourFile);
          FileUploaded.insert(yourFile, function (err, fileObj) {
            if (err) {
                console.log("there was an error", err);
            }
          });
        }
      };

      this.addFile2 = (files) => {
        if (files.length > 0) {
          var yourFile = new FS.File(files[0]);
          file2 = guid();
          yourFile._id = file2;
          console.log(yourFile);
          FileUploaded.insert(yourFile, function (err, fileObj) {
            if (err) {
                console.log("there was an error", err);
            }
          });
        }
      };

      this.traiterFichier = () => {
        console.log(file1);
        console.log(file2);
        if(file1 != "" && file2 != ""){
            Meteor.call('traitementFichier', file1, file2);
        }
        else {
          console.log("Les 2 fichiers n'ont pas été envoyés !")
        }
      };

    }
  }
});
