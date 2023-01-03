angular.module('theme.pariente', ['theme.core.services'])
  .controller('parienteController', ['$scope', '$controller', '$sce', '$uibModal', '$bootbox', '$window', '$http', '$theme', '$log', '$timeout', 'uiGridConstants', 'pinesNotifications', 'hotkeys', 'blockUI',
    'parienteServices',
    'parentescoServices',
    function($scope, $controller, $sce, $uibModal, $bootbox, $window, $http, $theme, $log, $timeout, uiGridConstants, pinesNotifications, hotkeys, blockUI,
     parienteServices,
     parentescoServices
    ){
    'use strict';
    shortcut.remove("F2");
    $scope.modulo = 'pariente';

    $scope.test = function(item){
      console.log("item", item);
    }
    $scope.listaSexos = [
      {id:'-', descripcion:'Seleccione Sexo'},
      {id:'F', descripcion:'FEMENINO'},
      {id:'M', descripcion:'MASCULINO'}
    ];

    var paginationOptions = {
      pageNumber: 1,
      firstRow: 0,
      pageSize: 10,
      sort: uiGridConstants.ASC,
      sortName: null,
      search: null
    };

    $scope.mySelectionGrid = [];

    $scope.gridOptions = {
      paginationPageSizes: [10, 50, 100, 500, 1000],
      paginationPageSize: 10,
      useExternalPagination: true,
      useExternalSorting: true,
      enableGridMenu: true,
      enableRowSelection: true,
      enableSelectAll: true,
      enableFiltering: true,
      enableFullRowSelection: true,
      multiSelect: true,
      columnDefs: [
        { field: 'idusuariowebpariente', name: 'idusuariowebpariente', displayName: 'ID', width: '8%',  sort: { direction: uiGridConstants.ASC} },
        { field: 'pariente', name: 'pariente', displayName: 'Pariente', },
        { field: 'parentesco', name: 'parentesco', displayName: 'Parentesco', width: '20%', },
        { field: 'sexo', name: 'sexo', displayName: 'Sexo', width: '12%', },
      ],
      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope,function(row){
          $scope.mySelectionGrid = gridApi.selection.getSelectedRows();
        });
        gridApi.selection.on.rowSelectionChangedBatch($scope,function(rows){
          $scope.mySelectionGrid = gridApi.selection.getSelectedRows();
        });

        $scope.gridApi.core.on.sortChanged($scope, function(grid, sortColumns) {
          if (sortColumns.length == 0) {
            paginationOptions.sort = null;
            paginationOptions.sortName = null;
          } else {
            paginationOptions.sort = sortColumns[0].sort.direction;
            paginationOptions.sortName = sortColumns[0].name;
          }
          $scope.refreshListaParientes();
        });
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
          paginationOptions.pageNumber = newPage;
          paginationOptions.pageSize = pageSize;
          paginationOptions.firstRow = (paginationOptions.pageNumber - 1) * paginationOptions.pageSize;
          $scope.refreshListaParientes();
        });
        $scope.gridApi.core.on.filterChanged( $scope, function(grid, searchColumns) {
          var grid = this.grid;
          paginationOptions.search = true;
          paginationOptions.searchColumn = {
            'idusuariowebpariente' : grid.columns[1].filters[0].term,
            "concat_ws(' ',  c.nombres, c.apellido_paterno, c.apellido_materno)" : grid.columns[2].filters[0].term,
            'cp.descripcion' : grid.columns[3].filters[0].term,
            'c.sexo' : grid.columns[4].filters[0].term,
          }
          $scope.refreshListaParientes();
        });
      }
    };

    paginationOptions.sortName = $scope.gridOptions.columnDefs[0].name;

    $scope.refreshListaParientes = function(){
      blockUI.start('Cargando familiares...');
      $scope.datosGrid = {
        paginate : paginationOptions
      };
      parienteServices.sListarParientes($scope.datosGrid).then(function (rpta) {
        console.log(rpta);
        $scope.gridOptions.totalItems = rpta.paginate.totalRows;
        $scope.gridOptions.data = rpta.datos;
        $scope.listaParientes = rpta.datos;
        blockUI.stop();
      });
      $scope.mySelectionGrid = [];
    };


    $scope.btnNuevoPariente = function(callback,ctrl){
		blockUI.start('Abriendo formulario...');
		$scope.fData = {};
		$scope.fData.sexo = '-';
		$scope.listatipodocumento = [
			{id: 'DNI', name: 'DNI'},
			{id: 'CE',  name: 'CARNET EXTRANJERIA'},
			{id: 'PAS', name: 'PASAPORTE'}
		];
		$scope.fData.tipo_documento = $scope.listatipodocumento[0].id;
		$scope.pDni = /^[0-9]{8}$/;

		$scope.cambiaTipoDoc = function(){
			if( $scope.fData.tipo_documento == 'DNI'){
				$scope.pDni = /^[0-9]{8}$/;
			}else{
				$scope.pDni = /^[A-Z0-9]*$/;
			}
		}
		$scope.accion ='reg';
		$scope.fAlert = {};
		$scope.fAlertFam = {};
		parentescoServices.sListarParentescoCbo().then(function(rpta){
			$scope.regListaParentescos = rpta.datos;
			$scope.regListaParentescos.splice(0,0,{ id : 0, idparentesco:0, descripcion:'Seleccione Parentesco'});
			$scope.fData.parentesco = $scope.regListaParentescos[0];
		});


		$uibModal.open({
			templateUrl: angular.patchURLCI+'Pariente/ver_popup_formulario',
			size: '',
			backdrop: 'static',
			keyboard:false,
			scope: $scope,
			controller: function ($scope, $modalInstance) {
				$scope.titleForm = 'Agregar Paciente';

				$scope.btnCancel = function(){
					if(callback){
					if(ctrl){
						if(ctrl.origen && ctrl.origen == 'componente'){
						ctrl.itemFamiliar = ctrl.listaFamiliares[0];
						}else{
						ctrl.fBusqueda.itemFamiliar = ctrl.listaFamiliares[0];
						}
					}else{
						$scope.fBusqueda.itemFamiliar = $scope.listaFamiliares[0];
					}
					}
					$modalInstance.dismiss('btnCancel');
				}
				// calendario fecha nacimiento
				var hoy = new Date();
				var d = hoy.getDate();
				var m = hoy.getMonth() + 1; //Month from 0 to 11
				var y = hoy.getFullYear();

				$scope.fData.max_fecha = '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
				$scope.seleccionaFecha = function(){
					console.log('max', $scope.fData.max_fecha);
					if (navigator.userAgent.indexOf("Firefox") != -1 && $scope.fData.fecha_nacimiento == null) {
						console.log('Firefox');
						$scope.fData.fecha_nacimiento = new Date(y,m,d)
					}
				}

				$scope.verificarDoc = function(){
					if(!$scope.fData.num_documento || $scope.fData.num_documento == null || $scope.fData.num_documento == ''){
					$scope.fAlert = {};
					$scope.fAlert.type= 'danger';
					$scope.fAlert.msg='Debe ingresar un Número de documento.';
					$scope.fAlert.strStrong = 'Error';
					$scope.fAlert.icon = 'fa fa-exclamation';
					return;
					}
					parienteServices.sVerificarParientePorDocumento($scope.fData).then(function (rpta) {
					var num_documento = $scope.fData.num_documento;
					var tipDocumento = $scope.fData.tipo_documento;
					var parentesco = $scope.fData.parentesco;

					$scope.fAlert = {};
					if( rpta.flag == 2 ){ //Cliente registrado en Sistema Hospitalario
						//var tipDocumento = $scope.fData.tipo_documento;
						$scope.fData = rpta.usuario;
						$scope.fData.tipo_documento = tipDocumento;
						$scope.fData.num_documento = num_documento;
						$scope.fData.parentesco = parentesco;
						$scope.fAlert.type= 'info';
						$scope.fAlert.msg= rpta.message;
						$scope.fAlert.icon= 'fa fa-smile-o';
						$scope.fAlert.strStrong = 'Genial! ';
					}else if( rpta.flag == 1 ){ // Usuario ya registrado en web
						//$scope.fData = rpta.usuario;
						$scope.fAlert.type= 'danger';
						$scope.fAlert.msg= rpta.message;
						$scope.fAlert.strStrong = 'Aviso! ';
						$scope.fAlert.icon = 'fa  fa-exclamation-circle';
					}else if(rpta.flag == 0){
						$scope.fAlert.type= 'warning';
						$scope.fAlert.msg= rpta.message;
						$scope.fAlert.strStrong = 'Aviso! ';
						$scope.fAlert.icon = 'fa fa-frown-o';
						$scope.fData = {};
						$scope.fData.num_documento = num_documento;
						$scope.fData.sexo = '-';
						$scope.fData.tipo_documento = tipDocumento;
						$scope.fData.parentesco = parentesco;
					}
					$scope.fAlert.flag = rpta.flag;
					});
				}

				$scope.btnRegistrarPariente = function (){
					if(ctrl && ctrl.origen && ctrl.origen == 'componente'){
						console.log('$scope.fData', $scope.fData);
					}else{
						$scope.sendEventChangeGA('FormularioRegistro','click', 'ClickRegistrarFormulario', 0);
					}
					$scope.crearAlerta = function(msg){
					$scope.fAlert = {};
					$scope.fAlert.type= 'danger';
					$scope.fAlert.msg= msg;
					$scope.fAlert.strStrong = 'Error';
					$scope.fAlert.icon = 'fa fa-exclamation';
					return;
					}
					if( $scope.fData.tipo_documento == ''){
						$scope.crearAlerta('Seleccione Tipo de documento.');
						return;
					}
					if(!$scope.fData.num_documento || $scope.fData.num_documento == null || $scope.fData.num_documento == ''){
						$scope.crearAlerta('Debe ingresar un Número de documento.');
						return;
					}

					if(!$scope.fData.parentesco.id || $scope.fData.parentesco.id == null || $scope.fData.parentesco.id == ''){
						$scope.crearAlerta('Debe seleccionar el parentesco.');
						return;
					}
					if($scope.fData.sexo =='-'){
						$scope.crearAlerta('Seleccione sexo.');
						return;
					}
					if(!$scope.fData.nombres || $scope.fData.nombres == null || $scope.fData.nombres == ''){
						$scope.crearAlerta('Debe ingresar nombre.');
						return;
					}

					if(!$scope.fData.apellido_paterno || $scope.fData.apellido_paterno == null || $scope.fData.apellido_paterno == ''){
						$scope.crearAlerta('Debe ingresar Apellido paterno.');
						return;
					}

					if(!$scope.fData.apellido_materno || $scope.fData.apellido_materno == null || $scope.fData.apellido_materno == ''){
						$scope.crearAlerta('Debe ingresar Apellido materno.');
						return;
					}


					if(!$scope.fData.fecha_nacimiento || $scope.fData.fecha_nacimiento == null || $scope.fData.fecha_nacimiento == ''){
						$scope.crearAlerta('Debe ingresar Fecha Nacimiento.');
						return;
					}
				
					blockUI.start('Registrando familiar...');
					parienteServices.sRegistrarPariente($scope.fData).then(function (rpta) {
					$scope.fAlert = {};
					$scope.fAlertFam = {};
					if(rpta.flag == 0){
						$scope.fAlert = {};
						$scope.fAlert.type= 'danger';
						$scope.fAlert.msg= rpta.message;
						$scope.fAlert.strStrong = 'Error';
						$scope.fAlert.icon = 'fa fa-exclamation';
					}else if(rpta.flag == 1){
						$scope.fData = {};
						$scope.fData.sexo = '-';
						$scope.fData.tipo_documento = 'DNI';
						$scope.fAlertFam.type= 'success';
						$scope.fAlertFam.msg= rpta.message;
						$scope.fAlertFam.icon= 'fa fa-smile-o';
						$scope.fAlertFam.strStrong = 'Genial! ';
						$scope.fAlertFam.flag = rpta.flag;
						if(callback){
						callback();
						}else{
						$scope.refreshListaParientes();
						$scope.btnCancel();
						}
						if(ctrl && ctrl.origen && ctrl.origen == 'componente'){
						console.log('Sin Notificaciones');
						}else{
						$scope.getNotificacionesEventos();
						}

						$scope.btnCancel();
					}
					$scope.fAlert.flag = rpta.flag;
					blockUI.stop();
					});
				}

				blockUI.stop();
			}
		});
    }

    $scope.btnEditarPariente = function(row){
      blockUI.start('Abriendo formulario...');
      $scope.fData = angular.copy(row);
	  $scope.fData.fecha_nacimiento = new Date(row.fecha_nacimiento);
      $scope.accion ='edit';
      $scope.regListaParentescos = angular.copy($scope.listaParentescos);
      $scope.regListaParentescos[0].descripcion = 'Seleccione Parentesco';

      angular.forEach($scope.regListaParentescos, function(value, key) {
        if(value.idparentesco == $scope.fData.idparentesco){
            $scope.fData.parentesco= $scope.regListaParentescos[key];
        }
      });


      $uibModal.open({
        templateUrl: angular.patchURLCI+'Pariente/ver_popup_formulario',
        size: '',
        backdrop: 'static',
        keyboard:false,
        scope: $scope,
        controller: function ($scope, $modalInstance) {
          $scope.titleForm = 'Editar Familiar';

          $scope.btnCancel = function(){
            $modalInstance.dismiss('btnCancel');
          }
			
          $scope.btnActualizarPariente = function (){
            blockUI.start('Editar familiar...');
            parienteServices.sActualizarPariente($scope.fData).then(function (rpta) {
              $scope.fAlert = {};
              $scope.fAlertFam = {};
              if(rpta.flag == 0){
                $scope.fAlert = {};
                $scope.fAlert.type= 'danger';
                $scope.fAlert.msg= rpta.message;
                $scope.fAlert.strStrong = 'Error';
                $scope.fAlert.icon = 'fa fa-exclamation';
              }else if(rpta.flag == 1){
                $scope.fData = {};
                $scope.fData.sexo = '-';
                $scope.fAlertFam.type= 'success';
                $scope.fAlertFam.msg= rpta.message;
                $scope.fAlertFam.icon= 'fa fa-smile-o';
                $scope.fAlertFam.strStrong = 'Genial! ';
                $scope.fAlertFam.flag = rpta.flag;
                $scope.refreshListaParientes();
                $scope.btnCancel();
              }
              $scope.fAlert.flag = rpta.flag;
              blockUI.stop();
            });
          }

          blockUI.stop();
        }
      });
    }

    $scope.btnEliminarPariente = function(row){
      blockUI.start('');
      $uibModal.open({
        templateUrl: angular.patchURLCI+'Pariente/ver_popup_aviso',
        size: 'sm',
        //backdrop: 'static',
        //keyboard:false,
        scope: $scope,
        controller: function ($scope, $modalInstance) {
          $scope.titleForm = 'Aviso';
          $scope.msj = '¿Estás seguro de realizar esta acción?';
          $scope.btnOk = function(){
            blockUI.start('Anulando familiar...');
            parienteServices.sEliminarPariente(row).then(function (rpta) {
              $scope.fAlert = {};
              if(rpta.flag == 0){
                $scope.fAlert = {};
                $scope.fAlert.type= 'danger';
                $scope.fAlert.msg= rpta.message;
                $scope.fAlert.strStrong = 'Error';
                $scope.fAlert.icon = 'fa fa-exclamation';
              }else if(rpta.flag == 1){
                $scope.fData = {};
                $scope.fData.sexo = '-';
                $scope.fAlert.type= 'success';
                $scope.fAlert.msg= rpta.message;
                $scope.fAlert.icon= 'fa fa-smile-o';
                $scope.fAlert.strStrong = 'Genial! ';
                $scope.refreshListaParientes();
              }
              $scope.fAlert.flag = rpta.flag;
              blockUI.stop();
            });
            $scope.btnCancel();
          }

          $scope.btnCancel = function(){
            $modalInstance.dismiss('btnCancel');
          }
          blockUI.stop();
        }
      });
    }

    $scope.btnGenerarCita = function(row){
      $scope.cargarItemFamiliar(row);
      $scope.goToUrl('/seleccionar-cita');
    }

    $scope.initPariente = function(){
      parentescoServices.sListarParentescoCbo().then(function(rpta){
        $scope.listaParentescos = rpta.datos;
        $scope.listaParentescos.splice(0,0,{ id : 0, idparentesco:0, descripcion:'--VER TODOS --'});
        $scope.fBusqueda.parentesco = $scope.listaParentescos[0];
      });

      $scope.cargarItemFamiliar(null);
      $scope.fBusqueda = {};
      $scope.refreshListaParientes();
    }
  }])
  .service("parienteServices",function($http, $q) {
    return({
        sListarParientes: sListarParientes,
        sListarParientesCbo:sListarParientesCbo,
        sVerificarParientePorDocumento: sVerificarParientePorDocumento,
        sRegistrarPariente:sRegistrarPariente,
        sActualizarPariente: sActualizarPariente,
        sEliminarPariente:sEliminarPariente,
    });
    function sListarParientes(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"pariente/lista_parientes",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sListarParientesCbo(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"pariente/lista_parientes_cbo",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sVerificarParientePorDocumento(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"pariente/verificar_pariente_por_documento",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sRegistrarPariente(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"pariente/registrar_pariente",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sActualizarPariente(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"pariente/editar_pariente",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }

    function sEliminarPariente(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"pariente/eliminar_pariente",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
  });
