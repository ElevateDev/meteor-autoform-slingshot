afSlingshot.Model = function(config, data, multi) {
  this._dep = new Deps.Dependency();

  var self = this;
  self._uploads = {};
  self._initConfig(config, multi);
  if (data) {
    _.each(_.uniq(_.keys(data)),function(filename) {
      var fileDirectives = _.filter(data, function(d) {
        return d[0].filename === filename;
      });

      self._uploads[ filename ] = new afSlingshot.FileRecord(
        fileDirectives[0],
        self._config
      );
    });
  }
};

// This takes settings and makes some inferences, so we don't have to do it later
afSlingshot.Model.prototype._initConfig = function(config, multi) {
  config = _.extend({},config);

  // if multi is undefined default it to true;
  multi = (multi === undefined) ? true : multi;

  if (multi) {
    _.defaults(config, {
      replaceOnChange: false
    });
  }else {
    _.defaults(config, {
      replaceOnChange: true
    });
  }

  this._config = config;
};

afSlingshot.Model.prototype.add = function(fsFiles) {
  var self = this;

  // Iterate through all directives and all files and upload them
  var files = {};
  _.each(fsFiles, function(fsFile) {
    files[ fsFile.name ] = new afSlingshot.FileRecord( fsFile, self._config, true );
  });

  if (this._config.replaceOnChange) {
    this._uploads = files;
  }else {
    this._uploads = _.extend(files, this._uploads);
  }
  this._dep.changed();
};

/*
 * Return progress of file upload.
 */
afSlingshot.Model.prototype.progress = function progress(name) {
  this._dep.depend();

  var self = this;
  var min;
  if (!name) {
    // If name wasn't defined, recurse and find min of al uploads
    min = _.min(_.map(self._uploads, function(v, k) {
      return v.progress();
    }));
    return min;
  }else if (self._uploads[name]) {
    return self._uploads[name].progress() * 100;
  }
};

afSlingshot.Model.prototype.remove = function(name) {
  delete this._uploads[ name ];
  this._dep.changed();
};

afSlingshot.Model.prototype.downloadAll = function() {
  this._dep.depend();
  var self = this;
  _.each(this.files(),function(f) {
    f.download();
  });
};

afSlingshot.Model.prototype.file = function(filename) {
  this._dep.depend();
  return this._uploads[ filename ];
};

afSlingshot.Model.prototype.files = function() {
  this._dep.depend();
  var files = _.map(this._uploads, function(v, k) {
    return v;
  });
  return files;
};

afSlingshot.Model.prototype.data = function() {
  this._dep.depend();
  var data = [];
  _.each(this._uploads, function(v) {
    data = data.concat(v.getData());
  });
  return data;
};

afSlingshot.Model.prototype.allowedFileTypes = function() {
  var firstDirective = this._config.directives[0];
  var restriction = Slingshot.getRestrictions( firstDirective.name );
  return restriction.allowedFileTypes;
};
