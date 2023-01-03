function resumenPagoPromociones(
  $log,
  $scope,
  localStorageService,
  ModalReporteFactory,
  rootServices,
  blockUI
) {

  var $ctrl = this;
  // blockUI.start('Cargando resumen de compra...');

  // blockUI.stop();
  $ctrl.$onInit = function () {
    $log.info('Resumen de la transaccion.');
    if (localStorageService.get('resumen_pago') != null) {
      $ctrl.obj_resumen = localStorageService.get('resumen_pago');
      $ctrl.habilitaBanner = false;
      rootServices.sGetSessionCI().then(function (response) {
        if (response.flag == 1) {
          $ctrl.fSessionCI = response.datos;
          $ctrl.habilitaBanner = true;
        }
      });
    } else {
      $ctrl.redirectCampanias();
    }
    $ctrl.list_fechas_arreg = [];
    angular.forEach($ctrl.obj_resumen.obj_peticion.lista_fechas, function (value, key) {
      this.push(moment(value.fecha).format('DD-MM-YYYY'));
    }, $ctrl.list_fechas_arreg);
    $ctrl.obj_resumen.list_fechas_arreg = $ctrl.list_fechas_arreg;

  };


  $scope.$on('$destroy', function () {
    // Limpiamos caché al salir
    localStorageService.remove('resumen_pago');
  });
  $ctrl.redirectCampanias = function () {
    $scope.goToUrl('/promociones');
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
    arrParams.url = angular.patchURLCI + 'Promociones/ver_imprimir_comprobante_desde_id_venta';
    ModalReporteFactory.getPopupReporte(arrParams);
    blockUI.stop();
  };
  $ctrl.descargaFacturaCitaCampania = function () {
    blockUI.start('Cargando boleta electrónica...');
    var arrParams = {
      titulo: 'BOLETA ELECTRÓNICA',
      datos: {
        id_venta: $ctrl.obj_resumen.result_venta.idventa
      },
      metodo: 'php'
    };
    arrParams.url = angular.patchURLCI + 'Promociones/imprimir_pdf_factura_cita';
    ModalReporteFactory.getPopupReporte(arrParams);
    blockUI.stop();
  };
  $ctrl.verificarLeyendasProductos = function () {
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
  };
}
resumenPagoPromociones.$inject = [
  '$log',
  '$scope',
  'localStorageService',
  'ModalReporteFactory',
  'rootServices',
  'blockUI'
];
angular.module('theme.resumenpagopromociones', [])
  .controller('resumenPagoPromociones', resumenPagoPromociones);
