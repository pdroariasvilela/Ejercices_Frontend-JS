function procedimientosCtrl (
  $log,
  $scope,
  $filter,
  $uibModal,
  blockUI,
  $bootbox,
  $routeParams,
  $location,
  culquiComponent,
  procedimientosServices,
  especialidadServices,
  programarCitaServices,
  localStorageService,
  rootServices
) {
  var $ctrl = this;

  $ctrl.fSessionCI = {}
  $ctrl.filters = [];
  $ctrl.resultProcedimientos = [];
  $ctrl.resultIndices = [];
  $ctrl.actualposition = 0;
  $ctrl.total_registros = 0;
  $ctrl.boolPaquetes = false;
  $ctrl.email = null;
  $ctrl.mensaje = '';
  $ctrl.busqueda = null;
  $ctrl.acepta = false;
  $ctrl.selectedEspecialidad = 0;
  $ctrl.selectedIdSede = 1;
  $ctrl.modulo = 'carrito';

//   console.log('modulo ', $routeParams.modulo);
//   console.log('segmento ', $routeParams.segmento);

  $ctrl.objItems = {
    cantidad : 0,
    total_pagar: '0.00',
    total_pago_culqi: '000'
  };
  $ctrl.patchURL = angular.patchURL;
  	$ctrl.$onInit = function () {
		if( angular.isDefined(localStorageService.get('objSede')) ){
			var objSede = localStorageService.get('objSede');
			console.log('objSede ',objSede);
			if( objSede != null ){
				$ctrl.selectedIdSede = objSede.id;
			}
		}
		if(!$routeParams.modulo){
			$location.path('/procedimientos/ves');

		}

		rootServices.sGetSessionCI().then(function (response) {
		if(response.flag == 1){
			$ctrl.fSessionCI = response.datos;
			if($ctrl.fSessionCI.compra.listaItems.length > 0){
				$ctrl.listaItems = $ctrl.fSessionCI.compra.listaItems;
				$ctrl.objItems.cantidad = $ctrl.fSessionCI.compra.listaItems.length;
				$ctrl.objItems.total_pagar = $ctrl.fSessionCI.compra.totales.total_pago;
				$ctrl.objItems.total_pago_culqi = $ctrl.fSessionCI.compra.totales.total_pago_culqi;
				if( angular.isUndefined($routeParams.modulo) ){
					$location.path('/procedimientos/' + objSede.alias)
				}

				console.log('Sesion COMPRA', $ctrl.fSessionCI.compra);
				if($ctrl.fSessionCI.compra.bool_videoconsulta == true){
					var data = {
						tipo: 0,
						titulo: "Aviso",
						mensaje : "Tiene una reserva VIRTUAL, no puede agregar otra PRESENCIAL."
					}
					$scope.mostrarMsj(data.tipo, data.titulo, data.mensaje);
					var ruta_origen = localStorageService.get('origen_path');
					console.log('NO SE PUEDE COMPRAR, REDIRECCIONA');
					console.log('origen_path', ruta_origen);
					$scope.goToUrl(ruta_origen);
				}else{
					localStorageService.set('origen_path', $location.path());
				}

			}else{
				$ctrl.fSessionCI.compra.listaItems = [];
				localStorageService.set('origen_path', $location.path());
			}
		}
		});
    	console.log('$ctrl.fSessionCI',$ctrl.fSessionCI);
  	}
  $ctrl.listaSedes = [
    { 'id' : 1, 'alias' : 'ves', 'sede' : 'VILLA EL SALVADOR', 'idsedeempresaadmin' : 7 },
    { 'id' : 3, 'alias' : 'lurin', 'sede' : 'LURIN TORRE 1', 'idsedeempresaadmin' : 9 },
    { 'id' : 6, 'alias' : 'lurin2', 'sede' : 'LURIN TORRE 2', 'idsedeempresaadmin' : 27 },
    { 'id' : 4, 'alias' : 'sjl', 'sede' : 'SAN JUAN DE LURIGANCHO', 'idsedeempresaadmin' : 15 }
  ]
  $ctrl.listaMeses = [
    { 'id': 1, 'mes': 'ENERO' },
    { 'id': 2, 'mes': 'FEBRERO' },
    { 'id': 3, 'mes': 'MARZO' },
    { 'id': 4, 'mes': 'ABRIL' },
    { 'id': 5, 'mes': 'MAYO' },
    { 'id': 6, 'mes': 'JUNIO' },
    { 'id': 7, 'mes': 'JULIO' },
    { 'id': 8, 'mes': 'AGOSTO' },
    { 'id': 9, 'mes': 'SEPTIEMBRE' },
    { 'id': 10, 'mes': 'OCTUBRE' },
    { 'id': 11, 'mes': 'NOVIEMBRE' },
    { 'id': 12, 'mes': 'DICIEMBRE' }
  ];
  var mes_actual = $filter('date')(new Date(),'M');
  $ctrl.mes = $ctrl.listaMeses[mes_actual-1]['mes'];
  $ctrl.params = {
    selectsede: null,
    selectesp: null,
    displayNoRecordsData: false
  };



  $ctrl.popoverAbierto = false;
  $ctrl.abrirCarrito = function(){
    $ctrl.pasarela_pago = $ctrl.fSessionCI.pasarela_pago;
    $ctrl.popoverAbierto = true;
    $ctrl.dynamicPopover.open();
  }
  $ctrl.cerrarCarrito = function(){
		$ctrl.popoverAbierto = false;
		if($ctrl.objItems.cantidad < 1){
			$ctrl.dynamicPopover.close();
		}else{
			setTimeout(function() {
				$ctrl.dynamicPopover.close();
			}, 500);
		}

  }
  $ctrl.dynamicPopover = {
    templateUrl: 'myPopoverTemplate.html',
    isOpenPopover: false,
    open: function () {
      	$ctrl.dynamicPopover.isOpenPopover = true;
    },
    close: function () {
		if($ctrl.popoverAbierto === false){
			$ctrl.acepta = false;
			$ctrl.dynamicPopover.isOpenPopover = false;
		}
    }
  };

/*   $ctrl.pag = {
    viewby: 8,
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 0,
    maxSize: 64
  }; */


	$ctrl.listarEspecialidades = function(){
		console.log('sede seleccionada', $ctrl.selectedSede);
		$ctrl.listaEspecialidadesCamp = [];
		// $ctrl.selectedEspecialidad = 0;
		var params = {
		'sede' : $ctrl.selectedSede
		}
		especialidadServices.sListarEspecialidadesProcedimientos(params).then(function (rpta) {
			$ctrl.listaEspecialidadesCamp = rpta.datos;
			$ctrl.listaEspecialidadesCamp.splice(0,0,{ id : '0', descripcion :'TODOS', segmento_amigable : ''});
			if( angular.isDefined(localStorageService.get('especialidad')) ){
				var especialidad = localStorageService.get('especialidad');
				if( especialidad != null ){
				angular.forEach($ctrl.listaEspecialidadesCamp, function(value, key){
					if(value.segmento_amigable == especialidad){
					// console.log('encontro esp ', $ctrl.listaEspecialidadesCamp[key]);
					$ctrl.selectedEspecialidad =  $ctrl.listaEspecialidadesCamp[key].id;
					}
				});
				}
			}else{
				$ctrl.selectedEspecialidad =  $ctrl.listaEspecialidadesCamp[0].id;
			}
			$ctrl.cargarProcedimientos();
		});
	}
  if (angular.isDefined($routeParams.modulo)) {
    var sede = $routeParams.modulo;
    console.log('param : ', $routeParams.modulo);
    $ctrl.boolPaquetes = true;
    angular.forEach($ctrl.listaSedes, function(value, key){
      if(value.alias == sede){
        $ctrl.selectedSede = value;

      }
    });
    localStorageService.set('objSede', $ctrl.selectedSede);
    if (angular.isDefined($routeParams.segmento)) {
      localStorageService.set('especialidad', $routeParams.segmento);
    }
    $ctrl.listarEspecialidades();
  }else{
    $ctrl.selectedSede = $ctrl.listaSedes[0];
  }

  $ctrl.cambiarSede = function(objSede){
    var sede = localStorageService.get('objSede');
    if( objSede.id == sede.id ){
      return;
    }
    console.log('objSede ',objSede);
    localStorageService.remove('especialidad');
    if( $ctrl.fSessionCI.compra ){
      if( $ctrl.fSessionCI.compra.listaItems.length > 0 ){
        console.log('tiene tickets');
        var pMensaje = 'Tiene tickets pendientes al cambiar de sede se eliminaran ¿Realmente desea realizar la acción?';
        $bootbox.confirm(pMensaje, function(result) {
          console.log('boot');
          if(result){
              console.log('eliminado');
              $ctrl.cart = {}
              var params = {
                carrito : $ctrl.cart,
                objSede : objSede
              }
              procedimientosServices.sActualizarListaItemsSession(params).then(function(rpta){
                if( rpta.flag == 1 ){
                  $ctrl.fSessionCI.compra.listaItems = rpta.datos.compra.listaItems;
                  $ctrl.objItems.cantidad = $ctrl.fSessionCI.compra.listaItems.length;
                  $ctrl.objItems.total_pagar = rpta.datos.compra.totales.total_pago;
                  $ctrl.objItems.total_pago_culqi = rpta.datos.compra.totales.total_pago_culqi;
                  localStorageService.set('objSede', objSede);
                  $ctrl.listarEspecialidades();
                }
              });
              console.log('$ctrl.selectedSede : ',$ctrl.selectedSede);
            }else{
              $ctrl.selectedSede = localStorageService.get('objSede');
          }
        });

      }else{
        localStorageService.set('objSede', objSede);
        $location.path('/procedimientos/'+ objSede.alias);
      }
    }else{
      localStorageService.set('objSede', objSede);
      $location.path('/procedimientos/'+objSede.alias);
    }
  }
  $ctrl.seleccionarSede = function(sede){

    $location.path('/procedimientos/'+sede)
    /* $ctrl.boolPaquetes = true;
    $ctrl.selectedSede = sede;
    localStorageService.set('sede', $ctrl.selectedSede);
    $ctrl.listarEspecialidades(); */
  }
  $ctrl.cambiaEspecialidad = function(item){
	console.log('item', item);
    var sede = localStorageService.get('objSede');
    var segmento = item.segmento_amigable;
    if( item.id == 0 ){
      console.log('CAMBIANDO A TODAS LAS ESPECIALIDADES...');
      localStorageService.remove('especialidad');
      $location.path('/procedimientos/'+ sede.alias);


    }else{
      console.log('CAMBIANDO DE ESPECIALIDAD...');
      // console.log('sede ',sede);
      // console.log('segmento ', segmento);
      $location.path('/procedimientos/'+ sede.alias + '/' +segmento);

    }
  }
  $ctrl.cargarProcedimientos = function () {
    blockUI.start('Cargando productos...');
    if (angular.isDefined($routeParams.modulo)) {
      var segmento = $routeParams.modulo;
      angular.forEach($ctrl.listaEspecialidadesCamp, function(value, key){
        if(value.segmento_amigable == segmento){
          $ctrl.selectedEspecialidad = value.id;
        }

      });
      console.log('param : ', $routeParams.modulo);
    }
    var params = {
      search: $ctrl.busqueda,
      sede_id: $ctrl.selectedSede.id,
      especialidad_id: $ctrl.selectedEspecialidad != '0' ? $ctrl.selectedEspecialidad : null,
    }

    procedimientosServices.sCargarProcedimientos(params).then(function (rpta) {
      $ctrl.widthScreen = screen.width;
      if (rpta.result === 1) {
        $ctrl.params.displayNoRecordsData = false;
        $ctrl.resultProcedimientos = rpta.data.lista_procedimientos;

        $ctrl.loadPag($ctrl.resultProcedimientos.length);

        if (screen.width < 1020) {
          // $(".checkout").addClass('scroll');
          var target_offset = $("#productos").offset();
          var target_top = target_offset.top - 180;
          $('html,body').animate({scrollTop:target_top},{duration:3000});

        }
      }

      if (rpta.result === 0) {
        $ctrl.resultProcedimientos = [];
        $ctrl.params.displayNoRecordsData = true;
      }

      blockUI.stop();
    });
  };
  /* $ctrl.actualizaListaItems = function(cart){
    console.log('carrito actual => ',cart );
  } */
  $ctrl.quitarDeLista = function(index){
    $ctrl.cart = angular.copy($ctrl.fSessionCI.compra.listaItems);

    if( angular.isDefined($ctrl.cart[index].iddetalleprogmedico) ){
      programarCitaServices.sLiberaCupoCarrito($ctrl.cart[index]).then(function(rpta){
        if(rpta.flag == 1){
          console.log(rpta.message);
        }
      });
    }

    $ctrl.cart.splice( index, 1 );
    console.log('$ctrl.cart: ', $ctrl.cart);
    var params = {
      carrito : $ctrl.cart
    }
    procedimientosServices.sActualizarListaItemsSession(params).then(function(rpta){
      if( rpta.flag == 1 ){
        $ctrl.fSessionCI.compra = rpta.datos.compra;
        $ctrl.objItems.total_pagar = rpta.datos.compra.totales.total_pago;
        $ctrl.objItems.total_pago_culqi = rpta.datos.compra.totales.total_pago_culqi;
        $ctrl.objItems.cantidad = $ctrl.fSessionCI.compra.listaItems.length;
      }
    });
  }
  $ctrl.redirectToPaqueteDetalle = function (id, obj) {
    localStorageService.set('especialidad', $ctrl.selectedEspecialidad);
    localStorageService.set('sede', $ctrl.selectedSede);
    localStorageService.set('paquete_campania_id', id);
    localStorageService.set('item_catalogo', obj);
    localStorageService.set('CUSTOM_LOGIN_REDIRECT', '/promociones');
    if($scope.fSessionCI.idusuario){
      console.log('session: ',$scope.fSessionCI);
      $scope.goToUrl('/promociones-detalle');
    }else{
      var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'modLogin',
        size: 'sm',
        scope: $scope,
        controller: function (
          $scope,
          $modalInstance,
          obj
          ) {

          var $ctrl = this;

          $scope.obj = obj;


          $ctrl.ok = function () {
            console.log('ir al login');
            $scope.goToUrl('/login');
            $modalInstance.close({obj: obj});
          };
        },
        controllerAs: 'modal',
        resolve: {
          obj: function () {
            return obj;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        // Enviamos valor al Model
        $ctrl.obj = selectedItem;
      },
      function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
      console.log('no session');
      // $scope.goToUrl('/login');
    }
  };
  $ctrl.redirectLogin = function(){
    $scope.goToUrl('/login');
  }

  $ctrl.redirectResumen = function(){
    var params = {
      carrito : {}
    }
    procedimientosServices.sActualizarListaItemsSession(params).then(function(rpta){
      if( rpta.flag == 1 ){
        $ctrl.fSessionCI.compra = rpta.datos.compra;
        $ctrl.objItems.total_pagar = rpta.datos.compra.totales.total_pago;
        $ctrl.objItems.total_pago_culqi = rpta.datos.compra.totales.total_pago_culqi;
        $ctrl.objItems.cantidad = $ctrl.fSessionCI.compra.listaItems.length;
        $scope.goToUrl('/compra-resumen');
      }
    });
  }

  $ctrl.regresar = function () {
    console.log('regreso al inicio ');
    localStorageService.remove('objSede');
    localStorageService.remove('especialidad');

    $ctrl.boolPaquetes = false;
    $scope.goToUrl('/atenciones-presenciales');
  };

  /* $ctrl.checkDoLoadInit = function () {
    if (angular.isUndefined($ctrl.params.selectsede) || $ctrl.params.selectsede === null) {
      $ctrl.busquedaInicial();
    }
  }; */

  $ctrl.loadPag = function (totalNums) {
    $ctrl.pag = {
      totalItems: totalNums,
      currentPage: 1,
      itemsPerPage: 40,
      maxSize: 5,
      boundaryLinkNumbers: true
    };
  };

  $ctrl.setPage = function (pageNo) {
    $ctrl.pag.currentPage = pageNo;
  };

  $ctrl.pageChanged = function () {
    $log.log('Page changed to: ' + $ctrl.pag.currentPage);
  };

  $ctrl.sedeChanged = function () {
    $scope.sendEventChangeGA('BuscarCampañaSede','click', $ctrl.params.selectsede.descripcion, 0);
  };

  $ctrl.especialidadChanged = function () {
    $scope.sendEventChangeGA('BuscarCampañaEspecialidad','click', $ctrl.params.selectesp.nombre, 0);
  };
  /*
    $ctrl.pagarCart = function () {
      console.log('pagando...');
      $ctrl.pago = true;
      // Cargamos las variables de entorno segun la sedeadmin
      var idsede = localStorageService.get('objSede');
      var sedeempresaadmin = null;
      if( idsede == 1 ){
        sedeempresaadmin = 8;
      }else if( idsede == 3 ){
        sedeempresaadmin = 9;
      }else if( idsede == 4 ){
        sedeempresaadmin = 15;
      }
      var datos = {
        tipo: 'pago',
        idsedeempresaadmin: sedeempresaadmin,
      };
      rootServices.sGetConfig(datos).then(function(rpta){
        console.log('datos : ',rpta.datos);
        console.log('monto : ',$ctrl.monto_culqi);
        culquiComponent.culqui.load({
          key: rpta.datos.CULQI_PUBLIC_KEY,
          description: rpta.datos.DESCRIPCION_CARGO,
          amount: $ctrl.monto_culqi
        });
      });
      // PASARELA DE PAGO CULQI (DISPARAR EVENTO)
      $scope.sendEventChangeGA('BotonPagar','click', 'ComprarProcedimiento', 0);
      culquiComponent.culqui.pay()
        .then(function (token) {
          console.log('token => ', token);
          // Procesamos Pago en nuestro servidor.
          blockUI.start('Procesando solicitud, por favor espere y NO recargue la página...');
          var params = {
            token: token,
            obj_paciente: $ctrl.itemFamiliar,
            obj_catalogo: $ctrl.item_catalogo,
            obj_paquete: $ctrl.params.obj_paquete,
            obj_session: $ctrl.fSessionCI,
            lista_productos: $ctrl.lista_productos,
            lista_fechas: $ctrl.lista_fechas,
            monto_culqi: $ctrl.monto_culqi
          }
          detalleProductosCampServices.sProcesarCompraPaqueteCampania(params).then(function (response) {

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
  */
}

function procedimientosServices ($http, $q) {
  return ({
    sCargarProcedimientos: sCargarProcedimientos,
    sRegistrarSubscripcion: sRegistrarSubscripcion,
    sActualizarListaItemsSession: sActualizarListaItemsSession,
    sCargarProcedimientosVirtuales: sCargarProcedimientosVirtuales,
  });


	function sCargarProcedimientos (attrs) {
		var request = $http({
		method : "post",
		url : angular.patchURLCI+"ProgramarProc/cargar_procedimientos_examenes",
		data: attrs
		});

		return (request.then( handleSuccess,handleError ));
	}
	function sRegistrarSubscripcion (attrs) {
		var request = $http({
		method : "post",
		url : angular.patchURLCI+"ProgramarProc/registrar_subscripcion",
		data: attrs
		});

		return (request.then( handleSuccess,handleError ));
	}
	function sActualizarListaItemsSession (attrs) {
		var request = $http({
		method : "post",
		url : angular.patchURLCI+"ProgramarProc/actualizar_lista_items_session",
		data: attrs
		});

		return (request.then( handleSuccess,handleError ));
	}
	function sCargarProcedimientosVirtuales (attrs) {
		var request = $http({
		method : "post",
		url : angular.patchURLCI+"ProgramarProc/cargar_procedimientos_virtuales",
		data: attrs
		});

		return (request.then( handleSuccess,handleError ));
	}
}

procedimientosCtrl.$inject = [
  '$log',
  '$scope',
  '$filter',
  '$uibModal',
  'blockUI',
  '$bootbox',
  '$routeParams',
  '$location',
  'culquiComponent',
  'procedimientosServices',
  'especialidadServices',
  'programarCitaServices',
  'localStorageService',
  'rootServices'
];

procedimientosServices.$inject = [
  '$http', '$q'
];

angular.module('theme.procedimientos', [])
  .controller('procedimientosCtrl', procedimientosCtrl)
  .service('procedimientosServices', procedimientosServices);
