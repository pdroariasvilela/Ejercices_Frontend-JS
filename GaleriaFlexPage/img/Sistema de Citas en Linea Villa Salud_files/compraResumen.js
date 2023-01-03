function compraResumenController(
    $log,
    $scope,
    localStorageService,
    $location,
    $uibModal,
    ModalReporteFactory,
    rootServices,
    blockUI
    ) {

    var $ctrl = this;

    $ctrl.$onInit = function () {
    $log.info('Resumen de la transaccion.');
    $ctrl.mostrarPopupExitoso = function(){
        var modalInstance = $uibModal.open({
            animation : true,
            templateUrl : angular.patchURLCI+'ProgramarCita/ver_popup_compra_exitosa',
            size: 'lg',
            scope : $scope,
            controller: function($modalInstance,$scope){
                console.log('dir Image => ', $scope.dirImages);
                $scope.btnCancel = function(){
                    $modalInstance.dismiss('btnCancel');
                }
                setTimeout(function() {
                // var callback = function(){
                    $scope.btnCancel();
                // }
                callback();
                }, 3000);
            }
        });

        modalInstance.result.then(function (selectedItem) {
            // Enviamos valor al Model
            $ctrl.objError = selectedItem;
        },
        function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }

    $ctrl.habilitaBanner = false;
    if (localStorageService.get('resumen_pago') != null) {
        rootServices.sGetSessionCI().then(function (response) {
            if(response.flag == 1){
              $ctrl.fSessionCI = response.datos;
              $ctrl.habilitaBanner = true;
            }
        });
        $ctrl.obj_resumen = angular.copy(localStorageService.get('resumen_pago'));
        $ctrl.mostrarPopupExitoso();
        localStorageService.remove('resumen_pago');
    } else {
        $ctrl.redirectListado();
    }
    // $ctrl.list_fechas_arreg = [];

    // angular.forEach($ctrl.obj_resumen.obj_peticion.lista_fechas, function (value, key) {
    //   this.push(moment(value.fecha).format('DD-MM-YYYY'));
    // }, $ctrl.list_fechas_arreg);

    // $ctrl.obj_resumen.list_fechas_arreg = $ctrl.list_fechas_arreg;
    };

    $scope.$on('$destroy', function () {
        // Limpiamos caché al salir
        localStorageService.remove('resumen_pago');
    });

    $ctrl.redirectListado = function () {
        $scope.goToUrl('/procedimientos');
    };

    $ctrl.verDescargarReporte = function () {
        blockUI.start('Cargando comprobante...');

        var arrParams = {
            titulo: 'COMPROBANTE DE COMPRA',
            datos: {
                id_venta: $ctrl.obj_resumen.result_venta.idventa
            },
            metodo: 'php'
        };

        arrParams.url = angular.patchURLCI+'Venta/ver_imprimir_comprobante_por_idventa';
        ModalReporteFactory.getPopupReporte(arrParams);

        blockUI.stop();
    };

    /* $ctrl.verificarLeyendasProductos = function () {
        var valido = false;

        angular.forEach($ctrl.obj_resumen.obj_peticion.lista_productos, function (value, key) {
            if (value.habilitar_calendario == true && value.prog_asistencial === false && value.tipo_atencion_medica == 'P') {
            valido = true;
            }

            if (value.habilitar_calendario == false && value.prog_asistencial === false && value.tipo_atencion_medica == 'P') {
            valido = true;
            }
        });

        return valido;
    }; */
}

compraResumenController.$inject = [
  '$log',
  '$scope',
  'localStorageService',
  '$location',
  '$uibModal',
  'ModalReporteFactory',
  'rootServices',
  'blockUI'
];

angular.module('theme.compraResumenController', [])
  .controller('compraResumenController', compraResumenController);
