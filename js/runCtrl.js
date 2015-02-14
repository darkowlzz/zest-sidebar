zestApp.controller('runCtrl', function ($scope) {

  $scope.openFile = function () {
    addon.port.emit('IMPORT');
  }

  $scope.saveFile = function () {
    addon.port.emit('SAVE');
  }
});
