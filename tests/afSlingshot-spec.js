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

      model.add([{name: 'testFile'}]);
    });  
  });
});
