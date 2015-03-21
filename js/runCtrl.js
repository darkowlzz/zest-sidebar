zestApp.controller('runCtrl', ['$scope', '$mdDialog', 'organizeZst',
  function ($scope, $mdDialog, organizeZst) {

    try {
    addon.port.on('RCV-IMPORT', function (z) {
      z = JSON.parse(z);
      console.log('imported zest');
      //console.log(z);
      $scope.list = [];
      console.log('starting to organize...');
      $scope.list = organizeZst(z.statements);

      $scope.$apply();
      console.log('NEW tree:', $scope.list);
    });
    } catch(e) {}

    $scope.openFile = function () {
      addon.port.emit('IMPORT');
    }

    $scope.saveFile = function () {
      addon.port.emit('SAVE');
    }

    $scope.printTree = function (ev) {
      console.log(JSON.stringify($scope.list, null, 2));

      $mdDialog.show(
        $mdDialog.alert()
          .title('This is an alert title')
          .content('Blah blah blah')
          .ok('Got it!')
          .targetEvent(ev)
      );
    };

    $scope.list = [{
        "id": 1,
        "title": "1. dragon-breath",
        "icon": "assert.png",
        "items": [],
      }, {
        "id": 2,
        "title": "2. moiré-vision",
        "icon": "request.png",
        "items": [{
          "id": 21,
          "title": "2.1. tofu-animation",
          "icon": "request.png",
          "items": [{
            "id": 211,
            "title": "2.1.1. spooky-giraffe",
            "icon": "request.png",
            "items": [{
              "id": 2111,
              "title": "2.1.1.1 OMG",
              "items": []
            }]
          }, {
            "id": 212,
            "title": "2.1.2. bubble-burst",
            "items": []
          }],
        }, {
          "id": 22,
          "title": "2.2. barehand-atomsplitting",
          "items": []
        }],
      }, {
        "id": 3,
        "title": "3. unicorn-zapper",
        "icon": "request.png",
        "items": []
      }, {
        "id": 4,
        "title": "4. romantic-transclusion",
        "items": []
      }];

    $scope.$watch('list', function (newValue, oldValue, $scope) {
      console.log('new Val is', newValue);
      $scope.list = newValue;
    }, true);

    $scope.selectedItem = {};

    $scope.options = {};

    $scope.remove = function(scope) {
      scope.remove();
    };

    $scope.toggle = function (scope) {
      console.log('toggling');
      scope.toggle();
    };

    $scope.newSubItem = function(scope) {
      var nodeData = scope.$modelValue;
      nodeData.items.push({
        id: nodeData.id * 10 + nodeData.items.length,
        title: nodeData.title + '.' + (nodeData.items.length + 1),
        items: []
      });
    };
  }
]);


