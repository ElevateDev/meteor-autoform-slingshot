Schema = {};

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
    },
    allowedFileTypes: null,
    maxSize: 1024 * 1024
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
        directives: [{
          name: 'files'
        }]
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
