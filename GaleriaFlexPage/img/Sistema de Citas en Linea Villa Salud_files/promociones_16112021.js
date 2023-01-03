function promocionesCtrl ($log, $scope, $filter, $uibModal, blockUI, promocionesServices, especialidadServices, localStorageService) {
  var $ctrl = this;
  // console.log('promociones esta desactivada');
  // return;
  $ctrl.filters = [];
  $ctrl.resultPaquetes = [];
  $ctrl.resultIndices = [];
  $ctrl.actualposition = 0;
  $ctrl.total_registros = 0;
  $ctrl.boolPaquetes = false;
  $ctrl.email = null;
  $ctrl.mensaje = '';
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

  // console.log('mes_actual : ',mes_actual);
  // $ctrl.mes = 'SEPTIEMBRE';
  $ctrl.mes = $ctrl.listaMeses[mes_actual-1]['mes'];
  $ctrl.params = {
    selectsede: null,
    selectesp: null,
    displayNoRecordsData: false
  };

  $ctrl.pag = {
    viewby: 8,
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 0,
    maxSize: 64
  };
  $ctrl.selectedEspecialidad = 0;

  $ctrl.$onInit = function () {
    if( !angular.isUndefined(localStorageService.get('sede')) ){
      var sede = localStorageService.get('sede');
      console.log('sede ',sede);
      if( sede != null ){
        $ctrl.seleccionarSede(sede)
      }

    }

  };
  $ctrl.listarEspecialidades = function(){
    $ctrl.listaEspecialidadesCamp = [];
    $ctrl.selectedEspecialidad = 0;
    var params = {
      'idsede' : $ctrl.selectedSede
    }

    especialidadServices.sListarEspecialidadesCampania(params).then(function (rpta) {
      $ctrl.listaEspecialidadesCamp = rpta.datos;
      $ctrl.listaEspecialidades = angular.copy(rpta.datos);
      $ctrl.listaEspecialidadesCamp.splice(0,0,{ id : '0', descripcion:'TODOS'});
      $ctrl.selectedEspecialidad =  $ctrl.listaEspecialidadesCamp[0].id;
      $ctrl.cargarCampanias();
      });
  }
  $ctrl.cambiarSede = function(){
    // $ctrl.selectedSede = value;
    console.log('$ctrl.selectedSede : ',$ctrl.selectedSede);
  }
  $ctrl.seleccionarSede = function(sede){
    console.log('sede : ', sede);
    $ctrl.boolPaquetes = true;
    $ctrl.selectedSede = sede;
    $ctrl.listarEspecialidades();
  }
  $ctrl.seleccionarEspecialidad = function(i){
    $ctrl.selectedEspecialidad = i.id;
    $ctrl.cargarCampanias();
  }
  $ctrl.busquedaInicial = function () {
    blockUI.start('Cargando catalogo de campañas');

    promocionesServices.sCargarCatalogosCampanias({
      todos: true,
      fecha_acceso: moment().format('YYYY-MM-DD')
    }).then(function (response) {
      if (response.result === 0) {
        $ctrl.params.displayNoRecordsData = false;
        $ctrl.resultPaquetes = response.data.lista_promociones;
        $ctrl.loadPag($ctrl.resultPaquetes.length);
      }

      if (response.result === 1) {
        $ctrl.resultPaquetes = [];
        $ctrl.params.displayNoRecordsData = true;
      }

      blockUI.stop();
    });
  };


  $ctrl.cargarCampanias = function () {
    if($ctrl.selectedEspecialidad == 0){
      $ctrl.resultPaquetes = [];
      localStorageService.remove('especialidad');
      return false;
    }
    blockUI.start('Cargando catalogo de campañas');
    var params = {
      todos: false,
      fecha_acceso: moment().format('YYYY-MM-DD'),
      // sede_id: $ctrl.params.selectsede.idsede,
      sede_id: $ctrl.selectedSede,
      // especialidad_id: $ctrl.params.selectesp != null ? $ctrl.params.selectesp.idespecialidad : null,
      especialidad_id: $ctrl.selectedEspecialidad != '0' ? $ctrl.selectedEspecialidad : null,
    }
    promocionesServices.sCargarCatalogosCampanias(params).then(function (rpta) {
      $ctrl.resultPaquetes = [];
      if (rpta.result === 0) {
        $ctrl.params.displayNoRecordsData = false;
        $ctrl.resultPaquetes = rpta.data.lista_promociones;
        $ctrl.loadPag($ctrl.resultPaquetes.length);
        if (screen.width < 1020 && params.especialidad_id > 0) {
          if (rpta.data.lista_promociones) {
            var target_offset = $("#products").offset();
            var target_top = target_offset.top;
            $('html,body').animate({scrollTop:target_top},{duration:3000});
          }
        }

      }

      if (rpta.result === 1) {
        $ctrl.resultPaquetes = [];
        $ctrl.params.displayNoRecordsData = true;
      }

      blockUI.stop();
    });
  };

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

  $ctrl.regresar = function () {
    localStorageService.remove('especialidad');
    if($ctrl.selectedEspecialidad > 0){
      $ctrl.resultPaquetes = [];
      $ctrl.selectedEspecialidad = 0;
      console.log('Regreso a todas las especialidades');
      return false;
    }
    console.log('regreso al inicio ');
    localStorageService.remove('sede');

    $ctrl.boolPaquetes = false;
  };

  $ctrl.checkDoLoadInit = function () {
    if (angular.isUndefined($ctrl.params.selectsede) || $ctrl.params.selectsede === null) {
      $ctrl.busquedaInicial();
    }
  };

  $ctrl.loadPag = function (totalNums) {
    $ctrl.pag = {
      totalItems: totalNums,
      currentPage: 1,
      itemsPerPage: 8,
      maxSize: 5
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

}

function promocionesServices ($http, $q) {
	return ({
		sCargarCatalogosCampanias: sCargarCatalogosCampanias,
		sDetallePromocionDetalle: sDetallePromocionDetalle,
		sRegistrarSubscripcion: sRegistrarSubscripcion,
		sCargarBanner: sCargarBanner,
		sCargarBannerPendientes: sCargarBannerPendientes,
	});

	function sDetallePromocionDetalle(attrs) {
		var request = $http({
		method: "post",
		url: angular.patchURLCI + "promociones/detalle_campanias_promociones",
		data: attrs
		});

		return (request.then(handleSuccess, handleError));
	}

	function sCargarCatalogosCampanias (attrs) {
		var request = $http({
		method : "post",
		url : angular.patchURLCI+"promociones/mostrar_campanias_promociones",
		data: attrs
		});

		return (request.then( handleSuccess,handleError ));
	}
	function sRegistrarSubscripcion (attrs) {
		var request = $http({
		method : "post",
		url : angular.patchURLCI+"promociones/registrar_subscripcion",
		data: attrs
		});

		return (request.then( handleSuccess,handleError ));
	}
	function sCargarBanner (attrs) {
		var request = $http({
		method : "post",
		url : angular.patchURLCI+"promociones/cargar_banner_aviso",
		data: attrs
		});

		return (request.then( handleSuccess,handleError ));
	}
  	function sCargarBannerPendientes (datos) {
		var request = $http({
			method : "post",
			url : angular.patchURLCI+"promociones/cargar_banner_pendientes",
			data: datos
		});
		return (request.then( handleSuccess,handleError ));
	}
}

promocionesCtrl.$inject = [
  '$log',
  '$scope',
  '$filter',
  '$uibModal',
  'blockUI',
  'promocionesServices',
  'especialidadServices',
  'localStorageService'
];

promocionesServices.$inject = [
  '$http', '$q'
];

angular.module('theme.promociones', [])
  .controller('promocionesCtrl', promocionesCtrl)
  .service('promocionesServices', promocionesServices);