zestApp.factory('organizeZst', function() {

  function getTitle (stmt) {
    var title, icon;
    switch (stmt.elementType) {
      case 'ZestComment':
        title = 'Comment: ' + stmt.comment;
        icon = 'comment.png';
        break;

      case 'ZestRequest':
        title = stmt.method + ' : ' + stmt.url;
        icon = 'request.png';
        break;

      case 'ZestConditional':
        title = 'IF : ';
        switch (stmt.rootExpression.elementType) {
          case 'ZestExpressionStatusCode':
            title += 'Status Code';
            break;

          case 'ZestExpressionLength':
            title += 'Length';
            break;

          case 'ZestExpressionRegex':
            title += 'Regex';
            break;

          case 'ZestExpressionURL':
            title += 'URL';
            break;

          case 'ZestExpressionEquals':
            title += 'Equals';
            break;

          case 'ZestExpressionResponseTime':
            title += 'Response Time';
            break;

          case 'ZestExpressionIsInteger':
            title += 'Integer';
            break;

          default:
            title += stmt.rootExpression.elementType;
        }
        break;

      case 'ZestAssignString':
        title = 'Assign ' + stmt.variableName + ' = ' + stmt.string;
        break;

      case 'ZestAssignRandomInteger':
        title = 'Assign ' + stmt.variableName + ' = ' +
                '(Form ' + stmt.fieldDefinition.formIndex + ' : ' +
                'Field ' + stmt.fieldDefinition.fieldName + ')';
        break;

      case 'ZestAssignRegexDelimiters':
        title = 'Assign ' + stmt.variableName + ' = ' +
                'regex(' + stmt.prefix + ' <-> ' + stmt.postfix + ')';
        break;

      case 'ZestAssignStringDelimiters':
        title = 'Assign ' + stmt.variableName + ' = ' +
                'string(' + stmt.prefix + ' <-> ' + stmt.postfix + ')';
        break;

      case 'ZestAssign':
        title = 'Assign ' + stmt.variableName + ' = ' +
                'rnd(' + stmt.minInt + ', ' + stmt.maxInt + ')';
        break;

      case 'ZestAssignReplace':
        title = 'Assign ' + stmt.variableName + ' replace ' +
                stmt.replace + ' with ' + stmt.replacement;
        break;

      case 'ZestActionPrint':
        title = 'Action - Print (' + stmt.message + ')';
        break;

      case 'ZestActionFail':
        title = 'Action - Fail (' + stmt.message + ')';
        break;

      case 'ZestAssertion':
        title = 'Assert - ';
        icon = 'assert.png';
        switch (stmt.rootExpression.elementType) {
          case 'ZestExpressionStatusCode':
            title += 'Status Code (' + stmt.rootExpression.code + ')';
            break;

          case 'ZestExpressionLength':
            title += 'Length (' + stmt.rootExpression.variableName +
                     ' = ' + stmt.rootExpression.length + ' +/- ' +
                     stmt.rootExpression.approx + '%)';
            break;

          case 'ZestExpressionRegex':
            title += stmt.rootExpression.variableName + ' Regex ' +
                     '(' + stmt.rootExpression.regex + ')';
            break;

          default:
            title += stmt.rootExpression.elementType;
        }

      default:
        title = stmt.elementType;
    }

    var tooltip = title;
    if (title.length > 40) {
      title = title.slice(0, 40) + '...';
    }
    return {
      title: title,
      tooltip: tooltip,
      icon: icon
    };
  }

  function getTitleExpression (expr) {
    var title;
    switch (expr.elementType) {
      case 'ZestExpressionURL':
        title = 'URL in (' + expr.includeRegexes + ') and not in (' +
                expr.excludeRegexes + ')';
        break;

      case 'ZestExpressionResponseTime':
        var symbol = expr.greaterThan ? '>' : '<';
        title = 'Response Time (' + symbol + ' ' + expr.timeInMs + ')';
        break;

      case 'ZestExpressionStatusCode':
        title = 'Status Code (' + expr.code + ')';
        break;

      case 'ZestExpressionLength':
        title = 'Length (' + expr.variableName + ' = ' + expr.length +
                ' +/- ' + expr.approx + '%)';
        break;

      case 'ZestExpressionEquals':
        title = expr.variableName + ' Equals (' + expr.value + ')';
        break;

      case 'ZestExpressionRegex':
        title = expr.variableName + ' Regex (' + expr.regex + ')';
        break;

      default:
        title = expr.elementType;
    }

    var tooltip = title;
    if (title.length > 40) {
      title = title.slice(0, 40) + '...';
    }
    return {
      title: title,
      tooltip: tooltip
    };
  }

  function organize (statements) {
    // root of statements
    var root = [];
    var aStmt;
    // iterate through the statements
    statements.forEach(function (stmt) {
      console.log('GOT TYPE:', stmt.elementType);
      var strings = getTitle(stmt);
      // create a tree node
      aStmt = {
        id: stmt.id,
        title: strings.title,
        tooltip: strings.tooltip,
        icon: strings.icon,
        items: [],
        stmt: stmt
      };
      // check for substatements
      if (! _.isUndefined(stmt.statements)) {
        if (! _.isEmpty(stmt.statements)) {
          aStmt.items = organize(stmt.statements);
        }
      } else if (stmt.elementType == 'ZestConditional') {
        var expStrings = getTitleExpression(stmt.rootExpression);
        var aCondn = {
          id: stmt.id + 'condn',
          title: expStrings.title,
          tooltip: expStrings.tooltip,
          items: []
        };
        aStmt.items.push(aCondn);
        if (! _.isEmpty(stmt.ifStatements)) {
          var ifNode = {
            id: stmt.id + 'A',
            title: 'THEN',
            items: []
          };
          ifNode.items = organize(stmt.ifStatements);
          aStmt.items.push(ifNode);
        }
        if (! _.isEmpty(stmt.elseStatements)) {
          var elseNode = {
            id: stmt.id + 'B',
            title: 'ELSE',
            items: []
          };
          elseNode.items = organize(stmt.elseStatements);
          aStmt.items.push(elseNode);
        }
      } else if (! _.isUndefined(stmt.assertions) &&
                 ! _.isEmpty(stmt.assertions)) {
        // FIX THIS HANDLE ASSERTION TITLING SEPARATELY
        aStmt.items = organize(stmt.assertions);
      }

      root.push(aStmt);
    });
    console.log('RETURNING:', root);
    return root;
  }

  return organize;
});
