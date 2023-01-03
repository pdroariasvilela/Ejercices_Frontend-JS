angular.module('theme.programarCita', ['theme.core.services','vcRecaptcha'])
  .controller('programarCitaController', ['$scope', '$controller', '$filter', '$uibModal', 'hotkeys','blockUI', '$location',
    'programarCitaServices',
    'sedeServices',
    'especialidadServices',
    'parienteServices',
    'rootServices',
    'ventaServices',
    'vcRecaptchaService',
	'localStorageService',
    function($scope, $controller, $filter, $uibModal, hotkeys, blockUI, $location,
      programarCitaServices,
      sedeServices,
      especialidadServices,
      parienteServices,
      rootServices,
      ventaServices,
      vcRecaptchaService,
	  localStorageService
      ){
    'use strict';
    shortcut.remove("F2");
    $scope.modulo = 'programarCita';
	  $scope.patchURL = angular.patchURL;
	  var limitePediatria = 15;

    $scope.bloquearSelector = function(value){
      $scope.bloqueaSelector = value;
    }

		
    $scope.initSeleccionarCita=function(tipo_cons){
      console.log('tipo_cons', tipo_cons);
      var tipo_cons = tipo_cons || 'cp'; // cp: CITA PRESENCIAL;  vc: VIDEO CONSULTA
      console.log('$scope.familiarSeleccionado', $scope.familiarSeleccionado);
      $scope.fBusqueda = {};
      var fechaHasta = moment().add(6,'days');
      $scope.fBusqueda.desde =  $filter('date')(moment().toDate(),'dd-MM-yyyy');
      $scope.fBusqueda.hasta =  $filter('date')(fechaHasta.toDate(),'dd-MM-yyyy');
      $scope.fSeleccion = {};
      $scope.fBusqueda.tipo_cons = tipo_cons;

      $scope.fPlanning = null;
      $scope.fBusqueda.itemFamiliar = null;
      $scope.listaEspecialidad = [
        { id : 0, idespecialidad:0, descripcion:' --SELECCIONA-- '}
      ];
      $scope.fBusqueda.itemEspecialidad = $scope.listaEspecialidad[0];
      var datos = {
        search:1,
        nameColumn:'tiene_prog_cita'
      };

      rootServices.sGetSessionCI().then(function (response) {
        if(response.flag == 1){
          $scope.fDataUser = response.datos;
          $scope.fSessionCI = response.datos;
          $scope.fSessionCI.compraFinalizada = false;
          if($scope.fSessionCI.compra.listaCitas.length > 0){ // si tiene citas 
            $scope.bloquearSelector(true);
            if($scope.fSessionCI.compra.bool_videoconsulta == true && $scope.fBusqueda.tipo_cons == 'cp'){
              console.log('NO SE PUEDE COMPRAR, REDIRECCIONA');
              var data = {
                tipo: 0,
                titulo: "Aviso",
                mensaje : "Tiene una reserva VIRTUAL, no puede agregar otra PRESENCIAL."
              }
              $scope.mostrarMsj(data.tipo, data.titulo, data.mensaje);
              
              $scope.goToUrl('/seleccionar-videoconsulta');
            }
            if($scope.fSessionCI.compra.bool_videoconsulta == false && $scope.fBusqueda.tipo_cons == 'vc'){
              console.log('NO SE PUEDE COMPRAR, REDIRECCIONA');
              var data = {
                tipo: 0,
                titulo: "Aviso",
                mensaje : "Tiene una reserva PRESENCIAL, no puede agregar otra VIRTUAL."
              }
              $scope.mostrarMsj(data.tipo, data.titulo, data.mensaje);
              $scope.goToUrl('/seleccionar-cita');
            }
          }
          else if( $scope.fSessionCI.compra.listaItems.length > 0 ){ // si tiene items en carrito
            var data = {
              tipo: 0,
              titulo: "Aviso",
              mensaje : "Tiene una reserva de procedimientos no puede agregar una consulta."
            }
            $scope.mostrarMsj(data.tipo, data.titulo, data.mensaje);
            var ruta_origen = localStorageService.get('origen_path');
            console.log('NO SE PUEDE COMPRAR, REDIRECCIONA');
            console.log('origen_path', ruta_origen);
            $scope.goToUrl(ruta_origen);
          }
          else{
            localStorageService.set('origen_path', $location.path());
            $scope.bloquearSelector(false);
            if($scope.timer)
              $scope.timer.viewTimerExpired = false;
          }
          
        }
			  sedeServices.sListarSedesCbo(datos).then(function (rpta) {
          $scope.listaSedes = rpta.datos;
          $scope.listaSedes.splice(0,0,{ id : 0, idsede:0, descripcion:' --SELECCIONA-- '});
          if($scope.fBusqueda.tipo_cons == 'cp'){
            $scope.fBusqueda.itemSede = $scope.listaSedes[0];
          }else{
            angular.forEach($scope.listaSedes, function(value, key) {
              if(value.id == 3){
                $scope.fBusqueda.itemSede = $scope.listaSedes[key];
              }
            });
            $scope.listarEspecialidad();
          }

          if($scope.bloqueaSelector){
            console.log('compra', $scope.fSessionCI.compra);
            angular.forEach($scope.listaSedes, function(value, key) {
              if(value.id == $scope.fSessionCI.compra.itemSede.id){
                $scope.fBusqueda.itemSede = $scope.listaSedes[key];
              }
            });

            var datos = {
              idsede : $scope.fBusqueda.itemSede.id,
              tipo_consulta: tipo_cons
            }
            especialidadServices.sListarEspecialidadesProgAsistencial(datos).then(function (rpta) {
              $scope.listaEspecialidad = rpta.datos;
              $scope.listaEspecialidad.splice(0,0,{ id : 0, idespecialidad:0, descripcion:' --SELECCIONA-- '});
              angular.forEach($scope.listaEspecialidad, function(value, key) {
                if(value.id == $scope.fSessionCI.compra.itemEspecialidad.id){
                  $scope.fBusqueda.itemEspecialidad = $scope.listaEspecialidad[key];
                }
              });
            });
          }
        });
      });

      $scope.listarParientes = function(externo){
        parienteServices.sListarParientesCbo().then(function (rpta) {
          $scope.listaFamiliares = rpta.datos;
          $scope.listaFamiliares.splice(0,0,{
            idusuariowebpariente:0,
            descripcion: $scope.fSessionCI.nombres + ' [TITULAR]',
            paciente: $scope.fSessionCI.paciente,
            edad:$scope.fSessionCI.edad,
            sexo:$scope.fSessionCI.sexo,
            disabled:false
          });
          var linea ={
            idusuariowebpariente:null,
            descripcion: '───────────────────────',
            paciente: null,
            edad:null,
            disabled:true
          }
          $scope.listaFamiliares.push(linea);
          var comando = {
            idusuariowebpariente:-1,
            descripcion: 'AGREGAR PACIENTE',
            paciente: null,
            edad:null,
            disabled:false
          }
          $scope.listaFamiliares.push(comando);
          if(externo){
            $scope.fBusqueda.itemFamiliar = $scope.listaFamiliares[$scope.listaFamiliares.length-3];
          }else{
            $scope.fBusqueda.itemFamiliar = $scope.listaFamiliares[0];
          }

          if($scope.familiarSeleccionado){
            angular.forEach($scope.listaFamiliares, function(value, key) {
            if(value.idusuariowebpariente == $scope.familiarSeleccionado.idusuariowebpariente){
              $scope.fBusqueda.itemFamiliar = $scope.listaFamiliares[key];
            }
            });
          }
        });
      }
      $scope.listarParientes();

      $scope.cambiaFamiliar = function(){
        $scope.fPlanning = null;
        $scope.fBusqueda.itemEspecialidad = $scope.listaEspecialidad[0];
        if($scope.fBusqueda.itemFamiliar.idusuariowebpariente == -1){
          // console.log('nuevo :=> ');
          $scope.btnAgregarNuevoPariente();
        }else{
          // console.log('no hace nada ');

        }
      }

      $scope.listarEspecialidad = function(){
        blockUI.start('Cargando especialidades...');
        $scope.fPlanning = null;
        var datos = {
          idsede : $scope.fBusqueda.itemSede.id,
          tipo_consulta: tipo_cons
        }

        especialidadServices.sListarEspecialidadesProgAsistencial(datos).then(function (rpta) {
          $scope.listaEspecialidad = rpta.datos;
          $scope.listaEspecialidad.splice(0,0,{ id : 0, idespecialidad:0, descripcion:' --SELECCIONA-- '});
          $scope.fBusqueda.itemEspecialidad = $scope.listaEspecialidad[0];
          blockUI.stop();
        });
      }

      $scope.formats = ['dd-MM-yyyy','dd-MMMM-yyyy','yyyy/MM/dd','dd.MM.yyyy','shortDate'];
      $scope.format = $scope.formats[0]; // formato por defecto
      $scope.datePikerOptions = {
        formatYear: 'yy',
        'show-weeks': false,
        //startingDay: 1,
      };

      $scope.disabled = function(date, mode) {
        var fecha = new Date(date).toLocaleDateString('zh-Hans-CN', {
                    day : 'numeric',
                    month : 'numeric',
                    year : 'numeric'
                });
        return (mode === 'day' && (date.getDay() === 0 || moment(fecha).isBefore( moment().toDate().toLocaleDateString('zh-Hans-CN', {
                day : 'numeric',
                month : 'numeric',
                year : 'numeric'
            }) )  ));
      };

      $scope.openDP = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
      }
    }

    $scope.getMedicoAutocomplete = function (value) {
      var params = $scope.fBusqueda;
      params.search= value;
      params.sensor= false;

      return programarCitaServices.sListarMedicosAutocomplete(params).then(function(rpta) {
        $scope.noResultsLM = false;
        if( rpta.flag === 0 ){
          $scope.noResultsLM = true;
        }
        return rpta.datos;
      });
    }

    $scope.getSelectedMedico = function($item, $model, $label){
      $scope.fBusqueda.itemMedico = $item;
      $scope.cargarPlanning();
      $scope.sendEventChangeGA('ProgramarCita','click', $scope.fBusqueda.itemEspecialidad.descripcion + '-' + $scope.fBusqueda.itemSede.descripcion, 0);
      if (screen.width<1020) {
        var target_offset = $("#idfocusMes").offset();
        var target_top = target_offset.top;
        $('html,body').animate({scrollTop:target_top},{duration:5000});
      }
    }
    $scope.onChangeEspecialidad = function (){
      $scope.cargarPlanning();
      $scope.sendEventChangeGA('ProgramarCita','click', $scope.fBusqueda.itemEspecialidad.descripcion + '-' + $scope.fBusqueda.itemSede.descripcion, 0);
      if (screen.width<1020) {
        var target_offset = $("#idfocusMes").offset();
        var target_top = target_offset.top;
        $('html,body').animate({scrollTop:target_top},{duration:5000});

      }
    }

    $scope.onNextMes = function(){
      $scope.fBusqueda.buscar_mes = parseInt($scope.fPlanning.nro_mes)+1;
      $scope.cargarPlanning();
    }

    $scope.viewNext = function(){
      var mes_actual = moment().month()+1;
      return ( mes_actual+1  == parseInt($scope.fPlanning.nro_mes)+1 );
    }

    $scope.onPrevMes = function(){
      $scope.fBusqueda.buscar_mes = parseInt($scope.fPlanning.nro_mes)-1;
      $scope.cargarPlanning();
    }

    $scope.viewPrev = function(){
      var mes_actual = moment().month()+1;
      return ( mes_actual  == parseInt($scope.fPlanning.nro_mes)-1 );
    }

    $scope.cargarPlanning = function(){
      let boolMovil = window.innerWidth < 576 ? true: false;

		  $scope.fPlanning = null;
      if($scope.fBusqueda.desde){

        if( $scope.fBusqueda.itemEspecialidad.id == 31 && $scope.fBusqueda.itemFamiliar.edad > limitePediatria ){
          $scope.mostrarMsj(0,'Aviso', 'Estimado paciente, personas mayores a ' + limitePediatria + ' años no pueden solicitar cita en PEDIATRÍA. Por favor, verificar que la cita sea para la persona indicada..');
          return;
        }


        if($scope.fBusqueda.itemFamiliar.sexo != 'F' && $scope.fBusqueda.itemEspecialidad.id == 18){
          console.log($scope.fBusqueda.itemFamiliar);
          console.log($scope.fBusqueda.itemEspecialidad.id);
          $scope.mostrarMsj(0,'Aviso', 'Estimado paciente. <p>Para comprar cita en GINECOLOGÍA, por favor, complete el nombre de <strong>LA PACIENTE</strong> en el campo: <br><strong>"¿Para quién es la cita?"</strong>.</p>');
          return;
        }
        if ( $scope.fBusqueda.itemEspecialidad.id == 18 && $scope.fBusqueda.itemFamiliar.edad < 18 ) {
          var url = angular.patchURLCI+'ProgramarCita/ver_popup_avisos';
          var size = 'lg';
          var titulo = 'Aviso de Ginecología';
          var imagen = boolMovil? 'alertas/aviso_ginecologia@movil.png' : 'alertas/aviso_ginecologia.png';
          var boolTexto = false;
          $uibModal.open({
            templateUrl: url,
            size: size,
            //backdrop: 'static',
            //keyboard:false,
            scope: $scope,
            controller: function ($scope, $modalInstance) {
              $scope.titleForm = titulo;
              $scope.imagen = imagen;
              $scope.boolTexto = boolTexto;
              // $scope.mensaje = '';
              $scope.mensaje = '';
              $scope.btnCancel = function(){
                $modalInstance.dismiss('btnCancel');
                
              }

              /* setTimeout(function() {
                  $scope.btnCancel();

              }, 3000); */

            }
          });
          return;
        }

        $scope.getPlanning = function(){
          blockUI.start('Cargando programación...');
		      $scope.fBusqueda.tipo_atencion = 'CM';
		      if($scope.fBusqueda.tipo_cons == 'vc'){
			      $scope.fBusqueda.modo_atencion = 'VC';
		      }else{
			      $scope.fBusqueda.modo_atencion = 'PR';
		      }
          programarCitaServices.sCargarPlanning($scope.fBusqueda).then(function(rpta){
            $scope.fPlanning = rpta.planning;
            $scope.fBusqueda.buscar_mes = null;
            blockUI.stop();
          });
        }
        if( $scope.fBusqueda.itemEspecialidad.id != 31 && $scope.fBusqueda.itemFamiliar.edad <= limitePediatria ){
          // console.log('popup aviso');
          var url = angular.patchURLCI+'ProgramarCita/ver_popup_avisos';
          var size = 'lg';
          var titulo = 'Aviso de Pediatria';
          var imagen = 'alertas/aviso_pediatria.jpg';
          var boolTexto = false;
          $uibModal.open({
            templateUrl: url,
            size: size,
            //backdrop: 'static',
            //keyboard:false,
            scope: $scope,
            controller: function ($scope, $modalInstance) {
              $scope.titleForm = titulo;
              $scope.imagen = imagen;
              $scope.boolTexto = boolTexto;
              // $scope.mensaje = '';
              $scope.mensaje = 'Se recomienda que los pacientes menores de 15 años pasen por consulta previa en Pediatría';
              $scope.btnCancel = function(){
                $modalInstance.dismiss('btnCancel');
                $scope.getPlanning();
              }

              /* setTimeout(function() {
                  $scope.btnCancel();

              }, 3000); */

            }
          });
        } else if( $scope.fBusqueda.itemEspecialidad.id == 29 ) { // 29: oftalmologia
          var url = angular.patchURLCI+'ProgramarCita/ver_popup_avisos';
          var size = 'lg';
          var titulo = 'Aviso de Oftalmología';
          var imagen = 'alertas/aviso_oftalmo.jpg';
          var boolTexto = false;
          $uibModal.open({
            templateUrl: url,
            size: size,
            //backdrop: 'static',
            //keyboard:false,
            scope: $scope,
            controller: function ($scope, $modalInstance) {
              $scope.titleForm = titulo;
              $scope.imagen = imagen;
              $scope.boolTexto = boolTexto;
              // $scope.mensaje = '';
              $scope.mensaje = '';
              $scope.btnCancel = function(){
                $modalInstance.dismiss('btnCancel');
                $scope.getPlanning();
              }

              /* setTimeout(function() {
                  $scope.btnCancel();

              }, 3000); */

            }
          });
        }
        else{
          $scope.getPlanning();
        }


      }
    }

    $scope.goToHistorial = function(){
      $scope.goToUrl('/historial-citas');
    }

    $scope.goToSelCita = function(){
      $scope.goToUrl('/seleccionar-cita');
    }

      $scope.goToSelVideoConsulta = function () {
        $scope.goToUrl('/seleccionar-videoconsulta');
      }

    $scope.btnAgregarNuevoPariente = function(){
      var callback = function(){
        $scope.listarParientes(true);
      }

      $controller('parienteController', {
        $scope : $scope
      });
      $scope.btnNuevoPariente(callback);
    }

    $scope.verTurnosDisponibles = function(item, boolExterno, callback){
      if(!item.tiene_prog){
        return;
      }

      blockUI.start('Cargando turnos disponibles...');
      if(boolExterno){
        $scope.boolExterno = true;
      } else {
        $scope.boolExterno = false;
      }

      $uibModal.open({
        templateUrl: angular.patchURLCI+'ProgramarCita/ver_popup_turnos',
        size: 'lg',
        backdrop: 'static',
        keyboard:false,
        scope: $scope,
        controller: function ($scope, $modalInstance) {
          $scope.titleForm = 'Turnos Disponibles';
          var datos = item;
          datos.medico = $scope.fBusqueda.itemMedico;
          $scope.fPlanning.detalle = item;
          $scope.fSeleccion = {};

          $scope.cargarTurnos = function(){
			      console.log('Cargando turnos disponibles', $scope.fPlanning.detalle);
            blockUI.start('Cargando turnos disponibles...');
            programarCitaServices.sCargarTurnosDisponibles($scope.fPlanning.detalle).then(function(rpta){
              $scope.fPlanning.turnos=rpta.datos;
              blockUI.stop();
            });
          }
          $scope.cargarTurnos();

          $scope.btnCancel = function(){
            $scope.fSeleccion = {};
            $modalInstance.dismiss('btnCancel');
          }

          $scope.checkedCupo = function(cupo){
            $scope.fSeleccion = cupo;
			      $scope.fSeleccion.precio_sede = $scope.fPlanning.producto_precio.precio_sede;
            cupo.checked=true;
            angular.forEach($scope.fPlanning.turnos, function(value, key){
              angular.forEach(value.cupos, function(objCupo, indCupo){
                if(objCupo.iddetalleprogmedico != cupo.iddetalleprogmedico){
                  $scope.fPlanning.turnos[key].cupos[indCupo].checked = false;
                }
              });
            });
          }

          $scope.btnReservarTurno = function(){
            var selecciono = true;
            if(!($scope.fSeleccion.iddetalleprogmedico && $scope.fSeleccion.iddetalleprogmedico != '' && $scope.fSeleccion.checked)){
              var selecciono = false;
            }

            if(!selecciono){
              $uibModal.open({
                templateUrl: angular.patchURLCI+'ProgramarCita/ver_popup_aviso',
                size: 'sm',
                //backdrop: 'static',
                //keyboard:false,
                scope: $scope,
                controller: function ($scope, $modalInstance) {
                  $scope.titleForm = 'Aviso';
                  $scope.msj = 'Debe seleccionar un cupo';

                  $scope.btnCancel = function(){
                    $modalInstance.dismiss('btnCancel');
                  }
                }
              });
              return;
            }

            var mismo_turno = false;
            var misma_especialidad = false;
            var mensaje = '';
            angular.forEach($scope.fSessionCI.compra.listaCitas, function(value, key){
              if( value.seleccion.iddetalleprogmedico == $scope.fSeleccion.iddetalleprogmedico ){
                mismo_turno = true;
                mensaje = 'El turno seleccionado ya ha sido escogido para otra cita de su sesión';
              }else{
                if( value.busqueda.itemEspecialidad.id == $scope.fBusqueda.itemEspecialidad.id
                  && value.busqueda.itemFamiliar.idusuariowebpariente === $scope.fBusqueda.itemFamiliar.idusuariowebpariente
                ){
                  $scope.fSeleccion.checked=false;
                  misma_especialidad = true;
                  mensaje = 'Ya ha elegido una cita para el mismo paciente y la misma especialidad';
                }
              }

            });

            if(mismo_turno || misma_especialidad ){
              $uibModal.open({
                templateUrl: angular.patchURLCI+'ProgramarCita/ver_popup_aviso',
                size: 'sm',
                //backdrop: 'static',
                //keyboard:false,
                scope: $scope,
                controller: function ($scope, $modalInstance) {
                  $scope.titleForm = 'Aviso';
                  $scope.msj = mensaje;

                  $scope.btnCancel = function(){
                    $modalInstance.dismiss('btnCancel');
                  }
                }
              });
            }
            else{
              var datos = {
                busqueda:angular.copy($scope.fBusqueda),
                seleccion:angular.copy($scope.fSeleccion)
              }

              //   $scope.fSessionCI.compra.listaCitas.push(datos);
              var fSession = angular.copy($scope.fSessionCI);
              fSession.compra.listaCitas.push(datos);
              programarCitaServices.sActualizarListaCitasSession(fSession).then(function(rpta){
                if(rpta.flag == 1){
                  $scope.fSessionCI.compra.listaCitas.push(datos);
                  if($scope.fSessionCI.compra.listaCitas.length > 0){
                    $scope.bloquearSelector(true);
                    var target_offset = $("#idfocus").offset();
                    var target_top = target_offset.top;
                    $('html,body').animate({scrollTop:target_top},{duration:3000});
                  }else{
                    $scope.bloquearSelector(false);
                  }
                }else{
                  $scope.mostrarMsj(1,'Aviso',rpta.message);
                  $scope.fSessionCI = rpta.datos;
                }
                $scope.btnCancel();
              });
            }
          }

          $scope.btnCambiarTurno = function(){
            if(!$scope.fSeleccion){
             return;
            }

            $scope.fPlanning.citas.seleccion = $scope.fSeleccion;
            $scope.fDataModal= $scope.fPlanning.citas;
            $scope.fDataModal.oldCita.itemFamiliar.paciente = $scope.fDataModal.oldCita.itemFamiliar.paciente.toUpperCase();
            $scope.fDataModal.mensaje = '¿Estas seguro de realizar el cambio?';
            console.log($scope.fDataModal);
            $uibModal.open({
            templateUrl: angular.patchURLCI+'ProgramarCita/ver_popup_confirmacion',
            size: '',
            //backdrop: 'static',
            //keyboard:false,
            scope: $scope,
            controller: function ($scope, $modalInstance) {
              $scope.titleForm = 'Aviso';
              $scope.msj = 'El turno seleccionado ya ha sido escogido para otra cita de su sesión';

              $scope.btnClose = function(){
              $modalInstance.dismiss('btnClose');
              }

              $scope.btnOk = function(){
              blockUI.start('Reprogramando cita...');
              programarCitaServices.sCambiarCita($scope.fPlanning.citas).then(function(rpta){
                var modal = false;
                var titulo = '';
                blockUI.stop();
                if(rpta.flag==1){
                $scope.btnClose();
                $scope.btnCancel();
                modal = true;
                titulo = 'Genial!';
                }else if(rpta.flag == 0){
                modal = true;
                titulo = 'Aviso';
                $scope.cargarTurnos();
                }else{
                alert('Erros inesperado');
                }

                if(modal){
                $scope.mostrarMsj(rpta.flag,titulo,rpta.message, callback);
                }
              });
              }
            }
            });
          }

          blockUI.stop();
        }
      });
    }

    $scope.quitarDeLista = function(index, fila){
      blockUI.start('Actualizando...');
      //console.log(index, fila);
      programarCitaServices.sLiberaCupo($scope.fSessionCI.compra.listaCitas[index]).then(function(rpta){
        console.log(rpta);
        $scope.fSessionCI.compra.listaCitas.splice( index, 1 );
        if($scope.fSessionCI.compra.listaCitas.length > 0){
          $scope.bloquearSelector(true);
        }else{
          $scope.bloquearSelector(false);
        }

        programarCitaServices.sActualizarListaCitasSession($scope.fSessionCI).then(function(rpta){
          //console.log(rpta);
          blockUI.stop();
        });
      });
    }

    $scope.resumenReserva = function(){
      blockUI.start('Verificando reserva...');
      ventaServices.sValidarCitas($scope.fSessionCI).then(function(rpta){
        //console.log(rpta);
        if(rpta.flag === 0){
			$scope.fSessionCI.compra.listaCitas = angular.copy(rpta.listaDefinitiva);
			$scope.mostrarMsj(2,'Aviso', rpta.message + '. Selecciona nuevas citas.');
        }else if(rpta.flag == 2){
			blockUI.stop();
			$scope.mostrarMsj(2,'Aviso', rpta.message);
			return;
        }

        if($scope.fSessionCI.compra.listaCitas.length > 0){
          programarCitaServices.sActualizarListaCitasSession($scope.fSessionCI).then(function(rpta){
            if(rpta.flag == 1){
              if(rpta.datos.compra.bool_videoconsulta){
                $scope.goToUrl('/resumen-videoconsulta');
              }else{
                $scope.goToUrl('/resumen-cita');
              }
            }
            else{
              $scope.mostrarMsj(1,'Aviso',rpta.message);
            }
            blockUI.stop();
          });
        }else{
          $scope.mostrarMsj(0,'Aviso', rpta.message + '. Selecciona nuevas citas.');
          setTimeout(function() {
            $scope.goToUrl('/seleccionar-cita');
          }, 5000);
          blockUI.stop();
        }
      });
    }
    /*CREDENCIALES RECAPTCHA*/
    $scope.model = {
      key: angular.keyRecaptcha
    };

    $scope.setResponse = function (response) {
      $scope.response = response;
    };

    $scope.setWidgetId = function (widgetId) {
      $scope.widgetId = widgetId;
    };
    $scope.cbExpiration = function() {
      vcRecaptchaService.reload($scope.widgetId);
      $scope.response = null;
    };
    $scope.recapcha = false;
    $scope.changeAcepta = function(){
      if($scope.acepta ){
        $scope.acepta = false;
      }else{
        $scope.acepta = true;
      }
    }
	// MOSTRAR RESUMEN DE COMPRA DESPUES DE HACER CLICK EN BOTON "CONFIRMAR Y PAGAR"
    $scope.initResumenReserva = function(bool_vc){
      var bool_vc = bool_vc || false;
      console.log('bool_vc', bool_vc);
      // MODAL DE VIDEOLLAMADA
      if (bool_vc){
        $uibModal.open({
                templateUrl: angular.patchURLCI+'ProgramarCita/ver_popup_aviso',
                size: '',
                scope: $scope,
                controller: function ($scope, $modalInstance) {
            $scope.titleForm = 'RECUERDA';
            $scope.msj = '<span>Estás comprando una cita médica para asistir <span><b>por videollamada en línea</b></span>.</span>';
            $scope.btnCancel = function(){
              $modalInstance.dismiss('btnCancel');
            }
          }
        });

      }

      blockUI.start('Verificando reserva...');
      $scope.acepta = false;
      $scope.viewResumenCita = true;
      $scope.viewResumenCompra = false;

      /*
      $scope.viewResumenCita = false;
      $scope.viewResumenCompra = true;
      */

      $scope.generarCargo = function(token){
        blockUI.start('Procesando pago... Espere y NO recargue la página');
        var datos = {
          usuario:$scope.fSessionCI,
          token: token
        }

        ventaServices.sGenerarVentaCitas(datos).then(function(rpta){
          var titulo = '';
          var url = '';
          var size = '';
          var modal = true;
          if(rpta.flag == 1){
            titulo = 'Genial!';
            url = angular.patchURLCI+'ProgramarCita/ver_popup_compra_exitosa';
            size = 'lg';
            $scope.exitTimer();
          }else if(rpta.flag == 0){
            titulo = 'Aviso!';
            url = angular.patchURLCI+'ProgramarCita/ver_popup_aviso';
            size = 'sm';
          }else if(rpta.flag == 2){
            $scope.fSessionCI.compra.listaCitas = angular.copy(rpta.listaDefinitiva);
            modal = false;
            $scope.mostrarMsj(0,'Aviso', rpta.message + '. Selecciona nuevas citas.');
          }else{
            alert('Error inesperado');
            modal = false;
          }

          if(modal){
            $uibModal.open({
              templateUrl: url,
              size: size,
              //backdrop: 'static',
              //keyboard:false,
              scope: $scope,
              controller: function ($scope, $modalInstance) {
                $scope.titleForm = titulo;
                $scope.msj = rpta.message;

                $scope.btnCancel = function(){
                  $modalInstance.dismiss('btnCancel');
                }

                if(rpta.flag == 1){
                  setTimeout(function() {
                    var callback = function(){
                      $scope.btnCancel();
                    }
                    $scope.goToResumenCompra(callback);
                  }, 3000);
                }
                blockUI.stop();
              }
            });
          }
        });
      }

      window.initCulqi = function(value, key) {
        Culqi.publicKey = key; //'pk_test_5waw7MlH2GomYjCx';
        Culqi.settings({
            title: 'Villa Salud',
            currency: 'PEN',
            description: 'Pago de Citas en linea',
            amount: value,
        });

        window.culqi = function(){
          if(Culqi.token) { // ¡Token creado exitosamente!
            // Get the token ID:
            var token = Culqi.token;
            $scope.generarCargo(token);
            //console.log(token);
          }else{
            console.log('Culqi.error',Culqi.error);
            if($scope.isLoggedIn){
              $uibModal.open({
                templateUrl: angular.patchURLCI+'ProgramarCita/ver_popup_aviso',
                size: 'sm',
                //backdrop: 'static',
                //keyboard:false,
                scope: $scope,
                controller: function ($scope, $modalInstance) {
                  $scope.titleForm = 'Aviso';
                  $scope.msj = Culqi.error.user_message;
                  $scope.btnCancel = function(){
                    $modalInstance.dismiss('btnCancel');
                  }
                }
              });
            }
          }
        }
      }

      $scope.pagar = function(){
        if(!$scope.acepta){
          $scope.mostrarMsj(0,'Aviso', 'Debe aceptar los Términos y Condiciones');
          return;
        }
        console.log('$scope.fSessionCI',$scope.fSessionCI);
        $scope.sendEventChangeGA('BotonPagar','click', 'ProgramarCita', 0);
        Culqi.open();
      }

      rootServices.sGetSessionCI().then(function (response) {
        if(response.flag == 1){
          $scope.pasarela_pago = response.datos.pasarela_pago;
          $scope.fSessionCI = response.datos;
          programarCitaServices.sActualizarListaCitasSession($scope.fSessionCI).then(function(response){

            $scope.totales = {};
            $scope.totales.total_productos = response.datos.compra.totales.total_productos;
            $scope.totales.total_servicio = response.datos.compra.totales.total_servicio;
            $scope.totales.total_pago = response.datos.compra.totales.total_pago;
            $scope.totales.total_pago_culqi = response.datos.compra.totales.total_pago_culqi;

            var datos = {
              tipo: 'pago',
              idsedeempresaadmin: $scope.fSessionCI.compra.itemSede.idsedeempresaadmin,
            }
            rootServices.sGetConfig(datos).then(function(rpta){
              window.initCulqi($scope.totales.total_pago_culqi,rpta.datos.CULQI_PUBLIC_KEY);
            });

            if($scope.fSessionCI.compra.listaCitas.length < 1){
              $scope.goToUrl('/seleccionar-cita');
            }

            $scope.listaCitas = $scope.fSessionCI.compra.listaCitas;
            if($scope.fSessionCI.compra.listaCitas.length>0){
              console.log('$scope.fSessionCI',$scope.fSessionCI);
              $scope.starTimer();
            }
            blockUI.stop();
          });
        }
      });
    }

    $scope.goToResumenCompra = function(callback){
      $scope.goToUrl('/resumen-compra');
    }

    $scope.initResumenCompra = function(callback){
      $scope.habilitaBanner = false;
      blockUI.start('Cargando resumen de compra...');
      console.log('Cargando resumen de compra...');
      rootServices.sGetSessionCI().then(function (response) {
        if(response.flag == 1){
          $scope.fSessionCI = response.datos;
          $scope.habilitaBanner = true;
          $scope.getNotificacionesEventos();
        }

        $scope.viewResumenCita = false;
        $scope.viewResumenCompra = true;

        blockUI.stop();
        //callback();
      });
    }



    /* ============================ */
    /* ATAJOS DE TECLADO NAVEGACION */
    /* ============================ */
    hotkeys.bindTo($scope)
      .add({
        combo: 'alt+n',
        description: 'Nueva especialidad',
        callback: function() {
          $scope.btnNuevo();
        }
      })
      .add ({
        combo: 'e',
        description: 'Editar especialidad',
        callback: function() {
          if( $scope.mySelectionGrid.length == 1 ){
            $scope.btnEditar();
          }
        }
      })
      .add ({
        combo: 'del',
        description: 'Anular especialidad',
        callback: function() {
          if( $scope.mySelectionGrid.length > 0 ){
            $scope.btnAnular();
          }
        }
      })
      .add ({
        combo: 'b',
        description: 'Buscar especialidad',
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
  .service("programarCitaServices",function($http, $q) {
    return({
      sCargarPlanning:sCargarPlanning,
      sCargarTurnosDisponibles:sCargarTurnosDisponibles,
      sListarMedicosAutocomplete:sListarMedicosAutocomplete,
      sActualizarListaCitasSession:sActualizarListaCitasSession,
      sGenerarVenta:sGenerarVenta,
      sVerificaEstadoCita:sVerificaEstadoCita,
      sCambiarCita:sCambiarCita,
      sCambiarProgProc:sCambiarProgProc,
      sLiberaCupo:sLiberaCupo,
      sLiberaCupoCarrito:sLiberaCupoCarrito,
      sLiberarCuposSession:sLiberarCuposSession,
    });
    function sCargarPlanning(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"ProgramarCita/cargar_planning",
            data : datos
      });
      if (screen.width<1020) {
        var target_offset = $("#idfocusMes").offset();
        if (!target_offset) {
          console.log('esta indefinido');
        }else{
          var target_top = target_offset.top;
          $('html,body').animate({scrollTop:target_top},{duration:5000});
        }


      }
      return (request.then( handleSuccess,handleError ));
    }
    function sCargarTurnosDisponibles(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"ProgramarCita/cargar_turnos_disponibles",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sListarMedicosAutocomplete(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"ProgramarCita/lista_medicos_autocomplete",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sActualizarListaCitasSession(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"ProgramarCita/actualizar_lista_citas_session",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sGenerarVenta(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"ProgramarCita/generar_venta",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sVerificaEstadoCita(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"ProgramarCita/verifica_estado_cita",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sCambiarCita(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"ProgramarCita/cambiar_cita",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sCambiarProgProc(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"ProgramarCita/reprogramar_proc",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sLiberaCupo(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"ProgramarCita/libera_cupo_quitar_lista",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sLiberaCupoCarrito(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"ProgramarCita/libera_cupo_quitar_carrito",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sLiberarCuposSession(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"ProgramarCita/libera_lista_citas_session",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    // function goToId(idName)
    // {
    //   if($("#"+idName).length)
    //   {
    //     var target_offset = $("#"+idName).offset();
    //     var target_top = target_offset.top;
    //     $('html,body').animate({scrollTop:target_top},{duration:"slow"});
    //   }
    // }
  });