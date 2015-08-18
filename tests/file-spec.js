describe('File',function() {
  describe('constructor',function() {
    it('should throw an error if empty',function() {
      expect(function() { new afSlingshot.FileRecord(); }).toThrow();
    });
    it('should default to the first passed file for it\'s values',function() {
    });
    it('should store all values for later query',function() {
    });

    it('should request and save downloadUrl if configured',function() {
      var expected = 'expectedURL';

      var f = new afSlingshot.FileRecord(
        [{directive: 'directive', filename: 'filename'}],
        {
          downloadUrl: function(obj, callback) {
            callback({src: expected});
          }
        }
      );
      expect(f._downloadUrl.get()).toBe(expected);
    });

    it(
      'should use the local downloadUrl if uploaded by current user',
      function() {
        var expected = 'expectedURL';

        var f = new afSlingshot.FileRecord(
          [{
            directive: 'directive',
            filename: 'filename',
            uploader: {url: function() { return expected; }}
          }],
          {
            downloadUrl: function(obj, callback) {
              callback({src: 'unexpected'});
            }
          }
        );
        expect(f.downloadUrl()).toBe(expected);
      }
    );
  });

  describe('getData',function() {
    it('returns all file directive versions',function() {
      var f = new afSlingshot.FileRecord([{
        directive: 'directive',
        filename: 'filename',
      }],{});
      expect(f.getData().length).toBe(1);
      expect(f.getData()[0]).toEqual({
        directive: 'directive',
        filename: 'filename'
      });
      expect(f.getData()[0].directive).toBe('directive');
      expect(f.getData()[0].filename).toBe('filename');
    });
  });

  describe('progress',function() {
    it('should return 1 for previously uploaded files',function() {
      var f = new afSlingshot.FileRecord([{
        directive: 'directive',
        filename: 'filename',
      }],{});
      expect(f.progress()).toBe(100);
    });
    it(
      'should return the minimum of all file directives for previously',
      function() {
        var f = new afSlingshot.FileRecord([{
          directive: 'directive',
          filename: 'filename',
          uploader: {progress: function() { return 0.5; }}
        }],{});
        expect(f.progress()).toBe(50);
      }
    );
  });

  describe('setProp',function() {
    it('should change property to the new value',function() {
      var f = new afSlingshot.FileRecord(
        [{directive: 'directive', filename: 'filename'}],
        {}
      );
      f.setProp('directive', 'src', 'test');
      expect(f.getData()[0].src).toBe('test');
    });
  });

  describe('download',function() {
    it('should use downloadUrl if defined',function(done) {
      var expected = 'expectedURL';

      var f = new afSlingshot.FileRecord(
        [{directive: 'directive', filename: 'filename'}],
        {
          downloadUrl: function(obj, callback) {
            callback({src: expected});
          }
        }
      );
      spyOn(window, 'open').and.callFake(function(src) {
        expect(src).toBe(expected);
        done();
      });
      f.download();
    });
  });
});

