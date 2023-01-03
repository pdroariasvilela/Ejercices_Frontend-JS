angular.module('theme.venta', ['theme.core.services'])
  .controller('ventaController', ['$scope', '$controller', '$filter', '$sce', '$uibModal', '$bootbox', '$window', '$http', '$theme', '$log', '$timeout', 'uiGridConstants', 'pinesNotifications', 'hotkeys','blockUI', 
    'ventaServices',
    function($scope, $controller, $filter, $sce, $uibModal, $bootbox, $window, $http, $theme, $log, $timeout, uiGridConstants, pinesNotifications, hotkeys, blockUI,
      ventaServices
      ){
    'use strict';
    shortcut.remove("F2");
    $scope.modulo = 'venta';

  }])
  .service("ventaServices",function($http, $q) {
    return({
      sGenerarVentaCitas        : sGenerarVentaCitas,
      sValidarCitas             : sValidarCitas,
      sGenerarVentaCarrito      : sGenerarVentaCarrito,
      sCargarDataPago           : sCargarDataPago,
      sGenerarVentaCarritoPayMe : sGenerarVentaCarritoPayMe,
      sGenerarVentaCitasPayMe   : sGenerarVentaCitasPayMe,
      sGetRespuestaPayMe        : sGetRespuestaPayMe,
      sVerificarReCapcha        : sVerificarReCapcha,
    });
    function sGenerarVentaCitas(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"Venta/generar_venta_citas",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sValidarCitas(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"Venta/validar_citas",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sGenerarVentaCarrito(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"Venta/registro_venta_carrito",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sCargarDataPago(datos) {
      var request = $http({
            method  : "post",
            url     : angular.patchURLCI+"Venta/cargar_data_pago",
            data    : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sGenerarVentaCarritoPayMe(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"Venta/registro_venta_carrito_payme",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sGenerarVentaCitasPayMe(datos) {
      var request = $http({
        method  : "post",
        url     : angular.patchURLCI+"Venta/generar_venta_citas_payme",
        data    : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sGetRespuestaPayMe(datos) {
      var request = $http({
        method  : "post",
        url     : angular.patchURLCI+"Venta/get_respuesta_pay_me",
        data    : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sVerificarReCapcha(datos) {
      var request = $http({
        method  : "post",
        url     : angular.patchURLCI+"Venta/verificar_reCapcha",
        data    : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
  });
