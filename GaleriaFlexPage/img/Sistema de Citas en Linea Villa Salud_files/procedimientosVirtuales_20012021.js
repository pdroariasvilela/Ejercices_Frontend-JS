function procedimientosVirtualesCtrl (
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
  $ctrl.boolPaquetes = true;
  $ctrl.email = null;
  $ctrl.mensaje = '';
  $ctrl.busqueda = null;
  $ctrl.acepta = false;
  $ctrl.selectedEspecialidad = 0;
  $ctrl.selectedIdSede = 3;
  $ctrl.modulo = 'carrito';

  console.log('modulo ', $routeParams.modulo);
  console.log('segmento ', $routeParams.segmento);


  $ctrl.objItems = {
    cantidad : 0,
    total_pagar: '0.00',
    total_pago_culqi: '000'
  };
  $ctrl.patchURL = angular.patchURL;
  $ctrl.$onInit = function () {
    // if( angular.isDefined(localStorageService.get('objSede')) ){
    //   var objSede = localStorageService.get('objSede');
    //   console.log('objSede ',objSede);
    //   if( objSede != null ){
    // $ctrl.selectedIdSede = objSede.id;
    //   }
    // }

    rootServices.sGetSessionCI().then(function (response) {
      if(response.flag == 1){
        $ctrl.fSessionCI = response.datos;
        if($ctrl.fSessionCI.compra.listaItems.length > 0){
          $ctrl.listaItems = $ctrl.fSessionCI.compra.listaItems;
          $ctrl.objItems.cantidad = $ctrl.fSessionCI.compra.listaItems.length;
          $ctrl.objItems.total_pagar = $ctrl.fSessionCI.compra.totales.total_pago;
          $ctrl.objItems.total_pago_culqi = $ctrl.fSessionCI.compra.totales.total_pago_culqi;
        //   if( angular.isUndefined($routeParams.modulo) ){
        //     $location.path('/procedimientos-virtuales/' + objSede.alias)
        //   }
			if($ctrl.fSessionCI.compra.bool_videoconsulta == false){
				var data = {
					tipo: 0,
					titulo: "Aviso",
					mensaje : "Tiene reservas PRESENCIALES, no puede agregar reservas VIRTUALES."
				}
				$scope.mostrarMsj(data.tipo, data.titulo, data.mensaje);
				var ruta_origen = localStorageService.get('origen_path');
				console.log('NO SE PUEDE COMPRAR, REDIRECCIONA');
				console.log('origen_path', ruta_origen);
				$scope.goToUrl(ruta_origen);
			}else{
				localStorageService.set('origen_path', $location.path());
	  			localStorageService.set('objSede', $ctrl.listaSedes[1]); // lurin
			}
        }else{
        	$ctrl.fSessionCI.compra.listaItems = [];
			localStorageService.set('origen_path', $location.path());
  			localStorageService.set('objSede', $ctrl.listaSedes[1]); // lurin
        }
      }
    });

    console.log('$ctrl.fSessionCI',$ctrl.fSessionCI);
  }
  $ctrl.listaSedes = [
    { 'id' : 1, 'alias' : 'ves', 'sede' : 'VILLA EL SALVADOR', 'idsedeempresaadmin' : 7 },
    { 'id' : 3, 'alias' : 'lurin', 'sede' : 'LURIN', 'idsedeempresaadmin' : 9 },
    { 'id' : 4, 'alias' : 'sjl', 'sede' : 'SAN JUAN DE LURIGANCHO', 'idsedeempresaadmin' : 15 }
  ]

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
		console.log('Cargando Especialidades');
		$ctrl.listaEspecialidadesCamp = [];

		especialidadServices.sListarEspecialidadesProcVirtuales().then(function (rpta) {
			$ctrl.listaEspecialidadesCamp = rpta.datos;
			$ctrl.listaEspecialidadesCamp.splice(0,0,{ id : '0', descripcion :'TODOS', segmento_amigable : ''});
			if( angular.isDefined(localStorageService.get('especialidad')) ){
				var especialidad = localStorageService.get('especialidad');
				if( especialidad != null ){
				angular.forEach($ctrl.listaEspecialidadesCamp, function(value, key){
					if(value.segmento_amigable == especialidad){
					console.log('encontro esp ', $ctrl.listaEspecialidadesCamp[key]);
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
	$ctrl.listarEspecialidades();
	if(angular.isDefined($routeParams.modulo)){
		localStorageService.set('especialidad', $routeParams.modulo);
	}

	$ctrl.cambiaEspecialidad = function(item){
		// var sede = localStorageService.get('objSede');
		var segmento = item.segmento_amigable;
		if( item.id == 0 ){
			console.log('CAMBIANDO A TODAS LAS ESPECIALIDADES...');
			localStorageService.remove('especialidad');
			$location.path('/procedimientos-virtuales');

		}else{
			console.log('CAMBIANDO DE ESPECIALIDAD...');
			// console.log('sede ',sede);
			// console.log('segmento ', segmento);
			$location.path('/procedimientos-virtuales/'+segmento);

		}
	}

	$ctrl.cargarProcedimientos = function () {
		blockUI.start('Cargando productos...');
		/* if (angular.isDefined($routeParams.modulo)) {
			var segmento = $routeParams.modulo;
			angular.forEach($ctrl.listaEspecialidadesCamp, function(value, key){
				if(value.segmento_amigable == segmento){
				$ctrl.selectedEspecialidad = value.id;
				}

			});
			console.log('param : ', $routeParams.modulo);
		} */
		var params = {
			search: $ctrl.busqueda,
			sede_id: $ctrl.selectedIdSede,
			especialidad_id: $ctrl.selectedEspecialidad != '0' ? $ctrl.selectedEspecialidad : null,
		}
		procedimientosServices.sCargarProcedimientosVirtuales(params).then(function (rpta) {

			if (rpta.result === 1) {
				$ctrl.params.displayNoRecordsData = false;
				$ctrl.resultProcedimientos = rpta.data.lista_procedimientos;

				$ctrl.loadPag($ctrl.resultProcedimientos.length);

				if (screen.width < 1020) {

					var target_offset = $("#productos").offset();
					var target_top = target_offset.top;
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
				controller: function ($scope,$modalInstance,obj) {
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
		// localStorageService.remove('objSede');
		localStorageService.remove('especialidad');

		$ctrl.boolPaquetes = false;
		$scope.goToUrl('/procedimientos');
	};

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


}



procedimientosVirtualesCtrl.$inject = [
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

angular.module('theme.procedimientosVirtuales', [])
  .controller('procedimientosVirtualesCtrl', procedimientosVirtualesCtrl);
