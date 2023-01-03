function detallePromocionesCtrl (
  $log,
  localStorageService,
  detalleProductosCampServices,
  $location,
  blockUI,
  $rootScope,
  $controller,
  $scope,
  rootServices,
  culquiComponent,
  $uibModal,
  parienteServices
  ) {

  var $ctrl = this;

  $ctrl.params = {
    nameModule: 'Detalle de productos',
    obj_paquete: null,
    acepta: false
  };

  $ctrl.monto_culqi = '';

  $ctrl.verificar_fech = false;
  $ctrl.params.pago = false;
  $ctrl.modulo = 'campania';
  $ctrl.lista_productos = [];
  $ctrl.lista_fechas = [];
  $ctrl.list_fechas_arreg = [];

  // Session
  $ctrl.fSessionCI = {};
  $ctrl.fBusqueda = {};
  // Error respuesta
  $ctrl.error_respuesta = {};

  $ctrl.$onInit = function () {
    $ctrl.listarParientes = function(externo){
      parienteServices.sListarParientesCbo().then(function (rpta) {
        $ctrl.listaFamiliares = rpta.datos;
        $ctrl.listaFamiliares.splice(0,0,{ idusuariowebpariente:0,
                                            descripcion: $ctrl.fSessionCI.nombres + ' [TITULAR]',
                                            paciente: $ctrl.fSessionCI.paciente,
                                            edad:$ctrl.fSessionCI.edad,
                                            disabled:false
                                          });
        var linea ={
          idusuariowebpariente:null,
          descripcion: '───────────────────────',
          paciente: null,
          edad:null,
          disabled:true
        }
        $ctrl.listaFamiliares.push(linea);
        var comando = {
          idusuariowebpariente:-1,
          descripcion: 'AGREGAR PACIENTE',
          paciente: null,
          edad:null,
          disabled:false
        }
        $ctrl.listaFamiliares.push(comando);
        if(externo){
          console.log('entra del externo');
          $ctrl.fBusqueda.itemFamiliar = $ctrl.listaFamiliares[$ctrl.listaFamiliares.length-3];
        }else{
          $ctrl.fBusqueda.itemFamiliar = $ctrl.listaFamiliares[0];
        }

        if($ctrl.familiarSeleccionado){
          angular.forEach($ctrl.listaFamiliares, function(value, key) {
            if(value.idusuariowebpariente == $ctrl.familiarSeleccionado.idusuariowebpariente){
              $ctrl.fBusqueda.itemFamiliar = $ctrl.listaFamiliares[key];
            }
          });
        }
        console.log('$ctrl.listaFamiliares : ',$ctrl.listaFamiliares);
      });
    }
    $ctrl.cambiaFamiliar = function(){
      if($ctrl.fBusqueda.itemFamiliar.idusuariowebpariente == -1){
        $ctrl.btnAgregarNuevoPariente();
      }
    }
    $ctrl.btnAgregarNuevoPariente = function(){
      var callback = function(){
        $ctrl.listarParientes(true);
      }

      $controller('parienteController', {
        $scope : $scope
      });
      $scope.btnNuevoPariente(callback,$ctrl);
    }

    if (localStorageService.get('item_catalogo') != null && localStorageService.get('paquete_campania_id') != null) {
      $ctrl.item_catalogo = localStorageService.get('item_catalogo');
    } else {
      $ctrl.redirectToCatalogo();
    }

    $log.info('Detalle Paquete ID: '+localStorageService.get('paquete_campania_id')+' - Campaña Init Loaded...');
    blockUI.start('Cargando detalle de paquete');
    var params = {
      paquete_id: localStorageService.get('paquete_campania_id'),
      fecha_acceso: moment().format('YYYY-MM-DD')
    }
    detalleProductosCampServices.sLoadDetalleVentaProductCampania(params).then(function (response) {
      if (response.result === 0) {
        $ctrl.params.obj_paquete = response.data.obj_paquete;
        $ctrl.monto_culqi = response.data.monto_culqi;
        $ctrl.lista_productos = response.data.lista_productos;
        $ctrl.lista_fechas = response.data.array_fechas_atencion;

        angular.forEach(response.data.array_fechas_atencion, function (value, key) {
          this.push(moment(value.fecha).format('DD-MM-YYYY'));
        }, $ctrl.list_fechas_arreg);

        console.log('$ctrl.params.obj_paquete',$ctrl.params.obj_paquete);
        // Iniciar Culqui.
        var datos = {
          tipo: 'pago',
          idsedeempresaadmin: $ctrl.item_catalogo.id_sede_empresa_admin,
        };

        // Cargamos datos de session
        rootServices.sGetSessionCI().then(function (response) {
          if(response.flag == 1){
            $ctrl.fSessionCI = response.datos;
            $ctrl.listarParientes();
          }
        });

        // Cargamos las variables de entorno segun la sedeadmin
        rootServices.sGetConfig(datos).then(function(rpta){
          console.log('datos : ',rpta.datos);
          console.log('monto : ',$ctrl.monto_culqi);
          $ctrl.pasarela_pago = rpta.datos.PASARELA_PAGO;
          culquiComponent.culqui.load({
            key: rpta.datos.CULQI_PUBLIC_KEY,
            description: rpta.datos.DESCRIPCION_CARGO,
            amount: $ctrl.monto_culqi
          });
        });
        blockUI.stop();
      }
    });

    $log.info($ctrl.list_fechas_arreg);
  };

  // Al salir del formulario se dispara este evento
  $scope.$on('$destroy', function () {

    // Limpiamos caché no requerida.
    localStorageService.remove('paquete_campania_id');
    localStorageService.remove('item_catalogo');
    localStorageService.remove('CUSTOM_LOGIN_REDIRECT');
  });

  $ctrl.redirectToCatalogo = function () {
    $scope.goToUrl('/promociones');
  };

  $ctrl.verificarProductos = function () {
    var valido = false;

    angular.forEach($ctrl.lista_productos, function (value, key) {
      if (value.habilitar_calendario == true && value.prog_asistencial === true && (value.tipo_atencion_medica == 'P' || value.tipo_atencion_medica == 'CM' || value.tipo_atencion_medica == 'EA')) {
        if ((typeof value.obj_atencion === 'undefined' || value.obj_atencion == null)) {
          valido = true;
        }
      }
    });

    return valido;
  };

  $ctrl.verificarProductosProgAsist = function () {
    var valido = false;

    angular.forEach($ctrl.lista_productos, function (value, key) {
      if (value.prog_asistencial === true && (value.tipo_atencion_medica == 'P' || value.tipo_atencion_medica == 'CM' || value.tipo_atencion_medica == 'EA')) {
        valido = true;
      }
    });

    return valido;
  };

  $ctrl.btnValidarCodigo = () => {
    if(!$ctrl.params.obj_paquete.codigo){
      return false;
    }
    $ctrl.clase_codigo = 'text-danger';
    $ctrl.mensaje_codigo = '';
    // console.log('Codigo', $ctrl.params.obj_paquete.codigo);
    const data = {
      codigo: $ctrl.params.obj_paquete.codigo
    }
    detalleProductosCampServices.sValidarCodigo(data).then(
      (rpta) => {
        if(rpta.flag === 1){
          $ctrl.clase_codigo = 'text-success';
          $ctrl.params.obj_paquete.idcupon = rpta.data.idcupon;
        }
        else{
          $ctrl.clase_codigo = 'text-danger';
        }
        $ctrl.mensaje_codigo = rpta.message;
      }
    );
  }

  $ctrl.limpiarMsgCodigo = () => {
    $ctrl.mensaje_codigo = '';
  }
  /*===PARA PAY-ME===*/
  $ctrl.setData = function(){
    $ctrl.objitems = {};
    $ctrl.objitems.obj_paciente     = $ctrl.fBusqueda.itemFamiliar;
    $ctrl.objitems.obj_catalogo     = $ctrl.item_catalogo;
    $ctrl.objitems.obj_paquete      = $ctrl.params.obj_paquete;
    $ctrl.objitems.obj_session      = $ctrl.fSessionCI;
    $ctrl.objitems.lista_productos  = $ctrl.lista_productos;
    $ctrl.objitems.lista_fechas     = $ctrl.lista_fechas;
    $ctrl.objitems.monto_culqi      = $ctrl.monto_culqi;
  }
  $ctrl.resumenPago = function(response)
  {
    if (response.flag === 1) {
      localStorageService.set('resumen_pago', response);
      $scope.goToUrl('/promociones-resumen');
    } else {
      $ctrl.mostrarErrorRespuesta(response);
    }
  }
  /*================*/
  $ctrl.pagarPromocion = () => {
    $ctrl.params.pago = true;
    // PASARELA DE PAGO CULQI (DISPARAR EVENTO)
    $scope.sendEventChangeGA('BotonPagar','click', 'ComprarCampaña', 0);
    culquiComponent.culqui.pay()
      .then(function (token) {

        // Procesamos Pago en nuestro servidor.
        blockUI.start('Procesando solicitud, por favor espere y NO recargue la página...');

        detalleProductosCampServices.sProcesarCompraPaqueteCampania({
          token: token,
          obj_paciente: $ctrl.fBusqueda.itemFamiliar,
          obj_catalogo: $ctrl.item_catalogo,
          obj_paquete: $ctrl.params.obj_paquete,
          obj_session: $ctrl.fSessionCI,
          lista_productos: $ctrl.lista_productos,
          lista_fechas: $ctrl.lista_fechas,
          monto_culqi: $ctrl.monto_culqi
        }).then(function (response) {

          if (response.flag === 1) {
            localStorageService.set('resumen_pago', response.data);
            $scope.goToUrl('/promociones-resumen');
          } else {
            $ctrl.mostrarErrorRespuesta(response.data);
          }

          blockUI.stop();
        });
      }, function (error) {
        // Si es fallido pasa por acá
        $ctrl.mostrarErrorRespuesta(error);
      });
  };

  $ctrl.mostrarErrorRespuesta = function (objError) {
    var modalInstance = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'detalleRespuestaFallida',
      size: 'lg',
      controller: function (
        $scope,
        $modalInstance,
        $log,
        objError
        ) {

        var $ctrl = this;

        $scope.objError = objError;


        $scope.ok = function () {
         $modalInstance.close({objError: objError});
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      },
      controllerAs: 'modal',
      resolve: {
        objError: function () {
          return objError;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      // Enviamos valor al Model
      $ctrl.objError = selectedItem;
    },
    function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
}

function detalleProductosCampServices ($http, $q, localStorageService) {
  return ({
    sLoadDetalleVentaProductCampania: sLoadDetalleVentaProductCampania,
    sCargarListaSalaProductoAsistencial: sCargarListaSalaProductoAsistencial,
    sProcesarCompraPaqueteCampania: sProcesarCompraPaqueteCampania,
    sProcesarCompraPaqueteCampaniaPayme: sProcesarCompraPaqueteCampaniaPayme,
    sValidarCodigo: sValidarCodigo
  });

  function sProcesarCompraPaqueteCampania (data) {
    var request = $http({
      method : "post",
      url : angular.patchURLCI+"promociones/realizar_pago_paquete_campania",
      data: data
    });

    return (request.then(handleSuccess, handleError));
  }

  function sLoadDetalleVentaProductCampania (data) {
    var request = $http({
      method : "post",
      url : angular.patchURLCI+"promociones/mostrar_detalle_campania_promociones",
      data: data
    });

    return (request.then(handleSuccess, handleError));
  }

  function sCargarListaSalaProductoAsistencial (data) {
    var request = $http({
      method : "post",
      url : angular.patchURLCI+"promociones/listar_prog_asistencial_paquetes_por_promociones_p",
      data : data
      /* data: {
        lista_ids: data.ids
      } */
    });

    return (request.then(handleSuccess, handleError));
  }

  function sProcesarCompraPaqueteCampaniaPayme (data) {
    var request = $http({
      method : "post",
      url : angular.patchURLCI+"promociones/realizar_pago_paquete_campania_payme",
      data: data
    });
    return (request.then(handleSuccess, handleError));
  }
  function sValidarCodigo (data) {
    var request = $http({
      method : "post",
      url : angular.patchURLCI+"promociones/validar_codigo",
      data: data
    });
    return (request.then(handleSuccess, handleError));
  }
}

detallePromocionesCtrl.$inject = [
  '$log',
  'localStorageService',
  'detalleProductosCampServices',
  '$location',
  'blockUI',
  '$rootScope',
  '$controller',
  '$scope',
  'rootServices',
  'culquiComponent',
  '$uibModal',
  'parienteServices'
];

detalleProductosCampServices.$inject = [
  '$http',
  '$q',
  'localStorageService'
];

angular.module('theme.promocionesdetalle', [])
  .controller('detallePromocionesCtrl', detallePromocionesCtrl)
  .component('errorRepuestaDetalle', {
    templateUrl: 'detalleRespuestaFallida',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
    controller: function () {
      var $ctrl = this;

      $ctrl.$onInit = function () {
        $ctrl.objError = $ctrl.resolve.objError;
      };

      $ctrl.ok = function () {
        $ctrl.close({$value: $ctrl.objError});
      };

      $ctrl.cancel = function () {
        $ctrl.dismiss({$value: 'cancel'});
      };
    }
  })
  .service('detalleProductosCampServices', detalleProductosCampServices);
