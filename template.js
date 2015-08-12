afSlingshotImpl = function( config, multi ){
  this._initConfig( config, multi );
  
  this._uploads = new ReactiveVar({});
};

// This takes settings and makes some inferences, so we don't have to do it later
afSlingshotImpl.prototype._initConfig = function( config, multi ){
  config = _.extend({},config);

  // if multi is undefined default it to true;
  multi = (multi === undefined) ? true : multi;

  if( multi ){
    _.defaults( config, {
      replaceOnChange: false
    });
  }else{
    _.defaults( config, {
      replaceOnChange: true
    });
  }

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

  // Save directive name to uploader object, since it's not avaliable
  uploader.directive = directive.name; 

  if( directive.onBeforeUpload ){
    directive.onBeforeUpload( files, function( file ){
      self._sendUpload( file, uploader );
    });
  }else{
    self._sendUpload( file, uploader );
  }
  return uploader;
};

afSlingshotImpl.prototype.add = function( files ){
  var self = this;
  var uploaders = {};  // by filename

  // Iterate through all directives and all files and upload them
  // Give each file a UUID so we can keep them grouped on the UI
  _.each( files, function( file ){
    _.each( self._config.directives, function( directive ){
      if( uploaders[ file.name ] === undefined ){
        uploaders[ file.name ] = [];
      }
      uploaders[ file.name ].push( self._upload( file, directive ) );
    });
  });

  if( this._config.replaceOnChange ){  
    this._uploads.set( uploaders );
  }else{
    this._uploads.set( _.extend( uploaders, this._uploads.get() ) );
  }
};

/*
 * Return progress of file upload.
 */
afSlingshotImpl.prototype.progress = function progress( name ){
  var self = this;
  var min;
  if( !name ){
    // If name wasn't defined, recurse and find min of al uploads
    min = _.min( _.map(self._uploads.get(), function(v,k){
      return self.progress( k );
    }));
    return min;
  }else if( self._uploads.get()[name] ){
    min = _.min( _.map(self._uploads.get()[name],function(u){ 
      return u.progress(); 
    }));
    return min*100;
  }
};

afSlingshotImpl.prototype._getFile = function( name ){
  if( this._uploads.get()[name] && this._uploads.get()[name].length > 0){
    return this._uploads.get()[name][0];
  }
};

afSlingshotImpl.prototype.isImage = function( name ){
  var file = this._getFile( name );
  if( file ){
    return file.isImage();
  }
};

afSlingshotImpl.prototype.mime = function( name ){
  var file = this._getFile( name );
  if( file ){
    return file.file.type;
  }
};

afSlingshotImpl.prototype.src = function( name ){
  var file = this._getFile( name );
  if( file ){
    return file.url( true );
  }
};

afSlingshotImpl.prototype.remove = function( name ){
  this._uploads.set( _.omit( this._uploads.get(), name ) );
};

afSlingshotImpl.prototype.download = function( name ){
  var self = this;
  if( name ){
    var file = this._getFile( name );
    window.open( self._dataFromUploader(file).src );
  }else{
    _.each(this.files(),function( f ){
      self.download( f.name );
    });
  }
};

afSlingshotImpl.prototype.files = function( ){
  var files = _.map( this._uploads.get(), function( uploaders, k ){
    var file = uploaders[0];
    file.uuid = k;
    file.name = k;

    return file;
  }); 
  return files;
};

afSlingshotImpl.prototype._dataFromUploader = function(u){
  var f = {
    src: u.url(),
    filename: u.file.name,
    type: u.file.type,
    size: u.file.size,
    directive: u.directive,
  };
  if( u.instructions ){
    f.key = _.find( u.instructions.postData, function( d ){ return d.name === "key"; } ).value;
  }
  return f;
};

afSlingshotImpl.prototype.data = function(){
  var self = this;
  var data = [];
  _.each( this._uploads.get(), function( uploaders, k ){
    _.each( uploaders,function( u ){
      data.push( self._dataFromUploader( u ) );
    });
  });
  return data;
};


var hackySlingshotStorage = {};  // TODO WTF? autoform.  Seriously no way to get an instance variable in valueOut?
AutoForm.addInputType("slingshot", {
  template: "afSlingshot",
  valueOut: function( ){
    var afSlingshot = hackySlingshotStorage[ this.attr('id') ];
    if( this.attr('data-multiple') ){
      return afSlingshot.data();
    }else{
      return afSlingshot.data()[0];
    }
  },
  valueConverters: {
    "string": function(val){
      console.log( val );
      return val.src;
    }
  }
});

Template.afSlingshot.onCreated(function(){
  this.afSlingshot = new afSlingshotImpl( this.data.atts.slingshot, this.data.atts.multi );
  hackySlingshotStorage[ this.data.atts.id ] = this.afSlingshot;

  // Setup UI defaults
  this._config = this.data.atts.ui ? this.data.atts.ui : {};
  if( this.data.atts.multi ){
    _.defaults( this._config,{
      hideList: false,
      hideIcons: false,
      noPreview: false,
      multipleUpload: true,
      hideDownload: true
    });
    // need to add this so we can tell that we're dealing with multiple files later
    this.data.atts["data-multiple"] = true;
  }else{
    _.defaults( this._config,{
      hideList: true,
      multipleUpload: false
    });
  }
});

Template.afSlingshot.onDestroyed(function(){
  delete hackySlingshotStorage[ this.data.atts.id ];
});

Template.afSlingshot.helpers({
  atts: function(){
    return _.omit( this.atts, 'ui','slingshot','multi' );
  },
  config: function(){
    var t = Template.instance();
    return t._config;
  },
  accept: function(){
    // TODO add directive accepts
  },
  files: function(){
    var t = Template.instance();
    return t.afSlingshot.files();
  },
  summary: function(){
    var t = Template.instance();
    var files = t.afSlingshot.files();
    if( files.length === 0 ){
      return "Click to upload";
    }else if( files.length === 1 ){
      return files[0].name;
    }else{
      return files.length.toString() + " files uploaded";
    }
  },
  showList: function(){
    var t = Template.instance();
    return t.afSlingshot.files().length > 0 && !t._config.hideList;
  },
  progress: function(){ // From file scope
    var t = Template.instance();
    return t.afSlingshot.progress( this.uuid );
  },
  showTotalProgress: function(){
    var t = Template.instance();
    var progress = t.afSlingshot.progress( this.uuid );
    if( progress !== 0 && progress < 100 ){
      return true;
    }
  },
  round: function( val ){
    if( typeof( val ) === "number" ){
      return Math.round( val );
    }
  },
  src: function(){ // from file scope
    var t = Template.instance();
    return t.afSlingshot.src( this.name );
  },
  mimeClass: function(){ // from file scope
    var t = Template.instance();
    var mime = t.afSlingshot.mime( this.name );
    return mime.replace('/','-');
  }
});

Template.afSlingshot.events({
  'change .file-upload': function( e, t ){
    t.afSlingshot.add( e.target.files );
  },
  'click div[name="remove"]': function( e, t ){
    t.afSlingshot.remove( this.uuid );
  },
  'click *[name="afSlingshot-uploader"]': function(e,t){
    t.$('input[type="file"]').click();
  },
  'click .download-btn': function(e,t){
    e.stopPropagation();
    t.afSlingshot.download( this.name );
  }
});

/*
 *  BOOTSTRAP THEME
 */
Template.afSlingshot.copyAs('afSlingshot_bootstrap');
