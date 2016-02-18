Meteor.methods({

  traitementFichier: function (idFile1, idFile2) {
    var file = FileUploaded.findOne({ _id: idFile1});

    fichier1 = "";

    file.createReadStream("fileUploaded")
    .on('data', function (chunk) {
      fichier1 += chunk;
    })
    .on('close', function() {
      console.log(fichier1);
    });

    var file2 = FileUploaded.findOne({ _id: idFile2});
    fichier2 = "";

    file2.createReadStream("fileUploaded")
    .on('data', function (chunk) {
      fichier2 += chunk;
    })
    .on('close', function() {
      console.log(fichier2);
    });



  }


});
