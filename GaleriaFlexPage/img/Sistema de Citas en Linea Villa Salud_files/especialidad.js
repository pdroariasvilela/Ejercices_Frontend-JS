angular.module('theme.especialidad', ['theme.core.services'])
  .controller('especialidadController', ['$scope', '$sce', '$bootbox', '$window', '$http', '$theme', '$log', '$timeout', 'uiGridConstants', 'pinesNotifications', 'hotkeys',
    'especialidadServices',
    function($scope, $sce, $bootbox, $window, $http, $theme, $log, $timeout, uiGridConstants, pinesNotifications, hotkeys,
      especialidadServices  ){
    'use strict';
    shortcut.remove("F2");
    $scope.modulo = 'especialidad';


  }])
  .service("especialidadServices",function($http, $q) {
    return({
        sListarEspecialidadesProgAsistencial: sListarEspecialidadesProgAsistencial,
        sListarEspecialidadesCampania: sListarEspecialidadesCampania,
        sListarEspecialidadesProcedimientos: sListarEspecialidadesProcedimientos,
        sListarEspecialidadesProcVirtuales: sListarEspecialidadesProcVirtuales,
        sCargarFechasDisponibles: sCargarFechasDisponibles,
    });

    function sListarEspecialidadesProgAsistencial (datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"especialidad/lista_especialidades_prog_asistencial",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }

    function sListarEspecialidadesCampania (datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"especialidad/lista_especialidades_campania",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }

    function sListarEspecialidadesProcedimientos (datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"especialidad/lista_especialidades_procedimiento",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }

    function sListarEspecialidadesProcVirtuales (datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"especialidad/lista_especialidades_proc_virtuales",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }

    function sCargarFechasDisponibles (datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"especialidad/lista_fechas_disponibles",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
  });
