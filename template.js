/*
 * The internal data structure used throughout afSlingshotImpl for data is 
 * {
 *   filename(key): [
 *    {
 *      directive: directive,
 *      src: src,
 *      filename: filename,
 *      uploader: uploader, // optional, present if uploaded currently
 *      type: mimeType
 *    }
 *   ]
 * }
 */
afSlingshot = {};
afSlingshot.FileRecord = function( fileDirectiveObjects, config ){
  var self = this;
  if( fileDirectiveObjects === undefined || fileDirectiveObjects.length === 0 ){ throw new Meteor.Error("No file objects added"); }

  _.defaults( self, fileDirectiveObjects[0] );
  
  self._data = {};  // ReactiveDict clears functions for some damn reason
  self._dep = new Deps.Dependency();
  _.each( fileDirectiveObjects, function( obj ){
    self._data[ obj.directive ] = obj;
  });

  self._config = config;
};

afSlingshot.FileRecord.prototype.setProp = function set( directive, key, val ){
  this._dep.changed();
  this._data[ directive ][ key ] = val;
};

afSlingshot.FileRecord.prototype.getProp = function set( directive, key ){
  this._dep.depend();

  return this._data[ directive ][ key ];
};

afSlingshot.FileRecord.prototype.getData = function get( ){
  this._dep.depend();

  var self = this;
  var data = _.map( self._data, function(v,k){
    return self._data[ k ];
  });
  return data;
};

afSlingshot.FileRecord.prototype.progress = function(){
  this._dep.depend();

  var min = _.min( this.getData(), function( file ){
    if( file.uploader ){
      if( file.uploader.progress ){
        return file.uploader.progress();
      }else{
        return 0;
      }
    }else{ 
      return 1;
    }
  });
  if( min.uploader ){
    if( min.uploader.progress ){
      return min.uploader.progress() * 100;
    }else{
      return 0;
    }
  }else{
    return 100;
  }
};

afSlingshot.FileRecord.prototype.download = function(){
  if( this._config && this._config.downloadUrl ){
    this._config.downloadUrl(this,function( resp ){
      window.open( resp.src );
    });
  }else{
    window.open( this.src );
  }
};


