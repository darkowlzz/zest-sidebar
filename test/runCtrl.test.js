describe('runCtrl', function () {
  var scope;

  beforeEach(module('zestApp'));

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    $controller('runCtrl', {$scope: scope});
  }));

  it('should have the methods', function () {
    expect(typeof (scope.openFile)).toBe('function');
    expect(typeof (scope.saveFile)).toBe('function');
  });
});
