var FileUploadedFS = new FS.Store.FileSystem("fileUploaded");

FileUploaded = new FS.Collection('fileUploaded', {
  stores: [FileUploadedFS ]
});

if (Meteor.isServer) {

  FileUploaded.allow({
    insert: function () {
      return true;
    },
    remove: function () {
      return true;
    },

    download: function () {
      return true;
    },
    update: function () {
      return true;
    }
  });

  Meteor.publish('FileUploaded', function() {
    return FileUploaded.find({});
  });

  Meteor.publish('users', function(){
    return Meteor.users.find({});
  });

}
