angular.module('theme.atencionesPendientes', ['theme.core.services'])
  .controller('atencionesPendientesController', function(
		$scope,
		$uibModal,
		blockUI,
    atencionesPendientesServices,
		historialCitasServices,
		sedeServices,
		rootServices,
		programarCitaServices,
		ModalReporteFactory
    ){
      'use strict';
      shortcut.remove("F2");

      $scope.modulo = 'atencionesPendientes';
      $scope.verHistorial = true;
      $scope.verChat = false;
      $scope.chatActivo = false;
	  $scope.room = null;

      $scope.dirComprobantes = 'https://citasenlinea.villasalud.pe/comprobantesWeb/';
      blockUI.start('Cargando atenciones pendientes...');

      rootServices.sGetSessionCI().then(function (response) {
        if(response.flag == 1){
          $scope.fSessionCI = response.datos;
        }
      });

      $scope.fBusqueda = {};
      $scope.proce = {};
      $scope.listaTipoCita = [
        {id:'P', descripcion:'CITAS PENDIENTES'},
        {id:'PROC', descripcion:'PROCEDIMIENTOS'}
      ];

      $scope.mostrarCitas = true;
      $scope.mostrarCampanias = false;
      $scope.fBusqueda.tipoCita = $scope.listaTipoCita[0];
      $scope.listaDeProc = [];

      var datos = {
        search:1,
        nameColumn:'tiene_prog_cita'
      };
      sedeServices.sListarSedesCbo(datos).then(function (rpta) {
        $scope.listaSedes = rpta.datos;
        $scope.listaSedes.splice(0,0,{ id : 0, idsede:0, descripcion:'SEDE'});
        $scope.fBusqueda.sede = $scope.listaSedes[0];
      });

      $scope.listarProcedimientos = () => {
          //procedimientos
        $scope.proce.tipoCita = {id:'PROC', descripcion:'PROCEDIMIENTOS'};
        historialCitasServices.sCargarHistorialCitas($scope.proce).then(function(rpta){

            if(rpta.datos.length > 0){
                console.log("Datos Proc",rpta.datos);
                $scope.mostrarProcedimientos = true;
                $scope.listaDeProc = rpta.datos;
                $scope.listaDeProcVC = rpta.datos_vc;
            };
        });
      }
      $scope.listarHistorial = function(){
        blockUI.start('Cargando atenciones pendientes...');
      	$scope.listarProcedimientos();
        historialCitasServices.sCargarHistorialCitas($scope.fBusqueda).then(function(rpta){
          console.log('datos', rpta.datos);
          $scope.listaDeCitas = rpta.datos;
          $scope.listaCitasVC = rpta.datos_vc;
          angular.extend($scope.listaCitasVC, $scope.listaDeProcVC);
          console.log('lista citas', $scope.listaDeCitas);
          console.log('Citas cant', $scope.listaDeCitas.length);
          blockUI.stop();
        });
      }
      $scope.listarHistorial();

      /* $scope.mostrarTablasCampania = function () {
        $log.info('Seleccionamos id:='+$scope.fBusqueda.tipoCita.id);
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
      }; */
      // Muestra el popup de confirmacion luego de dar click en boton REPROGRAMAR
      $scope.callbackReprogCita = function(cita){
        blockUI.start('Abriendo formulario...');

        $uibModal.open({
          templateUrl: angular.patchURLCI + 'ProgramarCita/ver_popup_confirmacion', // confirmaReprogramacion_formView.php
          size: '',
          backdrop: 'static',
          keyboard:false,
          scope: $scope,
          controller: function ($scope, $modalInstance) {
            $scope.fDataModal = {};
            $scope.fDataModal.mensaje = 'Confirmar Reprogramación';
            $scope.fDataModal.oldCita = cita;

            $scope.fDataModal.seleccion = cita.obj_atencion;
            $scope.fDataModal.seleccion.datos_medico = cita.obj_atencion.datos_medico || cita.obj_atencion.medico;

            console.log('cita => ',cita);
            console.log('$scope.fDataModal => ',$scope.fDataModal);

            $scope.btnClose = function(){
              $modalInstance.dismiss('btnClose');
            }

            $scope.btnOk = function(){
              blockUI.start('Reprogramando cita...');
              if( cita.idprogcita > 0 ){
                console.log('Progcita > 0');
                programarCitaServices.sCambiarCita($scope.fDataModal).then(function(rpta){
                  var modal = false;
                  var titulo = '';
                  blockUI.stop();
                  if(rpta.flag==1){
                    $scope.btnClose();
                    $scope.listarHistorial();
                    modal = true;
                    titulo = '¡Genial!';
                  }else if(rpta.flag == 0){
                    modal = true;
                    titulo = 'Aviso';
                  }else{
                    alert('Error inesperado');
                  }

                  if(modal){
                     $scope.mostrarMsj(rpta.flag,titulo,rpta.message, null);
                  }
                });
              }else{
                programarCitaServices.sCambiarProgProc($scope.fDataModal).then(function(rpta){
                  var modal = false;
                  var titulo = '';
                  blockUI.stop();
                  if(rpta.flag==1){
                    $scope.btnClose();
                    $scope.listarHistorial();
                    modal = true;
                    titulo = 'Genial!';
                  }else if(rpta.flag == 0){
                    modal = true;
                    titulo = 'Aviso';
                  }else{
                    alert('Error inesperado');
                  }

                  if(modal){
                     $scope.mostrarMsj(rpta.flag,titulo,rpta.message, null);
                  }
                });
              }
            }

            blockUI.stop();
          }
        });
      }

      $scope.cambiarVista = function(){
        $scope.listarHistorial();
      }

      $scope.descargarComprobanteProc = function (data) {
        blockUI.start('Cargando comprobante...');

        var arrParams = {
          titulo: 'COMPROBANTE DE COMPRA',
          datos: data,
          metodo: 'php'
        };

        arrParams.url = angular.patchURLCI+'Venta/ver_imprimir_comprobante_por_idventa';
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

        arrParams.url = angular.patchURLCI+'Promociones/ver_imprimir_comprobante_desde_id_venta';
        ModalReporteFactory.getPopupReporte(arrParams);

        blockUI.stop();
      };

		$scope.avisoRepr = function(){
			var datos ={
				flag : 0,
				titulo: '¡AVISO!',
				message: 'Puede reprogramar hasta 2 horas antes de su hora de atención.'
			}
			$scope.mostrarMsj(datos.flag,datos.titulo,datos.message, null);
		}
      blockUI.stop();

      $scope.abrirVideollamada = function(cita){
        // MODAL DE VIDEOLLAMADA
        if (cita.bool_btn_inicio === false) {
          $uibModal.open({
            templateUrl: angular.patchURLCI + 'ProgramarCita/ver_popup_aviso',
            size: '',
            scope: $scope,
            controller: function ($scope, $modalInstance) {
              if( cita.estado_vc === true ){
                $scope.titleForm = 'RECUERDA';
                $scope.msj = '<p>Su cita aún no inicia esperar a la hora programada, gracias</p>';
                $scope.msj += '<p class="text-info"><strong>Fecha : '+ cita.fecha  + '</strong></br>';
                $scope.msj += '<strong>Hora programada: '+  cita.hora + '</strong></p>';
              }else{
                $scope.titleForm = 'AVISO';
                $scope.msj = '<span>Ya culminó la hora de su cita, gracias</span>';
              }
              $scope.btnCancel = function () {
                $modalInstance.dismiss('btnCancel');
              }
            }
          });

        }else{
          $scope.verHistorial = false;
          $scope.verChat = true;
          $scope.datosVC = cita;
          $scope.datosVC.temporal = {}
          $scope.datosVC.output = '';
          $scope.datosVC.feedback = '';
          $scope.datosVC.vcIniciado = false;
          console.log('datosVC', $scope.datosVC);

          var datos = {
            // id: '1564117',
            id: $scope.datosVC.iddetalleprogmedico, // 1564117
            tipo_usuario: 'PA',
            sexo_pac: $scope.datosVC.sexo_pac,
            sexo_med: $scope.datosVC.sexo_med
          }
        	console.log('datos', datos);
          // VIDEOLLAMADA - TWILIO
			    $scope.iniciarVC = function(){
            atencionesPendientesServices.sObtenerTokenTwilio(datos).then(function (rpta) {
              $scope.datosVC.vcIniciado = true;

              const tw = Twilio.Video;
              const localMediaContainer = document.getElementById('local-media');
              const remoteMediaContainer = document.getElementById('remote-media-div');

              tw.connect(rpta.token, {
                audio: true,
                name: datos.id,
                video: { width: 640 }
              }).then(room => {
                $scope.room = room;
                console.log(`Connected to Room: ${room.name}`);
                const localParticipant = room.localParticipant;
                console.log(`Connected to the Room as LocalParticipant "${localParticipant.identity}"`);

                // verifica los participantes ya conectados en la sala
                room.participants.forEach(participant => {
                console.log(`Participant "${participant.identity}" connected`);
                participant.tracks.forEach(publication => {
                  if (publication.track) {
                  remoteMediaContainer.appendChild(track.attach());
                  }
                });

                participant.on('trackSubscribed', track => {
                  console.log(`Received a ${track.kind} track with SID ${track.sid}`);
                  remoteMediaContainer.appendChild(track.attach());
                });
                });

                // Cuando un participante se conecta
                room.on('participantConnected', remoteParticipant => {
                console.log(`RemoteParticipant ${remoteParticipant.identity} just connected`)
                console.log(`RemoteParticipant SID is ${remoteParticipant.sid}`);

                remoteParticipant.tracks.forEach(publication => {
                  if (publication.isSubscribed) {
                  const track = publication.track;
                  remoteMediaContainer.appendChild(track.attach());
                  }
                });

                remoteParticipant.on('trackSubscribed', track => {
                  console.log(`Part new, Received a ${track.kind} track with SID ${track.sid}`);
                  remoteMediaContainer.appendChild(track.attach());
                });

                });
                // Cuando un participante se desconecta
                room.on('participantDisconnected', remoteParticipant => {
                  remoteMediaContainer.innerHTML = '';
                  console.log(`remoteParticipant ${remoteParticipant}`);
                  console.log(`Participant disconnected: ${remoteParticipant.identity}`);
                  // To disconnect from a Room
                  room.disconnect();
                });

                $scope.$on('$destroy', function () {
                  console.log('Saliendo del ROOM')
                  room.disconnect();
                });

              }, error => {
                console.error(`Unable to connect to Room: ${error.message}`)
              });

              // Abre la camara local
              tw.createLocalVideoTrack().then(track => {
                console.log(`Created LocalVideoTrack with id ${track.id}`);

                localMediaContainer.appendChild(track.attach());
              });

              // Abre el microfono local
              tw.createLocalAudioTrack().then(track => {
                console.log(`Created LocalAudioTrack with id ${track.id}`);
              });

            });
			    }

          $scope.salirVC = function () {
            if($scope.room){
              $scope.room.disconnect();
              console.log('Desconectado del ROOM');
            }
            $scope.verHistorial = true;
            $scope.verChat = false;
            console.log('saliendo al historial');
            $scope.mostrarAvisoFinVC();
            $scope.datosVC.temporal = {}
            $scope.datosVC.output = '';
            $scope.datosVC.feedback = '';
            $scope.datosVC.vcIniciado = false;
          }


          // CHAT - FIREBASE
          var firebaseConfig = {
            apiKey: angular.fireBaseApiKey,
            authDomain: angular.fireBaseAuthDomain,
            databaseURL: angular.fireBaseDatabaseURL,
            projectId: angular.fireBaseProjectId,
            storageBucket: angular.fireBaseStorageBucket,
            messagingSenderId: angular.fireBaseMessagingSenderId,
            appId: angular.fireBaseAppId
          };
          if(!$scope.chatActivo){
            // Initialize Firebase
            firebase.initializeApp(firebaseConfig);
            $scope.chatActivo = true;
          }
          // Get a reference to the database service
          console.log('codigo cupo', datos.id);
          var refMensajes = firebase.database().ref().child("chats").child(datos.id);


          // recuperando mensajes
          $scope.cargarMensajes = function(){

            var fondoMensajes = document.getElementById("output");

            var mensajes = '';
            var class_sender = '';

            refMensajes.on("value", function (snap) {
              // $scope.datosVC.output = 'nuevo mensaje</br>';
              mensajes = '';
              var datos_id = snap.val();
              var class_msj = '';
              var str_icono = '';
              var class_hora = '';
              angular.forEach(datos_id, function (value, key) {
                var time = new moment(value.datetime).format("HH:mm");
                if (value.sender == 'doctor') {
                  class_msj = 'msj_doctor pull-left';
                  class_sender = 'blue_icon pull-left mr-sm';
				  if(datos.sexo_med == 'M'){
                  	str_icono = '<img src="assets/img/icons/icon_chat_user_md1.png">';
				  }else{
					  console.log('Medico femenino');
                  	str_icono = '<img src="assets/img/icons/icon_chat_user_md2.png">';
				  }
                  class_hora = 'pull-left';
                } else {
                  class_msj = 'msj_paciente pull-right';
                  class_sender = 'green_icon pull-right ml-sm';
				  if(datos.sexo_pac == 'M'){
                  	str_icono = '<img src="assets/img/icons/icon_chat_user1.png">';
				  }else{
                  	str_icono = '<img src="assets/img/icons/icon_chat_user2.png">';
				  }
                  class_hora = 'pull-right';
                }
                mensajes += '<div class="fila_msj">';
                mensajes += '<strong class="icono_msj ' + class_sender + '">' + str_icono + '</strong>';
                mensajes += '<span class="' + class_msj +'">' + value.message + '</span>';
                mensajes += '</div>';
                mensajes += '<div class="fila_msj txt_hora">';
                mensajes += '<span class="' + class_hora + '">' + time + '</span>';
                mensajes += '</div>';
                // $scope.datosVC.output += "<strong>" + value.receiver + "</strong> : " + value.message + "</br>";

              });
              // $scope.datosVC.output = mensajes;
              fondoMensajes.innerHTML = mensajes;
            });
          }
          setTimeout( () => {
            console.log('cargando mensajes...');
            $scope.cargarMensajes();

          }, 500);

          $scope.btnEnviarChat = function () {
            var datetime = new moment().format("YYYY-MM-D HH:mm:ss");
            var datos_envio = {
            	datetime: datetime,
            	msgseen: false,
            	message: $scope.datosVC.temporal.message,
            	receiver: 'doctor',
            	sender: 'paciente',
            	type: 'TEXT'
            }
            console.log('datos_envio', datos_envio);
            refMensajes.push(datos_envio);

            $scope.datosVC.temporal.message = '';
          }



        }

      }

      $scope.mostrarAvisoFinVC = function(){
        $uibModal.open({
        	templateUrl: angular.patchURLCI + 'ProgramarCita/ver_popup_aviso',
        	size: '',
        	scope: $scope,
        	controller: function ($scope, $modalInstance) {

        	    $scope.titleForm = '¡Gracias por permitir cuidar de ti!';
        	    $scope.msj = '<p>Esperamos que tu atencion haya sido la mejor<br/>';
        	    $scope.msj += '<span>Siempre estamos dispuestos a mejorar';
        	    $scope.msj += '</p>';

				$scope.btnCancel = function () {
					$modalInstance.dismiss('btnCancel');
				}
        	}
        });
      }
    })
  .service("atencionesPendientesServices",function($http, $q) {
    return({
      sObtenerTokenTwilio: sObtenerTokenTwilio
    });
    function sObtenerTokenTwilio(datos) {
      var request = $http({
        method: "get",
        url: "https://atencionmedica.villasalud.pe/api/twilio/get-token/" + datos.id + "/" + datos.tipo_usuario,
        // url: "http://168.121.223.121:3000/api/twilio/get-token/" + datos.id + "/" + datos.tipo_usuario,

      });
      return (request.then(handleSuccess, handleError));
    }
  });