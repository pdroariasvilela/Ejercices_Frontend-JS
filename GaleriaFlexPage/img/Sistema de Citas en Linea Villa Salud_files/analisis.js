angular.module('theme.analisis', ['theme.core.services'])
  .controller('analisisController', ['$scope', '$sce', '$modal', '$bootbox', '$window', '$http', '$theme', '$log', '$timeout', 'uiGridConstants', 'pinesNotifications', 'hotkeys','analisisServices','seccionServices','metodoServices',
    function($scope, $sce, $modal, $bootbox, $window, $http, $theme, $log, $timeout, uiGridConstants, pinesNotifications
      , hotkeys, analisisServices,seccionServices,metodoServices
      ){
    'use strict';
    var paginationOptions = {
      pageNumber: 1,
      firstRow: 0,
      pageSize: 10,
      sort: uiGridConstants.ASC,
      sortName: null,
      search: null
    };
    $scope.mySelectionGrid = [];
    $scope.btnToggleFiltering = function(){
      $scope.gridOptions.enableFiltering = !$scope.gridOptions.enableFiltering;
      $scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
    };
    $scope.navegateToCell = function( rowIndex, colIndex ) {
      $scope.gridApi.cellNav.scrollToFocus( $scope.gridOptions.data[rowIndex], $scope.gridOptions.columnDefs[colIndex]);
    };
    $scope.gridOptions = {
      paginationPageSizes: [10, 50, 100, 500, 1000],
      paginationPageSize: 10,
      useExternalPagination: true,
      useExternalSorting: true,
      useExternalFiltering : true,
      enableGridMenu: true,
      enableRowSelection: true,
      enableSelectAll: true,
      enableFiltering: false,
      enableFullRowSelection: true,
      multiSelect: false,

      columnDefs: [
        { field: 'id', name: 'idanalisis', displayName: 'ID', maxWidth: 80,  sort: { direction: uiGridConstants.ASC} },
        { field: 'seccion', name: 'descripcion_sec', displayName: 'Sección',maxWidth: 200},
        { field: 'descripcion', name: 'descripcion_anal', displayName: 'Analisis' },
        { field: 'abreviatura', name: 'abreviatura', displayName: 'Abreviatura',maxWidth: 100 },
        { field: 'idproductomaster', name: 'idproductomaster', displayName: 'Cod Prod',maxWidth: 100 },
        { field: 'producto', name: 'producto', displayName: 'Producto' },
        { field: 'metodo', name: 'descripcion', displayName: 'Método' },
        { field: 'estado', type: 'object', name: 'estado_anal', displayName: 'Estado', maxWidth: 250, enableFiltering: false,
          cellTemplate:'<label style="box-shadow: 1px 1px 0 black; margin: 6px auto; display: block; width: 120px;" class="label {{ COL_FIELD.clase }} ">{{ COL_FIELD.string }}</label>' }
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
          //console.log(sortColumns);
          if (sortColumns.length == 0) {
            paginationOptions.sort = null;
            paginationOptions.sortName = null;
          } else {
            paginationOptions.sort = sortColumns[0].sort.direction;
            paginationOptions.sortName = sortColumns[0].name;
          }
          $scope.getPaginationServerSide();
        });
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
          paginationOptions.pageNumber = newPage;
          paginationOptions.pageSize = pageSize;
          paginationOptions.firstRow = (paginationOptions.pageNumber - 1) * paginationOptions.pageSize;
          $scope.getPaginationServerSide();
        });
        $scope.gridApi.core.on.filterChanged( $scope, function(grid, searchColumns) {
            var grid = this.grid;
            paginationOptions.search = true;
            // console.log(grid.columns);
            // console.log(grid.columns[1].filters[0].term);
            paginationOptions.searchColumn = {
              'idanalisis' : grid.columns[1].filters[0].term,
              'descripcion_sec' : grid.columns[2].filters[0].term,
              'descripcion_anal' : grid.columns[3].filters[0].term,
              'abreviatura' : grid.columns[4].filters[0].term,
              'pm.idproductomaster' : grid.columns[5].filters[0].term,
              'pm.descripcion' : grid.columns[6].filters[0].term
              
            }
            $scope.getPaginationServerSide();
          });

      }
    };
    paginationOptions.sortName = $scope.gridOptions.columnDefs[0].name;
    $scope.getPaginationServerSide = function() {
      $scope.datosGrid = {
        paginate : paginationOptions
      };
      analisisServices.sListaranalisis($scope.datosGrid).then(function (rpta) {
        $scope.gridOptions.totalItems = rpta.paginate.totalRows;
        $scope.gridOptions.data = rpta.datos;
      });
      $scope.mySelectionGrid = [];
    };
    $scope.getPaginationServerSide();

    /* ============= */
    /* MANTENIMIENTO */
    /* ============= */
    $scope.btnEditar = function (size) {
      $modal.open({
        templateUrl: angular.patchURLCI+'analisis/ver_popup_formulario',
        size: size || '',
        backdrop: 'static',
        keyboard:false,
        controller: function ($scope, $modalInstance,mySelectionGrid,getPaginationServerSide) {
          $scope.mySelectionGrid = mySelectionGrid;
          $scope.getPaginationServerSide = getPaginationServerSide;
          $scope.fData = {};
          
          if( $scope.mySelectionGrid.length == 1 ){
            $scope.fData = $scope.mySelectionGrid[0];
          }else{
            alert('Seleccione una sola fila');
          }
          $scope.titleForm = 'Edición de Análisis';
           // SECCIONES
          seccionServices.sListarseccionCbo().then(function (rpta) {
            $scope.listaSeccion = rpta.datos;
          });
          console.log($scope.fData);
          // METODOS
           metodoServices.sListarMetodoCbo().then(function (rpta) {
            $scope.listaMetodo = rpta.datos;
            // $scope.listaMetodo.splice(0,0,{ id : '', descripcion:'--Seleccione Método--'});
            // $scope.fData.idmetodo = $scope.listaMetodo[0].id;
          });
          $scope.getProductoAutocomplete = function (value) {
            var params = {
              search: value,
              sensor: false
            }
            return analisisServices.sListarProductosLaboratorioAuto(params).then(function(rpta) { 
              $scope.noResultsLP = false;
              if( rpta.flag === 0 ){
                $scope.noResultsLP = true;
              }
              return rpta.datos; 
            });
          };
          $scope.getSelectedProducto = function ($item, $model, $label) {
              $scope.fData.idproductomaster = $item.id;
          };
          $scope.limpiaId = function () {
            if( $scope.fData.idproductomaster ){
              $scope.fData.idproductomaster = null;
            }
          };
          $scope.verPopupListaPdtos = function (size) {
            $modal.open({
              templateUrl: angular.patchURLCI+'configuracion/ver_popup_combo_grilla',
              size: size || '',
              // scope: scope,
              controller: function ($scope, $modalInstance, arrToModal) {
                //console.log(scope.blockUI);
                $scope.fData = arrToModal.fData;
                $scope.mySelectionComboGrid = [];
                $scope.gridComboOptions = {
                  paginationPageSizes: [10, 50, 100, 500, 1000],
                  paginationPageSize: 10,
                  enableRowSelection: true,
                  enableSelectAll: false,
                  enableFiltering: false,
                  enableFullRowSelection: true,
                  multiSelect: false,
                  columnDefs: [
                    { field: 'id', displayName: 'ID', maxWidth: 80 },
                    { field: 'descripcion', displayName: 'Descripción' }
                  ]
                  ,onRegisterApi: function(gridApiCombo) {
                    $scope.gridApiCombo = gridApiCombo;
                    gridApiCombo.selection.on.rowSelectionChanged($scope,function(row){
                      $scope.mySelectionComboGrid = gridApiCombo.selection.getSelectedRows();
                    });
                  }
                }
                analisisServices.sListarProductosLaboratorio().then(function (rpta) {
                  $scope.fpc = {};
                  $scope.fpc.titulo = ' productos.';
                  $scope.gridComboOptions.data = rpta.datos;
                  angular.forEach($scope.gridComboOptions.data,function(val,index) {
                    if( $scope.fData.idproductomaster == val.id ){
                      $timeout(function() {
                        if($scope.gridApiCombo.selection.selectRow){
                          $scope.gridApiCombo.selection.selectRow($scope.gridComboOptions.data[index]);
                        }
                      });
                    }
                  });
                  $scope.fpc.aceptar = function () {
                    $scope.fData.idproductomaster = $scope.mySelectionComboGrid[0].id;
                    $scope.fData.producto = $scope.mySelectionComboGrid[0].descripcion;
                    $modalInstance.dismiss('cancel');
                    $('#fDataproducto').focus();
                  }
                  $scope.fpc.buscar = function () {
                    $scope.fpc.nameColumn = 'descripcion';
                    analisisServices.sListarProductosLaboratorio($scope.fpc).then(function (rpta) {
                      $scope.gridComboOptions.data = rpta.datos;
                    });
                  }
                  $scope.fpc.seleccionar = function () {
                    $scope.mySelectionComboGrid = $scope.gridApiCombo.selection.getSelectedRows();
                    if( $scope.mySelectionComboGrid.length != 1 || $scope.mySelectionComboGrid.length != 1 ){
                      $scope.gridApiCombo.selection.selectRow($scope.gridComboOptions.data[0]);
                      $scope.mySelectionComboGrid = $scope.gridApiCombo.selection.getSelectedRows();
                    }
                    $scope.fData.idproductomaster = $scope.mySelectionComboGrid[0].id;
                    $scope.fData.producto = $scope.mySelectionComboGrid[0].descripcion;
                    $modalInstance.dismiss('cancel');
                    $('#fDataproducto').focus();
                  }
                });


                hotkeys.bindTo($scope)
                  .add({
                    combo: 'a',
                    description: 'Ejecutar acción',
                    callback: function() {
                      $scope.fpc.aceptar();
                    }
                  });
              },
              resolve: {
                arrToModal: function() {
                  return {
                    fData : $scope.fData
                  }
                }
              }
            });
          }
          $scope.cancel = function () {
            console.log('load me');
            $modalInstance.dismiss('cancel');
            $scope.fData = {};

            $scope.getPaginationServerSide();
          }
          $scope.aceptar = function () {
            analisisServices.sEditar($scope.fData).then(function (rpta) {
              if(rpta.flag == 1){
                pTitle = 'OK!';
                pType = 'success';
                $modalInstance.dismiss('cancel');
              }else if(rpta.flag == 0){
                var pTitle = 'Error!';
                var pType = 'danger';
                $scope.getPaginationServerSide();
              }else{
                alert('Error inesperado');
              }
              $scope.fData = {};
              pinesNotifications.notify({ title: pTitle, text: rpta.message, type: pType, delay: 1000 });
              $scope.getPaginationServerSide();
            });
          }
          //console.log($scope.mySelectionGrid);
        },
        resolve: {
          mySelectionGrid: function() {
            return $scope.mySelectionGrid;
          },
          getPaginationServerSide: function() {
            return $scope.getPaginationServerSide;
          }
        }
      });
    }
    $scope.btnNuevo = function (size) {
      $modal.open({
        templateUrl: angular.patchURLCI+'analisis/ver_popup_formulario',
        size: size || '',
        backdrop: 'static',
        keyboard:false,
        controller: function ($scope, $modalInstance, getPaginationServerSide) {
          $scope.getPaginationServerSide = getPaginationServerSide;
          $scope.fData = {};
          $scope.titleForm = 'Registro de Análisis';
          // SECCIONES
          seccionServices.sListarseccionCbo().then(function (rpta) {
            $scope.listaSeccion = rpta.datos;
            $scope.listaSeccion.splice(0,0,{ id : '', descripcion:'--Seleccione Sección--'});
            $scope.fData.idseccion = $scope.listaSeccion[0].id;
          });
          // METODOS
           metodoServices.sListarMetodoCbo().then(function (rpta) {
            $scope.listaMetodo = rpta.datos;
            $scope.listaMetodo.splice(0,0,{ id : '', descripcion:'--Seleccione Método--'});
            $scope.fData.idmetodo = $scope.listaMetodo[0].id;
          });
          // SUBANALISIS
          $scope.fData.subanalisis = 0; 
          $scope.getProductoAutocomplete = function (value) {
            var params = {
              search: value,
              sensor: false
            }
            return analisisServices.sListarProductosLaboratorioAuto(params).then(function(rpta) { 
              $scope.noResultsLP = false;
              if( rpta.flag === 0 ){
                $scope.noResultsLP = true;
              }
              return rpta.datos; 
            });
          };
          $scope.getSelectedProducto = function ($item, $model, $label) {
              $scope.fData.idproductomaster = $item.id;
          };
          $scope.limpiaId = function () {
            if( $scope.fData.idproductomaster ){
              $scope.fData.idproductomaster = null;
            }
          };
          $scope.verPopupListaPdtos = function (size) {
            $modal.open({
              templateUrl: angular.patchURLCI+'configuracion/ver_popup_combo_grilla',
              size: size || '',
              // scope: scope,
              controller: function ($scope, $modalInstance, arrToModal) {
                //console.log(scope.blockUI);
                $scope.fData = arrToModal.fData;
                $scope.mySelectionComboGrid = [];
                $scope.gridComboOptions = {
                  paginationPageSizes: [10, 50, 100, 500, 1000],
                  paginationPageSize: 10,
                  enableRowSelection: true,
                  enableSelectAll: false,
                  enableFiltering: false,
                  enableFullRowSelection: true,
                  multiSelect: false,
                  columnDefs: [
                    { field: 'id', displayName: 'ID', maxWidth: 80 },
                    { field: 'descripcion', displayName: 'Descripción' }
                  ]
                  ,onRegisterApi: function(gridApiCombo) {
                    $scope.gridApiCombo = gridApiCombo;
                    gridApiCombo.selection.on.rowSelectionChanged($scope,function(row){
                      $scope.mySelectionComboGrid = gridApiCombo.selection.getSelectedRows();
                    });
                  }
                }
                analisisServices.sListarProductosLaboratorio().then(function (rpta) {
                  $scope.fpc = {};
                  $scope.fpc.titulo = ' productos.';
                  $scope.gridComboOptions.data = rpta.datos;
                  angular.forEach($scope.gridComboOptions.data,function(val,index) {
                    if( $scope.fData.idproductomaster == val.id ){
                      $timeout(function() {
                        if($scope.gridApiCombo.selection.selectRow){
                          $scope.gridApiCombo.selection.selectRow($scope.gridComboOptions.data[index]);
                        }
                      });
                    }
                  });
                  $scope.fpc.aceptar = function () {
                    $scope.fData.idproductomaster = $scope.mySelectionComboGrid[0].id;
                    $scope.fData.producto = $scope.mySelectionComboGrid[0].descripcion;
                    $modalInstance.dismiss('cancel');
                    $('#fDataproducto').focus();
                  }
                  $scope.fpc.buscar = function () {
                    $scope.fpc.nameColumn = 'descripcion';
                    analisisServices.sListarProductosLaboratorio($scope.fpc).then(function (rpta) {
                      $scope.gridComboOptions.data = rpta.datos;
                    });
                  }
                  $scope.fpc.seleccionar = function () {
                    $scope.mySelectionComboGrid = $scope.gridApiCombo.selection.getSelectedRows();
                    if( $scope.mySelectionComboGrid.length != 1 || $scope.mySelectionComboGrid.length != 1 ){
                      $scope.gridApiCombo.selection.selectRow($scope.gridComboOptions.data[0]);
                      $scope.mySelectionComboGrid = $scope.gridApiCombo.selection.getSelectedRows();
                    }
                    $scope.fData.idproductomaster = $scope.mySelectionComboGrid[0].id;
                    $scope.fData.producto = $scope.mySelectionComboGrid[0].descripcion;
                    $modalInstance.dismiss('cancel');
                    $('#fDataproducto').focus();
                  }
                });


                hotkeys.bindTo($scope)
                  .add({
                    combo: 'a',
                    description: 'Ejecutar acción',
                    callback: function() {
                      $scope.fpc.aceptar();
                    }
                  });
              },
              resolve: {
                arrToModal: function() {
                  return {
                    fData : $scope.fData
                  }
                }
              }
            });
          }
          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          }
          $scope.aceptar = function () {
            analisisServices.sRegistrar($scope.fData).then(function (rpta) {
              if(rpta.flag == 1){
                pTitle = 'OK!';
                pType = 'success';
                $modalInstance.dismiss('cancel');
                $scope.getPaginationServerSide();
              }else if(rpta.flag == 0){
                var pTitle = 'Error!';
                var pType = 'danger';
              }else{
                alert('Error inesperado');
              }
              pinesNotifications.notify({ title: pTitle, text: rpta.message, type: pType, delay: 1000 });
            });
          }
          //console.log($scope.mySelectionGrid);
        },
        resolve: {
          getPaginationServerSide: function() {
            return $scope.getPaginationServerSide;
          }
        }
      });
    }
    $scope.btnAnular = function (mensaje) { 
      var pMensaje = mensaje || '¿Realmente desea realizar la acción?';
      $bootbox.confirm(pMensaje, function(result) {
        if(result){
          analisisServices.sAnular($scope.mySelectionGrid).then(function (rpta) {
            if(rpta.flag == 1){
                pTitle = 'OK!';
                pType = 'success';
                $scope.getPaginationServerSide();
              }else if(rpta.flag == 0){
                var pTitle = 'Error!';
                var pType = 'danger';
              }else{
                alert('Error inesperado');
              }
              pinesNotifications.notify({ title: pTitle, text: rpta.message, type: pType, delay: 1000 });
          });
        }
      });
    }
    $scope.btnHabilitar = function (mensaje) {
      var pMensaje = mensaje || '¿Realmente desea realizar la acción?';
      $bootbox.confirm(pMensaje, function(result) {
        if(result){
          analisisServices.sHabilitar($scope.mySelectionGrid).then(function (rpta) {
            if(rpta.flag == 1){
                pTitle = 'OK!';
                pType = 'success';
                $scope.getPaginationServerSide();
              }else if(rpta.flag == 0){
                var pTitle = 'Error!';
                var pType = 'danger';
              }else{
                alert('Error inesperado');
              }
              pinesNotifications.notify({ title: pTitle, text: rpta.message, type: pType, delay: 1000 });
          });
        }
      });
    }
    $scope.btnDeshabilitar = function (mensaje) {
      var pMensaje = mensaje || '¿Realmente desea realizar la acción?';
      $bootbox.confirm(pMensaje, function(result) {
        if(result){
          analisisServices.sDeshabilitar($scope.mySelectionGrid).then(function (rpta) {
            if(rpta.flag == 1){
                pTitle = 'OK!';
                pType = 'success';
                $scope.getPaginationServerSide();
              }else if(rpta.flag == 0){
                var pTitle = 'Error!';
                var pType = 'danger';
              }else{
                alert('Error inesperado');
              }
              pinesNotifications.notify({ title: pTitle, text: rpta.message, type: pType, delay: 1000 });
          });
        }
      });
    }
      /* ============================ */
     /*  ESTRUCTURA                  */
    /* ============================ */
    $scope.btnAgregarPar = function (size) {
      $modal.open({
        templateUrl: angular.patchURLCI+'analisis/ver_popup_parametros',
        size: size || '',
        backdrop: 'static',
        keyboard:false,
        controller: function ($scope, $modalInstance, mySelectionGrid, getPaginationServerSide) {
          $scope.mySelectionGrid = mySelectionGrid;
          $scope.fData = {};
          $scope.fData.separador = 0;
          $scope.fData.idanalisis = $scope.mySelectionGrid[0].id;
          $scope.titleForm = 'Asignar Parámetros a: "' + $scope.mySelectionGrid[0].descripcion + '"';
          
          // CREACION DE LA GRILLA DE PARAMETROS AGREGADOS
          // var paginationOptionsPar = {
          //   pageNumber: 1,
          //   firstRow: 0,
          //   pageSize: 10,
          //   sort: uiGridConstants.ASC,
          //   sortName: null,
          //   search: null
          // };
          $scope.gridOptionsPar = {
            paginationPageSizes: [10, 50, 100],
            paginationPageSize: 10,
            useExternalPagination: false,
            useExternalSorting: false,
            useExternalFiltering : false,
            enableGridMenu: false,
            enableSelectAll: false,
            enableFiltering: false,
            enableSorting: false,
            data: [],

            columnDefs: [
              { field: 'id', name: 'idparametro', displayName: 'ID', maxWidth: 80, enableColumnMenu: false},
              { field: 'descripcion', name: 'descripcion_par', displayName: 'Parámetro',minWidth: 180, enableColumnMenu: false },
              { field: 'valor_normal_h', name: 'valor_normal_h', displayName: 'Valor Normal Hombres',minWidth: 180, enableColumnMenu: false },
              { field: 'valor_normal_m', name: 'valor_normal_m', displayName: 'Valor Normal Mujeres',minWidth: 180, enableColumnMenu: false },
              // { field: 'orden_parametro', name: 'orden_parametro', displayName: 'orden par',minWidth: 180, enableColumnMenu: false },
              { field: 'separador', type: 'object', name:'separador', displayName: 'Acción', maxWidth: 95, enableColumnMenu: false, 
              cellTemplate:'<div class="">'+
            '<button type="button" class="btn btn-sm btn-danger inline-block m-xs" ng-click="grid.appScope.btnQuitarDeLaCesta(row)" title="Eliminar"> <i class="fa fa-trash"></i></button>'+
            '<button type="button" class="btn btn-sm btn-success inline-block m-xs" ng-click="grid.appScope.btnAgregSub(row)" title="Ver Subnivel" ng-if="COL_FIELD.separador == 1"> <i class="fa fa-plus-circle"></i></button>'+
            '</div>' 
               }
            ],
            onRegisterApi: function(gridApi) {
              $scope.gridApiPar = gridApi;
            }
          };
          $scope.getPaginationServerSidePar = function() {
            $scope.datosGrid = {
              idanalisis : $scope.fData.idanalisis 
            };
            analisisServices.sListarParametrosAnalisisId($scope.datosGrid).then(function (rpta) {
              $scope.gridOptionsPar.data = rpta.datos;
              //console.log(rpta.datos);
            });
            $scope.mySelectionGridPar = [];
          };
          $scope.getPaginationServerSidePar();
          $scope.getTableHeight = function() { 
            var rowHeight = 30; // your row height 
            var headerHeight = 30; // your header height 
            return { 
               height: ($scope.gridOptionsPar.data.length * rowHeight + headerHeight + 60) + "px" 
            }; 
          };
          // $scope.listaSeparador = [
          //   { id : 1, descripcion: 'Parametro' }, 
          //   { id : 2, descripcion: 'Separador' }
          // ];
      
          // SUBANALISIS
          //$scope.fData.subanalisis = 0; 
          $scope.getParametroAutocomplete = function (value) {
            var params = {
              search: value,
              sensor: false,
              agrupador: $scope.fData.separador
            }
            return analisisServices.sListarParametrosLaboratorioAuto(params).then(function(rpta) { 
              $scope.noResultsLP = false;
              if( rpta.flag === 0 ){
                $scope.noResultsLP = true;
              }
              return rpta.datos; 
            });
          };
          $scope.getSelectedParametro = function ($item, $model, $label) {
              $scope.fData.idparametro = $item.id;
              $scope.fData.parametro = $item.descripcion_par;
              $scope.fData.valorNormalHombres = $item.valor_normal_h;
              $scope.fData.valorNormalMujeres = $item.valor_normal_m;
          };
          $scope.limpiaId = function () {
            if( $scope.fData.idparametro ){
              $scope.fData.idparametro = null;
            }
          };
          $scope.limpiaSeleccion = function () {
            if( $scope.fData.idparametro ){
              $scope.fData.idparametro = null;
              $scope.fData.parametro = null;
              $scope.fData.valorNormalHombres = null;
              $scope.fData.valorNormalMujeres = null;
            }
          };
          $scope.verPopupListaParametro = function (size) {
            $modal.open({
              templateUrl: angular.patchURLCI+'configuracion/ver_popup_combo_grilla',
              size: size || '',
              // scope: scope,
              controller: function ($scope, $modalInstance, arrToModal) {
                $scope.fData = arrToModal.fData;
                $scope.mySelectionComboGrid = [];
                $scope.gridComboOptions = {
                  paginationPageSizes: [10, 50, 100, 500, 1000],
                  paginationPageSize: 10,
                  enableRowSelection: true,
                  enableSelectAll: false,
                  enableFiltering: false,
                  enableFullRowSelection: true,
                  multiSelect: false,
                  columnDefs: [
                    { field: 'id', displayName: 'ID', maxWidth: 80 },
                    { field: 'descripcion_par', displayName: 'Descripción' }
                  ]
                  ,onRegisterApi: function(gridApiCombo) {
                    $scope.gridApiCombo = gridApiCombo;
                    gridApiCombo.selection.on.rowSelectionChanged($scope,function(row){
                      $scope.mySelectionComboGrid = gridApiCombo.selection.getSelectedRows();
                    });
                  }
                }
                analisisServices.sListarParametrosLaboratorio().then(function (rpta) {
                  $scope.fpc = {};
                  $scope.fpc.titulo = ' Parámetros.';
                  $scope.gridComboOptions.data = rpta.datos;
                  angular.forEach($scope.gridComboOptions.data,function(val,index) {
                    if( $scope.fData.idparametro == val.id ){
                      $timeout(function() {
                        if($scope.gridApiCombo.selection.selectRow){
                          $scope.gridApiCombo.selection.selectRow($scope.gridComboOptions.data[index]);
                        }
                      });
                    }
                  });
                  $scope.fpc.aceptar = function () {
                    $scope.fData.idparametro = $scope.mySelectionComboGrid[0].id;
                    $scope.fData.parametro = $scope.mySelectionComboGrid[0].descripcion;
                    $scope.fData.valorNormalHombres = $scope.mySelectionComboGrid[0].valor_normal_h;
                    $scope.fData.valorNormalMujeres = $scope.mySelectionComboGrid[0].valor_normal_m;
                    $modalInstance.dismiss('cancel');
                    $('#fDataParametro').focus();
                  }
                  $scope.fpc.buscar = function () {
                    $scope.fpc.nameColumn = 'descripcion_par';
                    analisisServices.sListarParametrosLaboratorio($scope.fpc).then(function (rpta) {
                      $scope.gridComboOptions.data = rpta.datos;
                    });
                  }
                  $scope.fpc.seleccionar = function () {
                    $scope.mySelectionComboGrid = $scope.gridApiCombo.selection.getSelectedRows();
                    if( $scope.mySelectionComboGrid.length != 1 || $scope.mySelectionComboGrid.length != 1 ){
                      $scope.gridApiCombo.selection.selectRow($scope.gridComboOptions.data[0]);
                      $scope.mySelectionComboGrid = $scope.gridApiCombo.selection.getSelectedRows();
                    }
                    $scope.fData.idparametro = $scope.mySelectionComboGrid[0].id;
                    $scope.fData.parametro = $scope.mySelectionComboGrid[0].descripcion;
                    $scope.fData.valorNormalHombres = $scope.mySelectionComboGrid[0].valor_normal_h;
                    $scope.fData.valorNormalMujeres = $scope.mySelectionComboGrid[0].valor_normal_m;
                    $modalInstance.dismiss('cancel');
                    $('#fDataParametro').focus();
                  }
                });


                hotkeys.bindTo($scope)
                  .add({
                    combo: 'a',
                    description: 'Ejecutar acción',
                    callback: function() {
                      $scope.fpc.aceptar();
                    }
                  });
              },
              resolve: {
                arrToModal: function() {
                  return {
                    fData : $scope.fData
                  }
                }
              }
            });
          }
          $scope.agregarItem = function (mensaje) {
            //console.log($scope.fData);
            $('#fDataParametro').focus();
            var productNew = true;
            var varaccion = 'reg';
            if(varaccion=='reg')
            {
              angular.forEach($scope.gridOptionsPar.data, function(value, key) { 
                if(value.id == $scope.fData.idparametro ){ 
                  productNew = false;
                }
              });
            }
            if( productNew === false ){ 
              pinesNotifications.notify({ title: 'Advertencia.', text: 'El parámetro ya ha sido agregado a la cesta.', type: 'warning', delay: 2500 });
              $scope.fData.idparametro = null;
              $scope.fData.parametro = null;
              $scope.fData.valorNormalHombres = null;
               $scope.fData.valorNormalMujeres = null; 
              return false;
            }

            if(varaccion=='reg')      // Ingreso
            {
              $scope.arrTemporal = { 
              'id' : $scope.fData.idparametro,
              'descripcion' : $scope.fData.parametro,
              'valor_normal_h' :  $scope.fData.valorNormalHombres,
              'valor_normal_m' :  $scope.fData.valorNormalMujeres
              
              } 
              $scope.gridOptionsPar.data.push($scope.arrTemporal);

            }
            $scope.fData.idparent = 0;
            analisisServices.sAsignarParametro($scope.fData).then(function (rpta) {
              if(rpta.flag == 1){
                pTitle = 'OK!';
                pType = 'success';
                $scope.fData.idparametro = null;
                $scope.fData.parametro = null;
                $scope.fData.valorNormalHombres = null;
                $scope.fData.valorNormalMujeres = null; 
                
              }else if(rpta.flag == 0){
                var pTitle = 'Error!';
                var pType = 'danger';
              }else{
                alert('Error inesperado');
              }
              $scope.getPaginationServerSidePar();
              //$modalInstance.dismiss('cancel');
              pinesNotifications.notify({ title: pTitle, text: rpta.message, type: pType, delay: 2000 });
            });
          }
          $scope.btnQuitarDeLaCesta = function (row,mensaje) {
            var pMensaje = mensaje || '¿Realmente desea realizar la acción?';
            $bootbox.confirm(pMensaje, function(result) {
              if(result){
                $scope.fData.idparametro = row.entity.id;
                //console.log($scope.fData);

                analisisServices.sAnularAnalisisParametro($scope.fData).then(function (rpta) {
                  if(rpta.flag == 1){
                      pTitle = 'OK!';
                      pType = 'success';
                      $scope.getPaginationServerSidePar();
                      var index = $scope.gridOptionsPar.data.indexOf(row.entity); 
                      console.log(index);
                      $scope.gridOptionsPar.data.splice(index,1);
                      $scope.limpiaId();
                    }else if(rpta.flag == 0){
                      var pTitle = 'Error!';
                      var pType = 'danger';
                    }else{
                      alert('Error inesperado. Contacte con el Area de Sistemas (992 566 985)');
                    }
                    pinesNotifications.notify({ title: pTitle, text: rpta.message, type: pType, delay: 1000 });
                });
              }
            });
          }
          $scope.btnAgregSub = function (row) {
            
            var idanalisisparametro = row.entity.idanalisisparametro;
            var separador = row.entity.descripcion;
            
            $modal.open({
              templateUrl: angular.patchURLCI+'analisis/ver_popup_separador',
              size: size || '',
              scope: $scope,
              controller: function ($scope, $modalInstance) {
                //$scope.mySelectionGrid = mySelectionGrid;
                
                $scope.fData = {};

                $scope.fData.idanalisis = $scope.mySelectionGrid[0].id;
                // $scope.fData.idanalisisparametro = $scope.mySelectionGridPar[0].idanalisisparametro;
                // $scope.fData.idparametro = $scope.mySelectionGridPar[0].id;
                // $scope.titleForm = 'Asignar Parámetros a: "' + $scope.mySelectionGridPar[0].descripcion + '"';
                //console.log(row.entity);

                $scope.fData.idanalisisparametro = idanalisisparametro;
                $scope.titleForm = 'Asignar Parámetros a: "'  + separador + '"';

                $scope.gridOptionsSepPar = {
                  paginationPageSizes: [10, 50, 100],
                  paginationPageSize: 10,
                  useExternalPagination: false,
                  useExternalSorting: false,
                  useExternalFiltering : false,
                  enableGridMenu: false,
                  enableRowSelection: false,
                  enableSelectAll: false,
                  enableFiltering: false,
                  enableFullRowSelection: false,
                  enableSorting: false,
                  data: [],
                  multiSelect: false,
                  columnDefs: [
                    { field: 'id', name: 'idparametro', displayName: 'ID', maxWidth: 80, enableColumnMenu: false },
                    { field: 'descripcion', name: 'descripcion_par', displayName: 'Parámetro',minWidth: 180, enableColumnMenu: false },
                    { field: 'valor_normal_h', name: 'valor_normal_h', displayName: 'Valor Normal Hombres',minWidth: 180, enableColumnMenu: false },
                    { field: 'valor_normal_m', name: 'valor_normal_m', displayName: 'Valor Normal Mujeres',minWidth: 180, enableColumnMenu: false },
                    { field: 'accion', name:'accion', displayName: 'Acción', maxWidth: 95, enableColumnMenu: false, 
                    cellTemplate:'<div class="">'+
                  '<button type="button" class="btn btn-sm btn-danger inline-block m-xs" ng-click="grid.appScope.btnQuitarDeLaCesta2(row)" title="Eliminar"> <i class="fa fa-trash"></i></button>'+
                  // '<button type="button" class="btn btn-sm btn-success inline-block m-xs" ng-click="grid.appScope.btnAgregSub(row)" title="Ver Subnivel" ng-if="COL_FIELD.separador == 1"> <i class="fa fa-plus-circle"></i></button>'+
                  '</div>'
                     }
                  ],
                  onRegisterApi: function(gridApiPar) {
                    $scope.gridApiPar = gridApiPar;
                   }
                };
                
                $scope.getPaginationServerSideSepPar = function() {
                  $scope.datosGrid = {
                    idanalisisparametro : $scope.fData.idanalisisparametro 
                  };
                  analisisServices.sListarParametrosSeparadorId($scope.datosGrid).then(function (rpta) {
                    $scope.gridOptionsSepPar.data = rpta.datos;
                    // console.log($scope.gridOptionsSepPar.columnDefs);
                  });
                  $scope.mySelectionGridPar = [];
                };
                $scope.getPaginationServerSideSepPar();
                $scope.getTableHeight = function() { 
                  var rowHeight = 30; // your row height 
                  var headerHeight = 30; // your header height 
                  return { 
                     height: ($scope.gridOptionsSepPar.data.length * rowHeight + headerHeight + 60) + "px" 
                  }; 
                };
                $scope.getParametroAutocomplete = function (value) {
                  var params = {
                    search: value,
                    sensor: false,
                    agrupador: 0
                  }
                  return analisisServices.sListarParametrosLaboratorioAuto(params).then(function(rpta) { 
                    $scope.noResultsLP = false;
                    if( rpta.flag === 0 ){
                      $scope.noResultsLP = true;
                    }
                    return rpta.datos; 
                  });
                };
                $scope.getSelectedParametro = function ($item, $model, $label) {
                    $scope.fData.idparametro = $item.id;
                    $scope.fData.parametro = $item.descripcion;
                    $scope.fData.valorNormalHombres = $item.valor_normal_h;
                    $scope.fData.valorNormalMujeres = $item.valor_normal_m;
                };
                $scope.limpiaId = function () {
                  if( $scope.fData.idparametro ){
                    $scope.fData.idparametro = null;
                  }
                };
                $scope.limpiaSeleccion = function () {
                  if( $scope.fData.idparametro ){
                    $scope.fData.idparametro = null;
                    $scope.fData.parametro = null;
                    $scope.fData.valorNormalHombres = null;
                    $scope.fData.valorNormalMujeres = null;
                  }
                };
                $scope.verPopupListaParametro = function (size) {
                  $modal.open({
                    templateUrl: angular.patchURLCI+'configuracion/ver_popup_combo_grilla',
                    size: size || '',
                    // scope: scope,
                    controller: function ($scope, $modalInstance, arrToModal) {
                      $scope.fData = arrToModal.fData;
                      $scope.mySelectionComboGrid = [];
                      $scope.gridComboOptions = {
                        paginationPageSizes: [10, 50, 100, 500, 1000],
                        paginationPageSize: 10,
                        enableRowSelection: true,
                        enableSelectAll: false,
                        enableFiltering: false,
                        enableFullRowSelection: true,
                        multiSelect: false,
                        columnDefs: [
                          { field: 'id', displayName: 'ID', maxWidth: 80 },
                          { field: 'descripcion', displayName: 'Descripción' }
                        ]
                        ,onRegisterApi: function(gridApiCombo) {
                          $scope.gridApiCombo = gridApiCombo;
                          gridApiCombo.selection.on.rowSelectionChanged($scope,function(row){
                            $scope.mySelectionComboGrid = gridApiCombo.selection.getSelectedRows();
                          });
                        }
                      }
                      analisisServices.sListarParametrosLaboratorio().then(function (rpta) {
                        $scope.fpc = {};
                        $scope.fpc.titulo = ' Parámetros.';
                        $scope.gridComboOptions.data = rpta.datos;
                        angular.forEach($scope.gridComboOptions.data,function(val,index) {
                          if( $scope.fData.idparametro == val.id ){
                            $timeout(function() {
                              if($scope.gridApiCombo.selection.selectRow){
                                $scope.gridApiCombo.selection.selectRow($scope.gridComboOptions.data[index]);
                              }
                            });
                          }
                        });
                        $scope.fpc.aceptar = function () {
                          $scope.fData.idparametro = $scope.mySelectionComboGrid[0].id;
                          $scope.fData.parametro = $scope.mySelectionComboGrid[0].descripcion;
                          $scope.fData.valorNormalHombres = $scope.mySelectionComboGrid[0].valor_normal_h;
                          $scope.fData.valorNormalMujeres = $scope.mySelectionComboGrid[0].valor_normal_m;
                          $modalInstance.dismiss('cancel');
                          $('#fDataParametro').focus();
                        }
                        $scope.fpc.buscar = function () {
                          $scope.fpc.nameColumn = 'descripcion';
                          analisisServices.sListarParametrosLaboratorio($scope.fpc).then(function (rpta) {
                            $scope.gridComboOptions.data = rpta.datos;
                          });
                        }
                        $scope.fpc.seleccionar = function () {
                          $scope.mySelectionComboGrid = $scope.gridApiCombo.selection.getSelectedRows();
                          if( $scope.mySelectionComboGrid.length != 1 || $scope.mySelectionComboGrid.length != 1 ){
                            $scope.gridApiCombo.selection.selectRow($scope.gridComboOptions.data[0]);
                            $scope.mySelectionComboGrid = $scope.gridApiCombo.selection.getSelectedRows();
                          }
                          $scope.fData.idparametro = $scope.mySelectionComboGrid[0].id;
                          $scope.fData.parametro = $scope.mySelectionComboGrid[0].descripcion;
                          $scope.fData.valorNormalHombres = $scope.mySelectionComboGrid[0].valor_normal_h;
                          $scope.fData.valorNormalMujeres = $scope.mySelectionComboGrid[0].valor_normal_m;
                          $modalInstance.dismiss('cancel');
                          $('#fDataParametro').focus();
                        }
                      });


                      hotkeys.bindTo($scope)
                        .add({
                          combo: 'a',
                          description: 'Ejecutar acción',
                          callback: function() {
                            $scope.fpc.aceptar();
                          }
                        });
                    },
                    resolve: {
                      arrToModal: function() {
                        return {
                          fData : $scope.fData
                        }
                      }
                    }
                  });
                }
                $scope.agregarItem = function (mensaje) {
                  console.log($scope.fData);
                  $('#fDataParametro').focus();
                  var productNew = true;
                  var varaccion = 'reg';
                  if(varaccion=='reg')
                  {
                    angular.forEach($scope.gridOptionsSepPar.data, function(value, key) { 
                      if(value.id == $scope.fData.idparametro ){ 
                        productNew = false;
                      }
                    });
                  }
                  if( productNew === false ){ 
                    pinesNotifications.notify({ title: 'Advertencia.', text: 'El parámetro ya ha sido agregado a la cesta.', type: 'warning', delay: 2500 });
                    $scope.fData.idparametro = null;
                    $scope.fData.parametro = null;
                    $scope.fData.valorNormalHombres = null;
                     $scope.fData.valorNormalMujeres = null; 
                    return false;
                  }

                  if(varaccion=='reg')      // Ingreso
                  {
                    $scope.arrTemporal = { 
                    'id' : $scope.fData.idparametro,
                    'descripcion' : $scope.fData.parametro,
                    'valor_normal_h' :  $scope.fData.valorNormalHombres,
                    'valor_normal_m' :  $scope.fData.valorNormalMujeres
                    
                    } 
                    $scope.gridOptionsSepPar.data.push($scope.arrTemporal);

                  }

                  $scope.fData.idparent = $scope.fData.idanalisisparametro;
                  analisisServices.sAsignarParametro($scope.fData).then(function (rpta) {
                    if(rpta.flag == 1){
                      pTitle = 'OK!';
                      pType = 'success';
                      $scope.fData.idparametro = null;
                      $scope.fData.parametro = null;
                      $scope.fData.valorNormalHombres = null;
                      $scope.fData.valorNormalMujeres = null; 
                      
                    }else if(rpta.flag == 0){
                      var pTitle = 'Error!';
                      var pType = 'danger';
                    }else{
                      alert('Error inesperado');
                    }
                    $scope.getPaginationServerSideSepPar();
                    //$modalInstance.dismiss('cancel');
                    pinesNotifications.notify({ title: pTitle, text: rpta.message, type: pType, delay: 2000 });
                  });
                }
                $scope.btnQuitarDeLaCesta2 = function (row,mensaje) {
                  var pMensaje = mensaje || '¿Realmente desea realizar la acción?...';
                  $bootbox.confirm(pMensaje, function(result) {
                    if(result){
                      $scope.fData.idparametro = row.entity.id;
                      //console.log($scope.fData);

                      analisisServices.sAnularAnalisisParametro($scope.fData).then(function (rpta) {
                        if(rpta.flag == 1){
                            pTitle = 'OK!';
                            pType = 'success';
                            $scope.getPaginationServerSideSepPar();
                            var index = $scope.gridOptionsSepPar.data.indexOf(row.entity); 
                            console.log(index);
                            $scope.gridOptionsSepPar.data.splice(index,1);
                          }else if(rpta.flag == 0){
                            var pTitle = 'Error!';
                            var pType = 'danger';
                          }else{
                            alert('Error inesperado. Contacte con el Area de Sistemas (con Luis)');
                          }
                          pinesNotifications.notify({ title: pTitle, text: rpta.message, type: pType, delay: 1000 });
                      });
                    }
                  });
                }
                $scope.cancel = function (){
                  $modalInstance.dismiss('cancel');
                }

              },
              resolve: {
                // mySelectionGrid: function() {
                //   return $scope.mySelectionGrid;
                // },
                // getPaginationServerSidePar: function() {
                //   return $scope.getPaginationServerSidePar;
                // }
              }
            });
          }
          $scope.cancel = function (){
            $modalInstance.dismiss('cancel');
          }
          $scope.aceptar = function () {
            // console.log($scope.gridOptionsPar.data);
            $modalInstance.dismiss('cancel');
            $scope.fData.detalle = $scope.gridOptionsPar.data;
            // analisisServices.sAsignarParametro($scope.fData).then(function (rpta) {
            //   if(rpta.flag == 1){
            //     pTitle = 'OK!';
            //     pType = 'success';
                
            //   }else if(rpta.flag == 0){
            //     var pTitle = 'Error!';
            //     var pType = 'danger';
            //   }else{
            //     alert('Error inesperado');
            //   }
            //   $modalInstance.dismiss('cancel');
            //   pinesNotifications.notify({ title: pTitle, text: rpta.message, type: pType, delay: 2000 });
            // });
          }
        },
        resolve: {
          mySelectionGrid: function() {
            return $scope.mySelectionGrid;
          },
          getPaginationServerSide: function() {
            return $scope.getPaginationServerSide;
          }
        }
      });
    }
    /* ============================ */
    /* AGREGAR ANALISIS A UN PERFIL */
    /* ============================ */
    $scope.btnAgregarAnal = function (size) {
      $modal.open({
        templateUrl: angular.patchURLCI+'analisis/ver_popup_agregar_analisis',
        size: size || '',
        backdrop: 'static',
        keyboard:false,
        controller: function ($scope, $modalInstance, mySelectionGrid, getPaginationServerSide) {
          $scope.mySelectionGrid = mySelectionGrid;
          $scope.fData = {};
          $scope.fData.idanalisis_perfil = $scope.mySelectionGrid[0].id;
          $scope.titleForm = 'Asignar Analisis al Perfil: <br><strong>"' + $scope.mySelectionGrid[0].descripcion + '"</strong>';
          $scope.gridOptionsAnal = {
            paginationPageSizes: [10, 50, 100],
            paginationPageSize: 10,
            useExternalPagination: true,
            useExternalSorting: true,
            useExternalFiltering : true,
            enableGridMenu: true,
            enableRowSelection: true,
            enableSelectAll: true,
            enableFiltering: false,
            enableFullRowSelection: true,
            data: [],
            multiSelect: false,
            columnDefs: [
              { field: 'id', name: 'idanalisis', displayName: 'ID', maxWidth: 80, visible: false},
              { field: 'seccion', name: 'descripcion_sec', displayName: 'Sección',maxWidth: 200},
              { field: 'descripcion', name: 'descripcion_anal', displayName: 'Analisis' },
              { field: 'accion', name:'accion', displayName: 'Acción', maxWidth: 95, 
                cellTemplate:'<div class="">'+
                '<button type="button" class="btn btn-sm btn-danger inline-block m-xs" ng-click="grid.appScope.btnQuitarAnalDeLaCesta(row)" title="Eliminar"> <i class="fa fa-trash"></i></button>'+
                '</div>'
              }
              
            ],
            onRegisterApi: function(gridApi) {
              $scope.gridApiPar = gridApi;
              gridApi.selection.on.rowSelectionChanged($scope,function(row){
                  $scope.mySelectionGridPar = gridApi.selection.getSelectedRows();
              });
              gridApi.selection.on.rowSelectionChangedBatch($scope,function(rows){
                  $scope.mySelectionGridPar = gridApi.selection.getSelectedRows();
              });

            }
          };
          $scope.getPaginationServerSidePar = function() {
            $scope.datosGrid = {
              idanalisis : $scope.fData.idanalisis_perfil
            };
            analisisServices.sListarAnalisisPerfil($scope.datosGrid).then(function (rpta) {
              $scope.gridOptionsAnal.data = rpta.datos;
              //console.log(rpta.datos);
            });
            $scope.mySelectionGridPar = [];
          };
          console.log($scope.fData);
          $scope.getPaginationServerSidePar();
          $scope.getTableHeight = function() { 
            var rowHeight = 30; // your row height 
            var headerHeight = 30; // your header height 
            return { 
               height: ($scope.gridOptionsAnal.data.length * rowHeight + headerHeight + 60) + "px" 
            }; 
          };
          $scope.getAnalisisAutocomplete = function (value) { // Filtra de una lista de analisis que no pertenezcan a la seccion Perfiles
            var params = {
              search: value,
              sensor: false
            }
            return analisisServices.sListarAnalisisLaboratorioAuto(params).then(function(rpta) { 
              $scope.noResultsLA = false;
              if( rpta.flag === 0 ){
                $scope.noResultsLA = true;
              }
              return rpta.datos; 
            });
          };
          $scope.getSelectedAnalisis = function ($item, $model, $label) {
              $scope.fData.idanalisis = $item.id;
              $scope.fData.analisis = $item.descripcion;
              $scope.fData.seccion = $item.seccion;
          };
          $scope.limpiaId = function () {
            if( $scope.fData.idanalisis ){
              $scope.fData.idanalisis = null;
            }
          };
          $scope.agregarItem = function (mensaje) {
            
            $('#fDataAnalisis').focus();
            var productNew = true;

            angular.forEach($scope.gridOptionsAnal.data, function(value, key) { 
              if(value.id == $scope.fData.idanalisis ){ 
                productNew = false;
              }
            });

            if( productNew === false ){ 
              pinesNotifications.notify({ title: 'Advertencia.', text: 'El Análisis ya ha sido agregado a la cesta. Por favor elija otro', type: 'warning', delay: 2500 });
              $scope.fData.idanalisis = null;
              $scope.fData.analisis = null;
              $scope.fData.seccion = null;
              return false;
            }

            $scope.arrTemporal = { 
            'id' : $scope.fData.idanalisis,
            'descripcion' : $scope.fData.analisis,
            'seccion'    :  $scope.fData.seccion   
            } 
            $scope.gridOptionsAnal.data.push($scope.arrTemporal);


            //$scope.fData.idparent = 0;
            console.log($scope.fData);
            analisisServices.sAsignarAnalisisPerfil($scope.fData).then(function (rpta) {
              if(rpta.flag == 1){
                pTitle = 'OK!';
                pType = 'success';
                $scope.fData.idanalisis = null;
                $scope.fData.analisis = null;
                $scope.fData.seccion = null;
                
              }else if(rpta.flag == 0){
                var pTitle = 'Error!';
                var pType = 'danger';
              }else{
                alert('Error inesperado');
              }
              $scope.getPaginationServerSidePar();
              pinesNotifications.notify({ title: pTitle, text: rpta.message, type: pType, delay: 2000 });
            });
          }
          $scope.cancel = function (){
            $modalInstance.dismiss('cancel');
          }
          
        },
        resolve: {
          mySelectionGrid: function() {
            return $scope.mySelectionGrid;
          },
          getPaginationServerSide: function() {
            return $scope.getPaginationServerSide;
          }
        }
      });
    }
    /* ============================ */
    /* ATAJOS DE TECLADO NAVEGACION */
    /* ============================ */
    hotkeys.bindTo($scope)
      .add({
        combo: 'alt+n',
        description: 'Nuevo Análisis',
        callback: function() {
          $scope.btnNuevo();
        }
      })
      .add ({
        combo: 'e',
        description: 'Editar Análisis',
        callback: function() {
          if( $scope.mySelectionGrid.length == 1 ){
            $scope.btnEditar();
          }
        }
      })
      .add ({
        combo: 'del',
        description: 'Anular Análisis',
        callback: function() {
          if( $scope.mySelectionGrid.length > 0 ){
            $scope.btnDeshabilitar();
          }
        }
      })
      .add ({
        combo: 'b',
        description: 'Buscar Análisis',
        callback: function() {
          $scope.btnToggleFiltering();
        }
      })
      .add ({
        combo: 's',
        description: 'Selección y Navegación',
        callback: function() {
          $scope.navegateToCell(0,0);
        }
      });

  }])
  .service("analisisServices",function($http, $q) {
    return({
        //sListaranalisisCbo,
        sListaranalisis: sListaranalisis,
        sListaranalisisPaciente: sListaranalisisPaciente,
        sListaranalisisPacienteIdanalisis: sListaranalisisPacienteIdanalisis,        
        sListarProductosLaboratorio: sListarProductosLaboratorio,
        sListarProductosLaboratorioAuto: sListarProductosLaboratorioAuto,
        sListarParametrosLaboratorio: sListarParametrosLaboratorio,
        sListarParametrosLaboratorioAuto: sListarParametrosLaboratorioAuto,
        sListarAnalisisLaboratorioAuto: sListarAnalisisLaboratorioAuto,
        sListarParametrosAnalisisId: sListarParametrosAnalisisId,
        sListarParametrosSeparadorId: sListarParametrosSeparadorId,
        sListarAnalisisPerfil: sListarAnalisisPerfil,
        sAsignarParametro: sAsignarParametro,
        sAsignarAnalisisPerfil: sAsignarAnalisisPerfil,
        sRegistrar: sRegistrar,
        sEditar: sEditar,
        sHabilitar: sHabilitar,
        sDeshabilitar: sDeshabilitar,
        sAnular: sAnular,
        sAnularAnalisisParametro: sAnularAnalisisParametro
    });
   
    function sListaranalisis(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/lista_analisis",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sListaranalisisPaciente(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/lista_analisis_paciente",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    } 
    function sListaranalisisPacienteIdanalisis(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/lista_analisis_paciente_idanalisis",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }        
    function sListarProductosLaboratorio(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/lista_pdtos_laboratorio",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sListarProductosLaboratorioAuto(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/lista_pdtos_para_autocompletado",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sListarParametrosLaboratorio(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/lista_parametros_laboratorio",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sListarParametrosLaboratorioAuto(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/lista_parametros_para_autocompletado",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sListarAnalisisLaboratorioAuto(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/lista_analisis_para_autocompletado",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sListarParametrosAnalisisId(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/lista_parametros_analisis_by_id",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sListarAnalisisPerfil(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/lista_analisis_perfil",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sListarParametrosSeparadorId(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/lista_parametros_separador_by_id",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sAsignarParametro (datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/asignarParametro",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sAsignarAnalisisPerfil (datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/asignarAnalisisPerfil",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sRegistrar (datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/registrar",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sEditar (datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/editar",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sHabilitar (datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/habilitar",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
     function sDeshabilitar (datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/deshabilitar",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sAnular (datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/anular",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sAnularAnalisisParametro (datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"analisis/anularAnalisisParametro",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }

  });