// Kind of using 2 different modes for file param.  Ugly.
afSlingshot.FileRecord = function(file, config, newUpload) {
  var self = this;
  if ( !file ) {
    throw new Meteor.Error('No file given');
  }
  
  self._config = _.extend( {},config );
  self._data = {};
  self._dep = new Deps.Dependency();
  self._downloadUrl = new ReactiveVar();


  if( newUpload ){
    _.each(self._config.directives, function(directive) {
      self._upload( file, directive );
    });
  }else{
    _.each(file, function(obj) {
      if( !self._defaultSet ){
        self._setDefault( obj );
      }
      self._data[ obj.directive ] = obj;
    });
  }
};

afSlingshot.FileRecord.prototype._setDefault = function(f){
  var self = this;
  _.defaults(self, f);
  self._defaultSet = true;
  
  if (self._config.downloadUrl) {
    self._config.downloadUrl(self,function(resp) {
      self._downloadUrl.set(resp.src);
    });
  }

  self._dep.changed();
};

afSlingshot.FileRecord.prototype._registerDirectiveUpload = function( u, directive ){
  var f = {
    src: u.url(),
    filename: u.file.name,
    type: u.file.type,
    size: u.file.size,
    uploader: u,
    directive: directive.name
  };

  this._data[ directive.name ] = f;
  if( !this._defaultSet ){
    this._setDefault( f );
  }
};

afSlingshot.FileRecord.prototype._upload = function(file, directive, callback){
  var self = this;
  var uploader = new Slingshot.Upload(directive.name);

  // Save directive name to uploader object, since it's not avaliable
  uploader.directive = directive.name;

  var uploaderCallback = function(err, downloadUrl) {
    if (err) { console.error(err); }

    self._setProp(directive.name, 'src', downloadUrl);
    self._setProp(
      directive.name,
      'key',
      _.findWhere(uploader.instructions.postData, {name: 'key'}).value
    );
    self._dep.changed();
  }

  if (directive.onBeforeUpload) {
    directive.onBeforeUpload(file, function(err, file) {
      if( err ){ console.error( err ); }
      uploader.send(file, uploaderCallback);
      self._registerDirectiveUpload( uploader, directive );
    });
  }else {
    uploader.send(file, uploaderCallback);
    self._registerDirectiveUpload( uploader, directive );
  }
}

afSlingshot.FileRecord.prototype._setProp = function(directive, key, val) {
  this._data[ directive ][ key ] = val;
};

afSlingshot.FileRecord.prototype.getData = function() {
  this._dep.depend();

  var self = this;
  var data = _.map(self._data, function(v, k) {
    return self._data[ k ];
  });
  return data;
};

afSlingshot.FileRecord.prototype.progress = function() {
  this._dep.depend();

  var min = _.min(this.getData(), function(file) {
    if (file.uploader) {
      if (file.uploader.progress) {
        return file.uploader.progress();
      }else {
        return 0;
      }
    }else {
      return 1;
    }
  });
  if (min.uploader) {
    if (min.uploader.progress) {
      return min.uploader.progress() * 100;
    }else {
      return 0;
    }
  }else {
    return 100;
  }
};

// There are 3 distinct modes for download.
// Uploader present ( meaning just uploaded )
// downloadUrl present ( likely meaning user has to auth from server )
// otherwise just use raw src value
// fetch a download url and save it in reactive variable
afSlingshot.FileRecord.prototype.downloadUrl = function() {
  if (this.uploader) {
    return this.uploader.url();
  }if (this._config.downloadUrl) {
    return this._downloadUrl.get();
  }else {
    return this.src;
  }
};

afSlingshot.FileRecord.prototype.downloadAvaliable = function() {
  if (this._config.downloadUrl && !this.uploader) {
    return this._downloadUrl.get() !== undefined;
  }else {
    return true;
  }
};

afSlingshot.FileRecord.prototype.download = function() {
  if (this.downloadAvaliable()) {
    return window.open(this.downloadUrl());
  }else {
    console.error('Attempted to download file before download url was set.');
  }
};

afSlingshot.FileRecord.prototype.isImage = function() {
  return Boolean(this.type && this.type.split("/")[0] === "image");
};
