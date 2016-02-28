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
      this.subscribe('FileUploaded');

      this.test = true;

      this.file1 = null;
      this.file2 = null;

      this.helpers({
        showFile1: () => {
          return this.getReactively('file1') == null;
        },
        showFile2: () => {
          return this.getReactively('file2') == null;
        }
      });

      this.addFile1 = (files) => {
        if (files.length > 0) {
          this.file1 = new FS.File(files[0]);
          this.file1._id = guid();

          FileUploaded.insert(this.file1, function (err, fileObj) {
            if (err) {
                console.log("there was an error", err);
                this.file1 = null;
            }
          });
        }
      };

      this.addFile2 = (files) => {
        if (files.length > 0) {
          this.file2 = new FS.File(files[0]);
          this.file2._id = guid();

          FileUploaded.insert(this.file2, function (err, fileObj) {
            if (err) {
                console.log("there was an error", err);
                this.file2 = null;
            }
          });
        }
      };

      this.traiterFichier = () => {
        if(this.file1 != null && this.file2 != null){
            Meteor.call('traitementFichier', this.file1._id, this.file2._id,
              function (error, result) {
                if(error){
                  bertError('Erreur lors du traitement : ' + error);
                }else{
                  bertInfo('Les fichiers ont été traités avec succès');
                }
              });
        }
        else {
          bertError('Vous devez sélectionner 2 fichiers avant de pouvoir les traiter');
        }
      };

    }
  }
});