afSlingshotImpl = function( config, data, multi ){
  this._dep = new Deps.Dependency();

  var self = this;
  self._uploads = {};
  self._initConfig( config, multi );
  if( data ){
    _.each( _.uniq( _.keys( data ) ),function( filename){
      var fileDirectives = _.filter( data, function( d ){
        return d[0].filename === filename;
      });
      self._uploads[ filename ] = new afSlingshot.FileRecord(  fileDirectives[0], self._config );  
    });
  }
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

// Takes a single file and a single directive
afSlingshotImpl.prototype._upload = function upload( file, directive, uploaderCallback ){
  var self = this;
  var uploader = new Slingshot.Upload( directive.name );

  // Save directive name to uploader object, since it's not avaliable
  uploader.directive = directive.name; 

  if( directive.onBeforeUpload ){
    directive.onBeforeUpload( file, function( file ){
      uploader.send( file, uploaderCallback );
    });
  }else{
    uploader.send( file, uploaderCallback );
  }
  return uploader;
};

afSlingshotImpl.prototype._fileFromUploader = function( u ){
  var f = {
    src: u.url(),
    filename: u.file.name,
    type: u.file.type,
    size: u.file.size,
    isImage: u.isImage()
  };
  return f;
};

// TODO rewrite.  Not a fan of all the side effects
afSlingshotImpl.prototype.add = function( fsFiles ){
  var self = this;

  // Iterate through all directives and all files and upload them
  var files = {};
  _.each( fsFiles, function( fsFile ){
    var fileDirectives = [];
    _.each( self._config.directives, function( directive ){
      // callback is needed to get the key, and finalized url
      var filename = fsFile.name;
      var u = self._upload( fsFile, directive, function( err, downloadUrl ){
        if( err ){ console.error( err ); }

        var file = self._uploads[ filename ];
        file.setProp( directive.name, 'src', downloadUrl );
        file.setProp( directive.name, 'key', _.findWhere( u.instructions.postData, {name: "key"}).value );
      });
       
      var fileObj = self._fileFromUploader(u);
      fileObj.directive = directive.name;
      fileObj.uploader = u;
      fileDirectives.push( fileObj );
    });

    files[ fsFile.name ] = new afSlingshot.FileRecord( fileDirectives, this._config );
  });

  if( this._config.replaceOnChange ){  
    this._uploads = files;
  }else{
    this._uploads = _.extend( files, this._uploads );
  }
  this._dep.changed();
};

/*
 * Return progress of file upload.
 */
afSlingshotImpl.prototype.progress = function progress( name ){
  this._dep.depend();

  var self = this;
  var min;
  if( !name ){
    // If name wasn't defined, recurse and find min of al uploads
    min = _.min( _.map(self._uploads, function(v,k){
      return v.progress( );
    }));
    return min;
  }else if( self._uploads[name] ){
    return self._uploads[name].progress() * 100;
  }
};

afSlingshotImpl.prototype.remove = function( name ){
  delete this._uploads[ name ];
  this._dep.changed();
};

afSlingshotImpl.prototype.download = function( name ){
  this._dep.depend();
  var self = this;
  if( name ){
    var file = this._uploads[ name ];
    file.download();
  }else{
    _.each(this.files(),function( f ){
      f.download( );
    });
  }
};

afSlingshotImpl.prototype.file = function( filename ){
  this._dep.depend();
  return this._uploads[ filename ];
};

afSlingshotImpl.prototype.files = function( ){
  this._dep.depend();
  var files = _.map( this._uploads, function( v,k ){ 
    return v; 
  });
  return files;
};

afSlingshotImpl.prototype.data = function(){
  this._dep.depend();
  var data = [];
  _.each( this._uploads, function(v){ 
    data = data.concat( v.getData() ); 
  });
  return data;
};



var hackySlingshotStorage = {};  // TODO WTF? autoform.  Seriously no way to get an instance variable in valueOut?
SimpleSchema.messages({uploadInProgress: "Upload in progress"});
AutoForm.addInputType("slingshot", {
  template: "afSlingshot",
  valueOut: function( ){
    var afSlingshot = hackySlingshotStorage[ this.attr('data-schema-key') ];
    var validationContext = AutoForm.getValidationContext();
    
    var val;
    if( this.attr('data-multiple') ){
      val = afSlingshot.data();
    }else{
      val =  afSlingshot.data()[0];
    }

    // validate
    if( afSlingshot.progress() < 100 ){
      validationContext.addInvalidKeys([{
        name: this.attr("data-schema-key"), 
        type: "uploadInProgress",
        value: val
      }]);
    }else{
      return val;
    }
  },
  valueConverters: {
    "string": function(val){
      return val.src;
    }
  },
  valueIn: function( val ){
    if( typeof(val) === 'undefined' || val === "" || val === null ){ return; }
    
    var data = {};
    if( typeof( val ) === "string" ){
      var f = {
        src: val,
        filename: val,
        key: val
      };
      data[ f.filename ] = [ f ];
    }else if( !_.isArray(val) ){
      data[ val.filename] = [_.extend({},val)];
    }else{
      _.each( val, function( file ){
        if( data[ file.filename ] === undefined ){
          data[ file.filename ] = [];
        }
        data[ file.filename ].push(_.extend({},file));
      });
    }
    return data;
  }
});

Template.afSlingshot.onCreated(function(){
  this.afSlingshot = new afSlingshotImpl( this.data.atts.slingshot, this.data.value, this.data.atts.multi );
  hackySlingshotStorage[ this.data.atts['data-schema-key'] ] = this.afSlingshot;  // Seriously... fuck you

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
      return files[0].filename;
    }else{
      return files.length.toString() + " files uploaded";
    }
  },
  showList: function(){
    var t = Template.instance();
    return t.afSlingshot.files().length > 0 && !t._config.hideList;
  },
  progressAll: function(){
    var t = Template.instance();
    return t.afSlingshot.progress();
  },
  showTotalProgress: function(){
    var t = Template.instance();
    var progress = t.afSlingshot.progress();
    if( progress !== 0 && progress < 100 ){
      return true;
    }
  },
  round: function( val ){
    if( typeof( val ) === "number" ){
      return Math.round( val );
    }
  },
  mimeClass: function(){ // from file scope
    var t = Template.instance();
    if( this.type ){
      return this.type.replace('/','-');
    }
  }
});

Template.afSlingshot.events({
  'change .file-upload': function( e, t ){
    t.afSlingshot.add( e.target.files );
  },
  'click div[name="remove"]': function( e, t ){
    t.afSlingshot.remove( this.filename );
  },
  'click *[name="afSlingshot-uploader"]': function(e,t){
    t.$('input[type="file"]').click();
  },
  'click .download-btn': function(e,t){
    e.stopPropagation();
    if( this.download ){
      this.download();
    }else{
      t.afSlingshot.download();
    }
  }
});

/*
 *  BOOTSTRAP THEME
 */
Template.afSlingshot.copyAs('afSlingshot_bootstrap');
