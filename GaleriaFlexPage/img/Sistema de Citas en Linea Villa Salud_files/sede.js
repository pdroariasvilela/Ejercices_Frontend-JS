angular.module('theme.sede', ['theme.core.services'])
  .controller('sedeController', ['$scope', '$theme', '$filter', 'sedeServices',  
    function($scope, $theme, $filter, sedeServices ){
      'use strict';
      shortcut.remove("F2"); 
      $scope.modulo = 'sede';       
  }])
  .service("sedeServices",function($http, $q) {
    return({
        sListarSedesCbo:sListarSedesCbo
    });

    function sListarSedesCbo(datos) { 
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"sede/lista_sedes_cbo", 
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
  });