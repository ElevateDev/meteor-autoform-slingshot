describe('afSlingshot',function() {
  describe('add',function() {
    it('should pass config to new file objects',function(done) {
      var expected = {
        directives: ['expected'],
        someKey: 'expected',
        replaceOnChange: true
      };
      model = new afSlingshot.Model(expected);

      spyOn(afSlingshot, 'FileRecord').and.callFake(function(files, config) {
        expect(config).toEqual(expected);
        done();
      });

      spyOn(afSlingshot.Model.prototype, '_upload').and.returnValue({
        url: function() { return 'testUrl'; },
        file: {
          name: 'test',
          type: 'test',
          size: 3
        },
        isImage: function() { return false; }
      });

      model.add([{name: 'testFile'}]);
    });
  });
});
