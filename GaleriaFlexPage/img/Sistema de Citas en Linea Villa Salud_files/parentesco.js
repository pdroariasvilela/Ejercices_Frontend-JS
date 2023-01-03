angular.module('theme.parentesco', ['theme.core.services'])
  .controller('parentescoController', ['$scope', '$sce', '$bootbox', '$window', '$http', '$theme', '$log', '$timeout', 'uiGridConstants', 'pinesNotifications', 'hotkeys', 
    'parentescoServices',
    function($scope, $sce, $bootbox, $window, $http, $theme, $log, $timeout, uiGridConstants, pinesNotifications, hotkeys, 
      parentescoServices
      ){
    'use strict';
    shortcut.remove("F2"); $scope.modulo = 'especialidad';


    /* ============================ */
    /* ATAJOS DE TECLADO NAVEGACION */
    /* ============================ */
    hotkeys.bindTo($scope)
      .add({
        combo: 'alt+n',
        description: 'Nueva especialidad',
        callback: function() {
          $scope.btnNuevo();
        }
      })
      .add ({ 
        combo: 'e',
        description: 'Editar especialidad',
        callback: function() {
          if( $scope.mySelectionGrid.length == 1 ){
            $scope.btnEditar();
          }
        }
      })
      .add ({ 
        combo: 'del',
        description: 'Anular especialidad',
        callback: function() {
          if( $scope.mySelectionGrid.length > 0 ){
            $scope.btnAnular();
          }
        }
      })
      .add ({ 
        combo: 'b',
        description: 'Buscar especialidad',
        callback: function() {
          $scope.btnToggleFiltering();
        }
      })
      .add ({ 
        combo: 's',
        description: 'Selección y Navegación',
        callback: function() {
          $scope.navegateToCell(0,0);
        }
      });
  }])
  .service("parentescoServices",function($http, $q) {
    return({
      sListarParentescoCbo: sListarParentescoCbo,     
    });

    function sListarParentescoCbo(datos) { 
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"parentesco/lista_parentesco_cbo", 
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
  });
