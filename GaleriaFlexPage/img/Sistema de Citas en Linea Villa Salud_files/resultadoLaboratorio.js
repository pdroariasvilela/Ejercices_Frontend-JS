angular.module('theme.resultadolaboratorio', ['theme.core.services'])
  .controller('resultadolaboratorioController', ['$scope', 'blockUI', 
    'resultadolaboratorioServices',
    'ModalReporteFactory',
    'sedeServices', 
    function($scope, blockUI, 
      resultadolaboratorioServices,
      ModalReporteFactory,
      sedeServices
    ){ 
    'use strict'; 
    var vm = this;
    vm.fBusqueda = {};
    vm.listaSedes = {};
    vm.usuario = $scope.fSessionCI;
    console.log('$scope.fSessionCI',$scope.fSessionCI);

    sedeServices.sListarSedesCbo().then(function (rpta) {
      vm.listaSedes = rpta.datos;
      vm.listaSedes.splice(0,0,{ id : 0, idsede:0, descripcion:' --SELECCIONA-- '});
      vm.fBusqueda.itemSede = vm.listaSedes[0];
    });

    vm.listarOrdenPorCliente = function(){
      // if(vm.fBusqueda.itemSede){
      //   var datos = vm.fBusqueda.itemSede;        
      // }else{
      //   var datos = {};
      //   datos.idcliente = $scope.fSessionCI.idcliente;        
      // }

      resultadolaboratorioServices.sCargaOrdenPorCliente().then(function(rpta){
        vm.listaOrdenes = rpta.datos;
        vm.listaOrdenesGrid = angular.copy(rpta.datos);
        vm.totalItemsList = rpta.totalItems;
      });
    }

    vm.listarOrdenPorCliente();

    vm.imprimirResultados = function(orden){
      blockUI.start('Cargando resultados...');      
      resultadolaboratorioServices.sCargarResultadoPaciente(orden).then(function(rpta){
        if(rpta.flag == 1){
          var arrParams = {            
            metodo: 'php',                         
          }
          arrParams.datos = {};
          arrParams.datos.titulo = 'RESULTADO DE LABORATORIO';
          arrParams.datos.tituloAbv = 'LAB-RL';
          arrParams.datos.salida = 'pdf';
          arrParams.datos.resultado = rpta.datos;
          arrParams.datos.resultado.arrSecciones = rpta.arrSecciones;

          angular.forEach(arrParams.datos.resultado.arrSecciones, function(seccion, key) {
            seccion.seleccionado = true;
            angular.forEach(seccion.analisis, function(value, key) {
              value.seleccionado = true;
            });
          });
          
          arrParams.url = rootPathSH + 'CentralReportesMPDF/report_resultado_laboratorio'; 
          //arrParams.url = angular.patchURLCI+'ProgramarCita/report_comprobante_cita'; 
          ModalReporteFactory.getPopupReporte(arrParams, 'sh');           
        }
        blockUI.stop();
      });
    }
    vm.btnImprimirResultado = function (row,membrete){
      var arrParams = {
        titulo: 'RESULTADO DE LABORATORIO',
        datos:{
          resultado: row,
          con_membrete: membrete,
          salida: 'pdf',
          tituloAbv: 'LAB-RL',
          titulo: 'RESULTADO DE LABORATORIO'
        },
        metodo: 'php'
      } 
      arrParams.url = angular.patchURLCI+'CentralReportesMPDF/impresion_resultados_laboratorio', 
      ModalReporteFactory.getPopupReporte(arrParams);
    }
  }])
  .service("resultadolaboratorioServices",function($http, $q) {
    return({
      sCargaOrdenPorCliente:sCargaOrdenPorCliente,
      sCargarResultadoPaciente:sCargarResultadoPaciente,
    });
    function sCargaOrdenPorCliente(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"Resultadolaboratorio/cargar_orden_por_cliente", 
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }

    function sCargarResultadoPaciente(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI + "Resultadolaboratorio/listarResultados", 
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
  }); 