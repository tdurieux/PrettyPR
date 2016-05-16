var FileUploadedFS = new FS.Store.FileSystem("filesystem", {path: Meteor.settings.public.meteor_env+"/prettyPrUpload"});

export const FileUploaded = new FS.Collection('fileuploaded', {
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

  Meteor.publish('fileuploaded', function() {
    return FileUploaded.find({});
  });



}
