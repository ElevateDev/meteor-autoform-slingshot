afSlingshotImpl = function( config ){
  this._initConfig( config );
  
  this._uploads = new ReactiveVar({});
};

// This takes settings and makes some inferences, so we don't have to do it later
afSlingshotImpl.prototype._initConfig = function( config ){
  config = _.extend({},config);
  
  console.log( config );
  // Do we clear all files already in when we upload?
  config.replaceOnChange = true;
  config.multipleUpload = true;

  this._config = config;
};

afSlingshotImpl.prototype._sendUpload = function send( file, uploader ){
  uploader.send( file, function(err, downloadUrl){
    if( err ){
      console.error( err );
    }
  });
};

// Takes a single file and a single directive
afSlingshotImpl.prototype._upload = function upload( file, directive ){
  var self = this;
  var uploader = new Slingshot.Upload( directive.name );

  if( directive.onBeforeUpload ){
    directive.onBeforeUpload( files, function( file ){
      self._sendUpload( file, uploader );
    });
  }else{
    self._sendUpload( file, uploader );
  }
  return uploader;
};

afSlingshotImpl.prototype.changed = function changed( files ){
  var self = this;
  var uploaders = {};  // by filename

  // Iterate through all directives and all files and upload them
  // Give each file a UUID so we can keep them grouped on the UI
  _.each( files, function( file ){
    _.each( self._config.slingshot.directives, function( directive ){
      if( uploaders[ file.name ] === undefined ){
        uploaders[ file.name ] = [];
      }
      uploaders[ file.name ].push( self._upload( file, directive ) );
    });
  });

  this._uploads.set( _.extend( uploaders, this._uploads.get() ) );
};

afSlingshotImpl.prototype.progress = function progress( name ){
  if( this._uploads.get()[name] ){
    var min = _.min( _.map(this._uploads.get()[name],function(u){ 
      return u.progress(); 
    }));
    return min*100;
  }
  return 0;
};

afSlingshotImpl.prototype.remove = function( name ){
  this.uploads.set( _.omit( this._uploads.get(), name ) );
};


afSlingshotImpl.prototype.files = function( ){
  var files = _.map( this._uploads.get(), function( f, k ){
    console.log( f, k );
    var file = f[0];
    file.uuid = k;
    return file;
  }); 
  return files;
};


/* global AutoForm, _, $, Template */

AutoForm.addInputType("slingshot", {
  template: "afSlingshot",
});

Template.afSlingshot.onCreated(function(){
  this.afSlingshot = new afSlingshotImpl( this.data.atts );
});

Template.afSlingshot.helpers({
  multiple: function () {
    var t = Template.instance();
    return t.afSlingshot._config.multipleUpload;
  },
  accept: function(){
    // TODO add directive accepts
  },
  files: function(){
    var t = Template.instance();
    return t.afSlingshot.files();
  },
  progress: function(){
    var t = Template.instance();
    return t.afSlingshot.progress( this.uuid );
  }
});

Template.afSlingshot.events({
  'change .file-upload': function( e, t ){
    t.afSlingshot.changed( e.target.files );
  }
});

/*
 *  BOOTSTRAP THEME
 */
Template.afSlingshot.copyAs('afSlingshot_bootstrap');
