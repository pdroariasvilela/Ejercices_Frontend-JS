angular.module('theme.historialCitas', ['theme.core.services'])
  .controller('historialCitasController', function (
    $scope,
    $filter,
    $uibModal,
    $log,
    blockUI,
    historialCitasServices,
    sedeServices,
    especialidadServices,
    parienteServices,
    rootServices,
    programarCitaServices,
    ModalReporteFactory
  ) {
    'use strict';
    shortcut.remove("F2");

    $scope.modulo = 'historialCitas';
    $scope.verHistorial = true;
    $scope.verChat = false;
    $scope.chatActivo = false;

    $scope.dirComprobantes = 'https://citasenlinea.villasalud.pe/comprobantesWeb/';
    blockUI.start('Cargando historial de citas...');

    rootServices.sGetSessionCI().then(function (response) {
      if (response.flag == 1) {
        $scope.fSessionCI = response.datos;
      }
    });

    $scope.fBusqueda = {};
    $scope.listaTipoCita = [
      // { id: 'P', descripcion: 'CITAS PENDIENTES' },
      { id: 'P', descripcion: 'CITAS PENDIENTES' },
      { id: 'R', descripcion: 'CITAS REALIZADAS' },
      { id: 'CAMP', descripcion: 'CAMPAÑAS' },
      { id: 'PROC', descripcion: 'PROCEDIMIENTOS' }
    ];

    $scope.mostrarCitas = true;
    $scope.mostrarCampanias = false;

    $scope.fBusqueda.tipoCita = $scope.listaTipoCita[0];
    var fechaHasta = moment().add(6, 'days');
    $scope.fBusqueda.desde = $filter('date')(moment().toDate(), 'dd-MM-yyyy');
    $scope.fBusqueda.hasta = $filter('date')(fechaHasta.toDate(), 'dd-MM-yyyy');

    var datos = {
      search: 1,
      nameColumn: 'tiene_prog_cita'
    };
    sedeServices.sListarSedesCbo(datos).then(function (rpta) {
      $scope.listaSedes = rpta.datos;
      $scope.listaSedes.splice(0, 0, { id: 0, idsede: 0, descripcion: 'SEDE' });
      $scope.fBusqueda.sede = $scope.listaSedes[0];
    });

    $scope.listarParientes = function (externo) {
      parienteServices.sListarParientesCbo().then(function (rpta) {
        $scope.listaFamiliares = rpta.datos;
        $scope.listaFamiliares.splice(0, 0, { idusuariowebpariente: 0, descripcion: $scope.fSessionCI.nombres + ' [TITULAR]' });
        if (externo) {
          $scope.fBusqueda.familiar = $scope.listaFamiliares[$scope.listaFamiliares.length - 1];
        } else {
          $scope.fBusqueda.familiar = $scope.listaFamiliares[0];
        }
      });
    }
    $scope.listarParientes();

    $scope.listaEspecialidad = [
      { id: 0, idespecialidad: 0, descripcion: 'ESPECIALIDAD ' }
    ];
    $scope.fBusqueda.especialidad = $scope.listaEspecialidad[0];

    $scope.listarEspecialidad = function () {
      var datos = {
        idsede: $scope.fBusqueda.sede.id,
      }

      especialidadServices.sListarEspecialidadesProgAsistencial(datos).then(function (rpta) {
        $scope.listaEspecialidad = rpta.datos;
        $scope.listaEspecialidad.splice(0, 0, { id: 0, idespecialidad: 0, descripcion: 'ESPECIALIDAD ' });
        $scope.fBusqueda.especialidad = $scope.listaEspecialidad[0];
      });
    }

    $scope.listarHistorial = function () {
      blockUI.start('Cargando historial de citas...');
      historialCitasServices.sCargarHistorialCitas($scope.fBusqueda).then(function (rpta) {
        $scope.listaDeCitas = rpta.datos;
        $scope.listaCitasVC = rpta.datos_vc;
        blockUI.stop();
      });
    }
    $scope.listarHistorial();

    $scope.mostrarTablasCampania = function () {
      $log.info('Seleccionamos id:=' + $scope.fBusqueda.tipoCita.id);
      if (angular.isDefined($scope.fBusqueda.tipoCita)) {
        switch ($scope.fBusqueda.tipoCita.id) {
          case 'P':
            $scope.mostrarCitas = true;
            $scope.mostrarCampanias = false;
            $scope.mostrarProcedimientos = false;

            break;

          case 'R':
            $scope.mostrarCitas = true;
            $scope.mostrarCampanias = false;
            $scope.mostrarProcedimientos = false;

            break;

          case 'CAMP':
            $scope.mostrarCitas = false;
            $scope.mostrarCampanias = true;
            $scope.mostrarProcedimientos = false;

            break;

          case 'PROC':
            $scope.mostrarCitas = false;
            $scope.mostrarCampanias = false;
            $scope.mostrarProcedimientos = true;

            break;
        }
      }
    };
    // Muestra el popup de confirmacion luego de dar click en boton REPROGRAMAR
    $scope.callbackReprogCita = function (cita) {
      blockUI.start('Abriendo formulario...');

      $uibModal.open({
        templateUrl: angular.patchURLCI + 'ProgramarCita/ver_popup_confirmacion', // confirmaReprogramacion_formView.php
        size: '',
        backdrop: 'static',
        keyboard: false,
        scope: $scope,
        controller: function ($scope, $modalInstance) {
          $scope.fDataModal = {};
          $scope.fDataModal.mensaje = 'Confirmar Reprogramación';
          $scope.fDataModal.oldCita = cita;

          $scope.fDataModal.seleccion = cita.obj_atencion;
          $scope.fDataModal.seleccion.datos_medico = cita.obj_atencion.datos_medico || cita.obj_atencion.medico;

          console.log('cita => ', cita);
          console.log('$scope.fDataModal => ', $scope.fDataModal);

          $scope.btnClose = function () {
            $modalInstance.dismiss('btnClose');
          }

          $scope.btnOk = function () {
            blockUI.start('Reprogramando cita...');
            if (cita.idprogcita > 0) {
              console.log('Progcita > 0');
              programarCitaServices.sCambiarCita($scope.fDataModal).then(function (rpta) {
                var modal = false;
                var titulo = '';
                blockUI.stop();
                if (rpta.flag == 1) {
                  $scope.btnClose();
                  $scope.listarHistorial();
                  modal = true;
                  titulo = '¡Genial!';
                } else if (rpta.flag == 0) {
                  modal = true;
                  titulo = 'Aviso';
                } else {
                  alert('Error inesperado');
                }

                if (modal) {
                  $scope.mostrarMsj(rpta.flag, titulo, rpta.message, null);
                }
              });
            } else {
              programarCitaServices.sCambiarProgProc($scope.fDataModal).then(function (rpta) {
                var modal = false;
                var titulo = '';
                blockUI.stop();
                if (rpta.flag == 1) {
                  $scope.btnClose();
                  $scope.listarHistorial();
                  modal = true;
                  titulo = 'Genial!';
                } else if (rpta.flag == 0) {
                  modal = true;
                  titulo = 'Aviso';
                } else {
                  alert('Error inesperado');
                }

                if (modal) {
                  $scope.mostrarMsj(rpta.flag, titulo, rpta.message, null);
                }
              });
            }
          }

          blockUI.stop();
        }
      });
    }

    $scope.cambiarVista = function () {
      $scope.listarHistorial();
    }

    $scope.descargarComprobanteProc = function (data) {
      blockUI.start('Cargando comprobante...');

      var arrParams = {
        titulo: 'COMPROBANTE DE COMPRA',
        datos: data,
        metodo: 'php'
      };

      arrParams.url = angular.patchURLCI + 'Venta/ver_imprimir_comprobante_por_idventa';
      ModalReporteFactory.getPopupReporte(arrParams);

      blockUI.stop();
    };

    $scope.descargarComprobanteCampania = function (data) {
      blockUI.start('Cargando comprobante...');

      var arrParams = {
        titulo: 'COMPROBANTE DE COMPRA',
        datos: data,
        metodo: 'php'
      };

      arrParams.url = angular.patchURLCI + 'Promociones/ver_imprimir_comprobante_desde_id_venta';
      ModalReporteFactory.getPopupReporte(arrParams);

      blockUI.stop();
    };

    blockUI.stop();

  })
  .service("historialCitasServices", function ($http, $q) {
    return ({
      sCargarHistorialCitas: sCargarHistorialCitas,
      sObtenerTokenTwilio: sObtenerTokenTwilio
    });
    function sCargarHistorialCitas(datos) {
      var request = $http({
        method: "post",
        url: angular.patchURLCI + "HistorialCitas/list_historial_citas",
        data: datos
      });
      return (request.then(handleSuccess, handleError));
    }
    function sObtenerTokenTwilio(datos) {
      var request = $http({
        method: "get",
        url: "https://atencionmedica.villasalud.pe/api/twilio/get-token/" + datos.id + "/" + datos.tipo_usuario,
        // url: "http://168.121.223.121:3000/api/twilio/get-token/" + datos.id + "/" + datos.tipo_usuario,

      });
      return (request.then(handleSuccess, handleError));
    }
  });