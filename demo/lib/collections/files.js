Schema = {};

Slingshot.fileRestrictions("files", {
  allowedFileTypes: ["image/png", "image/jpeg", "image/gif"],
  maxSize: 10 * 1024 * 1024 // 10 MB (use null for unlimited).
});

Slingshot.fileRestrictions("thumbnails", {
  allowedFileTypes: ["image/png", "image/jpeg", "image/gif"],
  maxSize: 1024 * 1024 // 10 MB (use null for unlimited).
});

if (Meteor.isServer) {
  Slingshot.createDirective('files', Slingshot.S3Storage, {
    bucket: Meteor.settings.public.files.bucket,
    region: Meteor.settings.public.files.region,
    acl: 'public-read',

    authorize: function() {
      return true;
    },

    key: function(file) {
      var key = Meteor.uuid();
      return key;
    }
  });
  Slingshot.createDirective('thumbnails', Slingshot.S3Storage, {
    bucket: Meteor.settings.public.files.bucket,
    region: Meteor.settings.public.files.region,
    acl: 'public-read',

    authorize: function() {
      return true;
    },

    key: function(file) {
      var key = Meteor.uuid();
      return key;
    }
  });
}

Schema.File = new SimpleSchema({
  strFile: {
    type: String,
    optional: true,
    autoform: {
      type: 'slingshot', // (required)
      multi: false,
      ui: {
        showDownloadAll: true
      },
      slingshot: {
        directives: [{
          name: 'files'
        }]
      }
    }
  },
  file: {
    type: afSlingshot.fileSchema,
    optional: true,
    autoform: {
      type: 'slingshot', // (required)
      multi: false,
      ui: {
        showDownloadAll: true
      },
      slingshot: {
        directives: [{
          name: 'files'
        }]
      }
    }
  },
  files: {
    type: [afSlingshot.fileSchema],
    optional: true,
    autoform: {
      type: 'slingshot', // (required)
      multi: true,
      ui: {
        showDownload: true
      },
      slingshot: {
        directives: [
          {
            name: "thumbnails",
            onBeforeUpload: function(file, callback) {
              var settings = {
                width: 1024,
                height: 1024,
                cropSquare: false
              };
              Resizer.resize( file, settings, callback );
            }
          },{
            name: 'files'
          }
        ],
      }
    }
  },
});

Files = new Mongo.Collection('Files');
Files.attachSchema(Schema.File);

Files.allow({
  insert: function() {
    return true;
  },
  update: function() {
    return true;
  },
  remove: function() {
    return true;
  }
});
