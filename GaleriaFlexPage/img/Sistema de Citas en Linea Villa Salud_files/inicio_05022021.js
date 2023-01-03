angular.module('theme.inicio', ['theme.core.services'])
  .controller('inicioController',['$scope', '$theme', '$filter','$uibModal'
    ,'inicioServices'
    ,'sedeServices'
    ,'usuarioServices',function($scope, $theme, $filter, $uibModal
    ,inicioServices
    ,sedeServices
    ,usuarioServices ){


      'use strict';
      shortcut.remove("F2");
      $scope.modulo = 'inicio';
      $scope.arrays = {};
      $scope.fDataFiltro = {};
      $scope.fBusqueda = {};
      $scope.arrays.listaAvisos = [];
      $scope.arrays.listaCumpleaneros = [];
      $scope.arrays.listaTelefonica = [];
      $scope.arrays.listaDocumentosInterno = [];


      $scope.listaMeses = [
        { 'id': 1, 'mes': 'Enero' },
        { 'id': 2, 'mes': 'Febrero' },
        { 'id': 3, 'mes': 'Marzo' },
        { 'id': 4, 'mes': 'Abril' },
        { 'id': 5, 'mes': 'Mayo' },
        { 'id': 6, 'mes': 'Junio' },
        { 'id': 7, 'mes': 'Julio' },
        { 'id': 8, 'mes': 'Agosto' },
        { 'id': 9, 'mes': 'Septiembre' },
        { 'id': 10, 'mes': 'Octubre' },
        { 'id': 11, 'mes': 'Noviembre' },
        { 'id': 12, 'mes': 'Diciembre' }
      ];
      var mes_actual = $filter('date')(new Date(),'M');

      /* usuarioServices.sRecargarUsuarioSession($scope.fSessionCI).then(function(rpta){
        if(rpta.flag == 1){
          $scope.fSessionCI = rpta.datos;
          $scope.fSessionCI.nombres = $scope.fSessionCI.nombres.toLowerCase();

          if( $scope.fSessionCI.perfil_completo ){
            $("#perfil").addClass("animation-perfil-inicial");
            setTimeout(function() {
              $("#perfil").removeClass("animation-perfil-inicial");
              $("#perfil").addClass("animation-perfil");
            }, 1800);
          }else{
            $("#perfil").removeClass("animation-perfil-inicial animation-perfil");
          }
        }
      }); */

      $scope.goToPerfil = function(){
        $scope.goToUrl('/mi-perfil');
      }

      $scope.goToHistorial = function(){
        $scope.goToUrl('/historial-citas');
      }

      $scope.goToResultados = function(){
        $scope.goToUrl('/resultado-laboratorio');
      }

      $scope.goToSelCita = function(){
        $scope.goToUrl('/seleccionar-cita');
      }

      $scope.goToSelVideoConsulta = function(){
        $scope.goToUrl('/seleccionar-videoconsulta');
      }


      $scope.goToPromociones = function(){
			// comentado por cuarentena
        	$scope.goToUrl('/promociones');

      }
      $scope.goToProcedimiento = function(){
        $scope.goToUrl('/procedimientos');
      }

      $scope.goToVacunas = function(){
        // $scope.goToUrl('/promociones');
        // alert('En construccion');
        $uibModal.open({
          templateUrl: angular.patchURLCI + 'Vacunas/carga_imagen_construccion',
          size: 'lg',
          scope: $scope,
          controller: function ($scope, $modalInstance) {
            $scope.titleForm = '';
            $scope.msj = '';

            $scope.btnCancel = function () {
              $modalInstance.dismiss('btnCancel');
            }
          }
        });
      }

      /* var url = angular.patchURLCI+'ProgramarCita/ver_popup_avisos';
      var size = 'lg';
      var titulo = '';
      var imagen = 'alertas/popup_ce2.png';
      var boolTexto = false;
      var boolUrl = true;
      $uibModal.open({
        templateUrl: url,
        size: size,
        scope: $scope,
        controller: function ($scope, $modalInstance) {
          $scope.titleForm = titulo;
          $scope.imagen = imagen;
          $scope.boolTexto = boolTexto;
          $scope.boolUrl = boolUrl;
          // $scope.mensaje = '';
          $scope.mensaje = '';
          $scope.btnCancel = function(){
            $modalInstance.dismiss('btnCancel');
          }
        }
      }); */

  }])
  .service("inicioServices",function($http, $q) {
    return({
    });
  });