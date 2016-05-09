describe('Server tests', function () {
  var server = meteor();

  it('should write that the server is alive', function () {
    return server.execute(function () { console.log('I am alive!'); });
  });



});
