angular
  .module('theme.redirectToPromociones', [])
  .controller('redirectToPromoCtrl', redirectToPromoCtrl);

  redirectToPromoCtrl.$inject = [
    '$log',
    'blockUI',
    '$scope',
    'promocionesServices',
    'localStorageService',
    '$routeParams',
    '$uibModal',
    '$rootScope',
    'rootServices'
  ];

  function redirectToPromoCtrl($log, blockUI, $scope, promocionesServices, localStorageService, $routeParams, $uibModal, $rootScope, rootServices) {
    var $ctrl = this;

    $ctrl.fAlert = {};

    $rootScope.authSession.check();

    // verificamos session
    $ctrl.miSession = $rootScope.authSession.auth;

    $ctrl.mostrarMsj = function (tipo, titulo, msg) {
     $uibModal.open({
       templateUrl: angular.patchURLCI + 'ProgramarCita/ver_popup_aviso',
       size: 'sm',
       backdrop: 'static',
       keyboard: false,
       scope: $scope,
       controller: function ($scope, $modalInstance) {
         $scope.titleForm = titulo;
         $scope.msj = msg;

         $scope.btnCancel = function () {
           $scope.goToUrl('/login');
           $modalInstance.dismiss('btnCancel');
         }

         if (tipo == 2) {
           setTimeout(function () {
             $scope.btnCancel();
           }, 40000);
         }
       }
     });
   }

    if (angular.isDefined($routeParams.modulo)) {
      $scope.id = $routeParams.modulo;
      /*if ($ctrl.miSession) {

              promocionesServices.sDetallePromocionDetalle({
                paquete_id: $routeParams.modulo
              }).then(function (response) {
                if (response.flag === 1) {

                  console.log('promocionesServices.sDetallePromocionDetalle.if == 1 (ir al paquete)', response.data);

                  localStorageService.set('paquete_campania_id', $routeParams.modulo);
                  localStorageService.set('item_catalogo', response.data);

                  $scope.goToUrl('/promociones-detalle');
                }

                if (response.flag === 0) {
                  console.log('promocionesServices.sDetallePromocionDetalle.if == 0 (ir al promociones)', response.data);
                  $ctrl.mostrarMsj(2, 'Fallido', 'Paquete no existe, o no disponible');
                  //blockUI.stop();
                  $scope.goToUrl('/promociones');
                }


              }, function (err) {

              }); */

      // INICIAMOS VERIFICACION DE SESION DEL REDIRECT
      rootServices.sGetSessionCI().then(function (response) {
        if (response.flag === 1) {
          promocionesServices.sDetallePromocionDetalle({
            paquete_id: $scope.id
          }).then(function (response) {
            if (response.flag === 1) {

              console.log('promocionesServices.sDetallePromocionDetalle.if == 1 (ir al paquete)', response.data);

              localStorageService.set('paquete_campania_id', $scope.id);
              localStorageService.set('item_catalogo', response.data);

              $scope.goToUrl('/promociones-detalle');
            }

            if (response.flag === 0) {
              	console.log('promocionesServices.sDetallePromocionDetalle.if == 0 (ir al promociones)', response.data);
              	$ctrl.mostrarMsj(2, 'Fallido', 'Paquete no existe, o no disponible');
              	//blockUI.stop();
				//   $scope.goToUrl('/promociones');
				$location.path() == '/login'
            }


          }, function (err) {

          });
        }

        if (response.flag === 0) {
          localStorageService.set('paquete_campania_id_session', $scope.id);
          localStorageService.set('CUSTOM_LOGIN_REDIRECT', '/promociones-detalle');
          console.log('en session no activa y se procederá a redireccionar login para que ingrese sus credenciales');
          $scope.goToUrl('/login');
        }
      }, function (err) {
        //
      });
    } else {
      blockUI.stop();
      console.log('PAQUETE NO SELECCIONADO');

      $ctrl.mostrarMsj(2, 'Fallido', 'Paquete no seleccionado.');
    }

  }