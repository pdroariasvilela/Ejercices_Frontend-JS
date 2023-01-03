// angular.appRoot =
angular
  .module('theme.core.navigation_controller', ['theme.core.services'])
  .controller('NavigationController', ['$scope', '$location', '$routeParams', '$timeout', 'hotkeys', '$document', 
    function($scope, $location, $routeParams, $timeout, hotkeys, $document) {
    'use strict';
    
    $scope.$watch('searchQuery', function(newVal, oldVal) {
      var currentPath = '#' + $location.path();
      if (newVal === '') {
        for (var i = $scope.highlightedItems.length - 1; i >= 0; i--) {
          if ($scope.selectedItems.indexOf($scope.highlightedItems[i]) < 0) {
            if ($scope.highlightedItems[i] && $scope.highlightedItems[i] !== currentPath) {
              $scope.highlightedItems[i].selected = false;
            }
          }
        }
        $scope.highlightedItems = [];
      } else
      if (newVal !== oldVal) {
        for (var j = $scope.highlightedItems.length - 1; j >= 0; j--) {
          if ($scope.selectedItems.indexOf($scope.highlightedItems[j]) < 0) {
            $scope.highlightedItems[j].selected = false;
          }
        }
        $scope.highlightedItems = [];
        highlightItems($scope.menu, newVal.toLowerCase());
      }
    });

    $scope.openNav = function(){
      var body = $document[0].getElementsByTagName("body");
      var div = document.createElement('div');    
      div.className += 'static-content-modal';           
      div.id = 'static-content-modal';           
      body[0].appendChild(div); 
      var d = $document[0].getElementById("SideNav");
      d.style.width = '300px';
      d.className += " open";
    }

    $scope.closeNav = function(){
      var body = $document[0].getElementsByTagName("body");
      var modal = $document[0].getElementById("static-content-modal");
      var garbage = body[0].removeChild(modal);
      var d = $document[0].getElementById("SideNav");
      d.style.width = '0px';
      d.className = d.className.replace('open','');
    }

    /* ================================= */
    /* ATAJOS DE TECLADO NAVEGACION MENU */
    /* ================================= */
    hotkeys.bindTo($scope)
      
  }]);