afSlingshot.FileRecord = function(fileDirectiveObjects, config) {
  var self = this;
  if (fileDirectiveObjects === undefined || fileDirectiveObjects.length === 0) {
    throw new Meteor.Error('No file objects added');
  }
  if (fileDirectiveObjects === undefined || fileDirectiveObjects.length === 0) {
    throw new Meteor.Error('FileRecord config required');
  }

  // Set basic defaults for the fileRecord, basically set it to the values of the firest directive object
  _.defaults(self, fileDirectiveObjects[0]);

  // Reactive dict doesn't work for some reason
  self._data = {};
  self._dep = new Deps.Dependency();
  _.each(fileDirectiveObjects, function(obj) {
    self._data[ obj.directive ] = obj;
  });

  self._config = config;

  // There are 3 distinct modes for download.
  // Uploader present ( meaning just uploaded )
  // downloadUrl present ( likely meaning user has to auth from server )
  // otherwise just use raw src value
  // fetch a download url and save it in reactive variable
  self._downloadUrl = new ReactiveVar();
  if (self._config.downloadUrl && !self.uploader) {
    self._config.downloadUrl(self,function(resp) {
      self._downloadUrl.set(resp.src);
    });
  }
};

afSlingshot.FileRecord.prototype.setProp = function set(directive, key, val) {
  this._dep.changed();
  this._data[ directive ][ key ] = val;
};

afSlingshot.FileRecord.prototype.getProp = function set(directive, key) {
  this._dep.depend();

  return this._data[ directive ][ key ];
};

afSlingshot.FileRecord.prototype.getData = function get() {
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
