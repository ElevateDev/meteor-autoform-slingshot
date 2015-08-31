var hackySlingshotStorage = {};  // TODO WTF? autoform.  Seriously no way to get an instance variable in valueOut?
SimpleSchema.messages({uploadInProgress: 'Upload in progress'});
AutoForm.addInputType('slingshot', {
  template: 'afSlingshot',
  valueOut: function() {
    var afSlingshot = hackySlingshotStorage[ this.attr('data-schema-key') ];
    var validationContext = AutoForm.getValidationContext();

    var val;
    if (this.attr('data-multiple')) {
      val = afSlingshot.data();
    }else {
      val =  afSlingshot.data()[0];
    }

    // validate
    if (afSlingshot.progress() < 100) {
      validationContext.addInvalidKeys([{
        name: this.attr('data-schema-key'),
        type: 'uploadInProgress',
        value: val
      }]);
    }else {
      return val;
    }
  },
  valueConverters: {
    'string': function(val) {
      return val.src;
    }
  },
  valueIn: function(val) {
    if (typeof(val) === 'undefined' || val === '' || val === null) { return; }

    var data = {};
    if (typeof(val) === 'string') {
      var f = {
        src: val,
        filename: val,
        key: val
      };
      data[ f.filename ] = [f];
    }else if (!_.isArray(val)) {
      data[ val.filename] = [_.extend({},val)];
    }else {
      _.each(val, function(file) {
        if (data[ file.filename ] === undefined) {
          data[ file.filename ] = [];
        }
        data[ file.filename ].push(_.extend({},file));
      });
    }
    return data;
  }
});

Template.afSlingshot.onCreated(function() {
  this.afSlingshot = new afSlingshot.Model(
    this.data.atts.slingshot,
    this.data.value,
    this.data.atts.multi
  );

  // Seriously... fuck you
  hackySlingshotStorage[ this.data.atts['data-schema-key'] ] = this.afSlingshot;

  // Setup UI defaults
  this._config = this.data.atts.ui ? this.data.atts.ui : {};
  if (this.data.atts.multi) {
    _.defaults(this._config,{
      hideList: false,
      hideIcons: false,
      noPreview: false,
      multipleUpload: true,
      hideDownload: true
    });
    // need to add this so we can tell that we're dealing with multiple files later
    this.data.atts['data-multiple'] = true;
  }else {
    _.defaults(this._config,{
      hideList: true,
      multipleUpload: false
    });
  }
});

Template.afSlingshot.onDestroyed(function() {
  delete hackySlingshotStorage[ this.data.atts.id ];
});

Template.afSlingshot.helpers({
  atts: function() {
    return _.omit(this.atts, 'ui','slingshot','multi');
  },
  config: function() {
    var t = Template.instance();
    return t._config;
  },
  allowedFileTypes: function() {
    var t = Template.instance();
    var allowedFileTypes = t.afSlingshot.allowedFileTypes();
    return allowedFileTypes;
  },
  files: function() {
    var t = Template.instance();
    return t.afSlingshot.files();
  },
  summary: function() {
    var t = Template.instance();
    var files = t.afSlingshot.files();
    if (files.length === 0) {
      return 'Click to upload';
    }else if (files.length === 1) {
      return files[0].filename;
    }else {
      return files.length.toString() + ' files uploaded';
    }
  },
  showList: function() {
    var t = Template.instance();
    return t.afSlingshot.files().length > 0 && !t._config.hideList;
  },
  progressAll: function() {
    var t = Template.instance();
    return t.afSlingshot.progress();
  },
  showTotalProgress: function() {
    var t = Template.instance();
    var progress = t.afSlingshot.progress();
    if (progress !== 0 && progress < 100) {
      return true;
    }
  },
  round: function(val) {
    if (typeof(val) === 'number') {
      return Math.round(val);
    }
  },
  mimeClass: function() { // from file scope
    var t = Template.instance();
    if (this.type) {
      return this.type.replace('/','-');
    }
  }
});

Template.afSlingshot.events({
  'change .file-upload': function(e, t) {
    t.afSlingshot.add(e.target.files);
  },
  'click div[name="remove"]': function(e, t) {
    t.afSlingshot.remove(this.filename);
  },
  'click *[name="afSlingshot-uploader"]': function(e, t) {
    t.$('input[type="file"]').click();
  },
  'click .download-btn': function(e, t) {
    e.stopPropagation();
    t.afSlingshot.downloadAll();
  }
});

/*
 *  BOOTSTRAP THEME
 */
Template.afSlingshot.copyAs('afSlingshot_bootstrap');
