angular.patchURL = dirWebRoot;
angular.patchURLCI = dirWebRoot + 'ci.php/';
console.log('patchURLCI', angular.patchURLCI);
angular.dirViews = angular.patchURL + 'application/views/';
angular.keyRecaptcha = keyRecaptcha;
/* Chat - Firebase */
angular.fireBaseApiKey = fireBaseApiKey;
angular.fireBaseAuthDomain = fireBaseAuthDomain;
angular.fireBaseDatabaseURL = fireBaseDatabaseURL;
angular.fireBaseProjectId = fireBaseProjectId;
angular.fireBaseStorageBucket = fireBaseStorageBucket;
angular.fireBaseMessagingSenderId = fireBaseMessagingSenderId;
angular.fireBaseAppId = fireBaseAppId;
function handleError(response) {
  if (!angular.isObject(response.data) || !response.data.message) {
    return ($q.reject("An unknown error occurred."));
  }
  return ($q.reject(response.data.message));
}
function handleSuccess(response) {
  return (response.data);
}
function redondear(num, decimal) {
  var decimal = decimal || 2;
  if (isNaN(num) || num === 0) {
    return parseFloat(0);
  }
  var factor = Math.pow(10, decimal);
  return Math.round(num * factor) / factor;
}

function newNotificacion(body, icon, title, tag) {
  var options = {
    body: body,
    icon: icon,
    tag: tag
  }

  var n = new Notification(title, options);
  //console.log('se creo', n);
}

appRoot = angular.module('theme.core.main_controller', ['theme.core.services', 'blockUI'])
  .controller('MainController', ['$scope', '$route', '$uibModal', '$document', '$theme', '$timeout', '$interval', 'progressLoader', 'wijetsService', '$routeParams', '$location', '$controller', 'toaster',
    'blockUI', 'uiGridConstants', 'pinesNotifications',
    'rootServices',
    'usuarioServices',
    'ModalReporteFactory',
    'programarCitaServices',
    'localStorageService',
    'promocionesServices',
    function ($scope, $route, $uibModal, $document, $theme, $timeout, $interval, progressLoader, wijetsService, $routeParams, $location, $controller, toaster,
      blockUI, uiGridConstants, pinesNotifications,
      rootServices,
      usuarioServices,
      ModalReporteFactory,
      programarCitaServices,
      localStorageService, promocionesServices) {
      //'use strict';
      $scope.fAlert = {};
      $scope.arrMain = {};
      $scope.fSessionCI = {};
      $scope.fSessionCI.listaEspecialidadesSession = [];
      $scope.fSessionCI.listaNotificaciones = {};
      $scope.bool_toaster = false;

      $scope.arrMain.sea = {};
      $scope.localLang = {
        selectAll: "Seleccione todo",
        selectNone: "Quitar todo",
        reset: "Resetear todo",
        search: "Escriba aquí para buscar...",
        nothingSelected: "No hay items seleccionados"
      };
      $scope.layoutFixedHeader = $theme.get('fixedHeader');
      $scope.layoutPageTransitionStyle = $theme.get('pageTransitionStyle');
      $scope.layoutDropdownTransitionStyle = $theme.get('dropdownTransitionStyle');
      $scope.layoutPageTransitionStyleList = ['bounce',
        'flash',
        'pulse',
        'bounceIn',
        'bounceInDown',
        'bounceInLeft',
        'bounceInRight',
        'bounceInUp',
        'fadeIn',
        'fadeInDown',
        'fadeInDownBig',
        'fadeInLeft',
        'fadeInLeftBig',
        'fadeInRight',
        'fadeInRightBig',
        'fadeInUp',
        'fadeInUpBig',
        'flipInX',
        'flipInY',
        'lightSpeedIn',
        'rotateIn',
        'rotateInDownLeft',
        'rotateInDownRight',
        'rotateInUpLeft',
        'rotateInUpRight',
        'rollIn',
        'zoomIn',
        'zoomInDown',
        'zoomInLeft',
        'zoomInRight',
        'zoomInUp'
      ];
      $scope.dirImages = angular.patchURL + 'assets/img/';
      $scope.dirComprobantes = 'https://citasenlinea.villasalud.pe/comprobantesWeb/';
      $scope.layoutLoading = true;
      $scope.blockUI = blockUI;
      $scope.openPend = true;
      $scope.fArrMetodos = {}

      // $("#topnav.navbar-graylight .navbar-brand").addClass()
      $scope.$on('$routeChangeStart', function () {
        progressLoader.start();
        progressLoader.set(50);
        if ($location.path() == '/atenciones-pendientes') {
          console.log('atencion pendiente');
          $scope.openPend = false;
        }

      });

      $scope.$on('$routeChangeSuccess', function () {
        $scope.bool_toaster = false;
        $scope.openPend = true;
        $scope.getValidateSession();
        progressLoader.end();
        if ($scope.layoutLoading) {
          $scope.layoutLoading = false;
        }
        if ($location.path() == '/atenciones-pendientes') {
          console.log('atencion pendiente');
          $scope.openPend = false;
        }
        wijetsService.make();
      });

      $scope.getLayoutOption = function (key) {
        return $theme.get(key);
      };

      $scope.getUrlActual = function () {
        return $location.path();
      }

      $scope.isLoggedIn = false;
      $scope.logOut = function () {
        $scope.isLoggedIn = false;
        $scope.captchaValido = false;
        //localStorage.removeItem("tidioId");
      };

      $scope.logIn = function () {
        $scope.isLoggedIn = true;
        //setDataChatTidio();
      };

      $scope.close_banner = function () {
        $scope.openPend = false;
      }
      // $scope.fArrMetodos.push($scope.close_banner);
      $scope.goToUrl = function (path) {
        $location.path(path).search({});
        var page = '/citasenlinea.villasalud.pe' + path;
        var title = '';

        switch (path) {
          case "/seleccionar-cita":
            title = "Seleccionar Citas - Sistema de Citas en Linea";
            break;
          case "/resumen-cita":
            title = "Resumen de Citas - Sistema de Citas en Linea";
            break;
          case "/resumen-compra":
            title = "Resumen de Compra de Citas - Sistema de Citas en Linea";
            break;
          case "/historial-citas":
            title = "Historial de Citas - Sistema de Citas en Linea";
            break;
          case "/resultado-laboratorio":
            title = "Resultados de Laboratorio - Sistema de Citas en Linea";
            break;
          case "/promociones":
            title = "Promociones - Sistema de Citas en Linea";
            break;
          case "/promociones-detalle":
            objCampania = localStorageService.get('item_catalogo');
            console.log('objCampania', objCampania);
            $scope.sendEventChangeGA('SeleccionarCampaña', 'click', objCampania.nombre_campania, 0);
            $scope.sendEventChangeGA('SeleccionarCampañaPaquete', 'click', objCampania.nombre_paquete + '-' + objCampania.nombre_campania, 0);
            title = "Detalle Promoción - Sistema de Citas en Linea";
            break;
          case "/promociones-resumen":
            objCompra = localStorageService.get('resumen_pago');
            console.log('objCompra', objCompra);
            title = "Detalle Compra - Sistema de Citas en Linea";
            break;
          case "/mi-perfil":
            title = "Mi perfil - Sistema de Citas en Linea";
            break;
          case "/login":
            title = "Login - Sistema de Citas en Linea";
            break;
          default:
            title = 'Sistema de Citas en Linea';
            break;
        }

        ga('set', 'page', page);
        ga('set', 'title', title);
        ga('send', 'pageview');

        if (path == '/promociones-detalle') {
          fbq('track', 'AddToCart', {
            content_name: objCampania.nombre_paquete + '-' + objCampania.nombre_campania,
            content_ids: objCampania.id_paquete,
            content_type: 'campaña',
            value: objCampania.precio_paquete,
            currency: 'PEN'
          });
        } else if (path == '/promociones-resumen') {
          fbq('track', 'Purchase', {
            content_name: objCompra.obj_peticion.obj_paquete.descripcion + '-' + objCompra.obj_peticion.obj_paquete.nombre_campania,
            content_ids: objCompra.obj_peticion.obj_paquete.id_paquete,
            content_type: 'campaña',
            num_items: 1,
            order_id: objCompra.result_venta.orden_venta,
            value: parseFloat(objCompra.obj_peticion.obj_paquete.monto_total),
            currency: 'PEN'
          });
        } else {
          fbq('track', 'ViewContent', {
            content_name: title,
            content_type: 'pagina',
            content_url: page,
          });
        }
      };

      $scope.sendEventChangeGA = function (eventCategory, eventAction, eventLabel, eventValue) {
        ga('send', 'event', eventCategory, eventAction, eventLabel, eventValue);
      }

      $scope.cargarItemFamiliar = function (item) {
        $scope.familiarSeleccionado = item;
      }

      $scope.btnLogoutToSystem = function () {
        rootServices.sLogoutSessionCI().then(function () {
          $scope.fSessionCI = {};
          $scope.listaUnidadesNegocio = {};
          $scope.listaModulos = {};
          $scope.logOut();
          $scope.goToUrl('/login');
        });
      }

      $scope.mostrarMsjPaquete = function (tipo, titulo, msg) {
        $uibModal.open({
          templateUrl: angular.patchURLCI + 'ProgramarCita/ver_popup_aviso',
          size: 'sm',
          backdrop: 'static',
          keyboard: false,
          scope: $scope,
          controller: function ($scope, $modalInstance) {
            $scope.titleForm = titulo;
            $scope.msj = msg;

            $scope.btnCancel = function () {
              $scope.goToUrl('/login');
              $modalInstance.dismiss('btnCancel');
            }

            if (tipo == 2) {
              setTimeout(function () {
                $scope.btnCancel();
              }, 10000);
            }
          }
        });
      };

      $scope.getValidateSession = function (url_destinity) {
        // console.log('url_destinity=>', url_destinity);
        rootServices.sGetSessionCI().then(function (response) {
          if (response.flag == 1) {
            if (response.datos.compras_realizadas > 0) {
              $scope.bannerText1 = "¡Felicitaciones tienes " + response.datos.compras_realizadas + " posibilidades de Ganar una entrada para 2 partidos!";
              $scope.bannerText2 = "¡A más compras por Internet, más posibilidades de ganar.!";
              $scope.bannerText3 = " ";
            } else {
              $scope.bannerText1 = "¡Aún puedes participar en el sorteo para una entrada para los 2 partidos de Perú!";
              $scope.bannerText2 = "¡Realiza tus compras por Internet y acumula puntos!";
              $scope.bannerText3 = "A más puntos, más posibilidades de ganar.";
            }
            toaster.clear();

            if (response.datos.vc_pendientes.length > 0 && $scope.getUrlActual() != '/atenciones-pendientes') {
              var eventTime = moment(response.datos.vc_pendientes[0]['fecha_atencion_cita'], 'YYYY-MM-DD HH:mm:ss').unix();
              // var eventTime = moment('2020-07-16 17:55:00', 'YYYY-MM-DD HH:mm:ss').unix(); // 1594924200
              // console.log('fecha_cita', response.datos.vc_pendientes[0]['fecha_atencion_cita']);
              var currentTime = moment().local().unix();

              var dif_segundos = eventTime - currentTime;
              var tiempo_espera = 600; // 10min

              // dif_segundos = 605;
              // console.log('dif_segundos 1ra', dif_segundos); // 1595522700
              if (dif_segundos > 0 && $scope.bool_toaster === false) {
                if (dif_segundos <= tiempo_espera) {
                  // console.log('lanza el popup inmediatamente');
                  $scope.pop(response.datos, dif_segundos, 'inmediato');
                } else {
                  $scope.bool_toaster = true;
                  var temporizador = (dif_segundos - tiempo_espera) * 1000;
                  // console.log('Espera para lanzar el popup');
                  // console.log('temporizador', temporizador);
                  setTimeout(function () {
                    $scope.pop(response.datos, tiempo_espera, 'temporizador');
                  }, temporizador);
                }

              }

            }

            $scope.fSessionCI = response.datos;
            $scope.getNotificacionesEventos();
            $scope.logIn();

            if ($location.path() == '/login' && (url_destinity == null || angular.isUndefined(url_destinity))) {
              $scope.goToUrl('/');
            } else {
              switch (url_destinity) {
                case '/promociones-detalle':
                  promocionesServices.sDetallePromocionDetalle({
                    paquete_id: localStorageService.get('paquete_campania_id_session')
                  }).then(function (response) {
                    if (response.flag === 1) {

                      localStorageService.set('paquete_campania_id', localStorageService.get('paquete_campania_id_session'));
                      localStorageService.set('item_catalogo', response.data);
                      localStorageService.remove('CUSTOM_LOGIN_REDIRECT');
                      localStorageService.remove('paquete_campania_id_session');

                      $scope.goToUrl('/promociones-detalle');

                    }

                    if (response.flag === 0) {
                      localStorageService.remove('paquete_campania_id_session');
                      localStorageService.remove('CUSTOM_LOGIN_REDIRECT');

                      $scope.mostrarMsjPaquete(2, 'Fallido', 'Campaña o paquete no disponible');

                      $scope.goToUrl('/promociones');
                    }


                  }, function (err) {

                  });
                  break;
                case '/promociones':
                  console.log('PROMOCIONESSSS');
                  promocionesServices.sDetallePromocionDetalle({
                    paquete_id: localStorageService.get('paquete_campania_id')
                  }).then(function (response) {
                    if (response.flag === 1) {

                      // localStorageService.set('paquete_campania_id', localStorageService.get('paquete_campania_id_session'));
                      localStorageService.set('item_catalogo', response.data);
                      localStorageService.remove('CUSTOM_LOGIN_REDIRECT');
                      localStorageService.remove('paquete_campania_id_session');

                      $scope.goToUrl('/promociones-detalle');

                    }

                    if (response.flag === 0) {
                      localStorageService.remove('paquete_campania_id_session');
                      localStorageService.remove('CUSTOM_LOGIN_REDIRECT');

                      $scope.mostrarMsjPaquete(2, 'Fallido', 'Campaña o paquete no disponible');

                      $scope.goToUrl('/promociones');
                    }


                  }, function (err) {

                  });
                  break;
                default:
                  console.log('procedimientosSSS');
                  localStorageService.remove('CUSTOM_LOGIN_REDIRECT');
                  $scope.goToUrl(url_destinity);
                  break;
              }

            }
          } else {
            if ($location.path() != '/promociones'
              && $location.path() != '/terminos-y-condiciones'
              && $location.path() != '/politica-de-privacidad'
              && $location.path().indexOf("/procedimientos") !== 0
              && $location.path().indexOf("/redirect-to-detalle-promocion") !== 0
            ) {
              console.log('Entro a la redireccion');
              $scope.fSessionCI = {};
              $scope.logOut();
              $scope.goToUrl('/login');
            }
          }
        });
      }

      $scope.pop = function (datos, dif_segundos, origen) {
        //   console.log('dif_segundos', dif_segundos);
        //   console.log('origen', origen);
        var nombre = datos.nombres.split(' ')[0];

        var stopped;

        $scope.counter = dif_segundos;

        $scope.countdown = function () {
          stopped = $timeout(function () {
            $scope.counter--;
            if ($scope.counter <= 0) {
              console.log('detiene el popup');
              $scope.stop();
              toaster.clear();
            } else {
              $scope.count = moment.duration($scope.counter * 1000);
              $scope.horas = $scope.count.hours();
              $scope.minutos = $scope.count.minutes()
              $scope.segundos = $scope.count.seconds();
              $scope.countdown();
            }

          }, 1000);
        }
        $scope.stop = function () {
          $timeout.cancel(stopped);
        }

        $scope.countdown();

        toaster.pop({
          type: 'msj',
          title: '¡HOLA ' + nombre + '!',
          /*  body: '<p>' +
             'Recuerda que tu próxima <strong>videoconsulta</strong> está por empezar en ' + $scope.contador +' <br/>' +
             'Verifica tu señal de internet por favor' +
             '<a class="btn btn-toast mt-md" href="/historial-citas">INGRESAR</a>' +
             '</p>', */
          bodyOutputType: 'template',
          showCloseButton: true,
          timeout: dif_segundos * 1000,
          tapToDismiss: false
        });
      };

      $scope.btnCambiarMiClave = function (size) {
        $uibModal.open({
          templateUrl: angular.patchURLCI + 'usuario/ver_popup_password',
          size: size || 'sm',
          controller: function ($scope, $modalInstance) {
            $scope.titleForm = 'Cambiar Contraseña';
            $scope.aceptar = function () {
              $scope.fDataUsuario.miclave = 'si';
              usuarioServices.sActualizarPasswordUsuario($scope.fDataUsuario).then(function (rpta) {
                if (rpta.flag == 1) {
                  $scope.fAlert = {};
                  $scope.fAlert.type = 'success';
                  $scope.fAlert.msg = rpta.message;
                  $scope.fAlert.strStrong = 'Genial.';
                  setTimeout(function () {
                    $scope.cancel();
                  }, 1000);
                } else if (rpta.flag == 2) {
                  $scope.fDataUsuario.clave = null;
                  $scope.fAlert = {};
                  $scope.fAlert.type = 'warning';
                  $scope.fAlert.msg = rpta.message;
                  $scope.fAlert.strStrong = 'Advertencia.';
                } else if (rpta.flag == 0) {
                  $scope.fDataUsuario.claveNueva = null;
                  $scope.fDataUsuario.claveConfirmar = null;
                  $scope.fAlert = {};
                  $scope.fAlert.type = 'danger';
                  $scope.fAlert.msg = rpta.message;
                  $scope.fAlert.strStrong = 'Error. ';
                  setTimeout(function () {
                    $('#nuevoPass').focus();
                  }, 500);
                } else {
                  alert('Error inesperado');
                }
              });
            }

            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
              $scope.fDataUsuario = {};
            }
          }
        });
      }

      $scope.viewRegister = false;
      $scope.btnViewRegister = function () {
        $scope.sendEventChangeGA('FormularioRegistro', 'click', 'IrAFormulario', 0);
        $controller('usuarioController', {
          $scope: $scope
        });
        // $scope.initRegistrarUsuario();
        $scope.viewRegister = true;
        $scope.fAlert = null;
        $scope.fDataUser = null;
        /* $scope.fDataUser = {};
        $scope.fDataUser.sexo = '-';
        $scope.fDataUser.tipo_documento =  $scope.listatipodocumento[0].id; */
        // console.log("Tipo ",$scope.fDataUser.tipo_documento);
      }

      $scope.btnSalirRegistro = function () {
        $scope.sendEventChangeGA('FormularioRegistro', 'click', 'SalirFormulario', 0);
        $scope.btnViewLogin();
      }

      $scope.btnViewLogin = function () {
        $scope.viewRegister = false;
        $scope.fAlert = null;
        $scope.fDataUser = null;
        $scope.fLogin = null;
      }

      $scope.getNotificacionesEventos = function (firtsTime) {
        rootServices.sListarNotificacionesEventos().then(function (rpta) {
          $scope.fSessionCI.listaNotificacionesEventos = {};
          $scope.fSessionCI.listaNotificacionesEventos.datos = rpta.datos;
          $scope.fSessionCI.listaNotificacionesEventos.noLeidas = rpta.noLeidas;
          $scope.fSessionCI.listaNotificacionesEventos.contador = rpta.contador;
          /*
          if(firtsTime && $location.path() == '/'){
            console.log('window.Notification',window.Notification);
            console.log('window.mozNotification',window.mozNotification);
            console.log('window.webkitNotifications',window.webkitNotifications);
            console.log('window.notifications', window.notifications);
  
            var Notificacion = window.Notification || window.mozNotification || window.webkitNotification;
            if(Notificacion){
              if(Notification.permission != 'granted'){
                Notification.requestPermission();
              }
  
              //notificación por cada no leida
              var title = "Notificación Programación Asistencial";
              var icon = $scope.dirImages +'dinamic/empresa/' + $scope.fSessionCI.nombre_logo;
              angular.forEach( $scope.fSessionCI.listaNotificacionesEventos.noLeidas, function(value, key) {
                  newNotificacion(value.notificacion,icon,title, value.idcontroleventousuario);
              });
            }
          }   */
        });
      }

      $scope.viewDetalleNotificacionEvento = function (fila) {
        blockUI.start('Cargando notificación...');
        console.log(fila);
        rootServices.sUpdateLeidoNotificacion(fila).then(function (rpta) {
          $scope.fData = fila;
          if (rpta.flag == 1) {
            $scope.getNotificacionesEventos(false);
            $uibModal.open({
              templateUrl: angular.patchURLCI + 'ControlEventoWeb/ver_popup_notificacion_evento',
              size: '',
              backdrop: 'static',
              keyboard: false,
              scope: $scope,
              controller: function ($scope, $modalInstance) {
                $scope.titleForm = 'DETALLE DE NOTIFICACIÓN';
                //console.log('$scope.fData.cita',$scope.fData.cita);
                $scope.cancel = function () {
                  $modalInstance.dismiss('cancel');
                }

                $scope.viewComprobante = function () {
                  rootServices.sCargaObjetoNotificacion(fila).then(function (rpta) {
                    $scope.fData.cita = rpta.cita;
                    $scope.cancel();
                    $scope.descargaComprobanteCita($scope.fData.cita);
                  });
                }
                blockUI.stop();
              }
            });
          } else if (rpta.flag == 0) {
            var pTitle = 'Advertencia!';
            var pType = 'warning';
            pinesNotifications.notify({ title: pTitle, text: rpta.message, type: pType, delay: 1000 });
          } else {
            alert('Error inesperado');
          }
        });
      }

      $scope.descargaComprobanteCita = function (cita) {
        blockUI.start('Cargando comprobante...');
        var arrParams = {
          titulo: 'NOTA DE ATENCION',
          datos: cita,
          metodo: 'php'
        }
        arrParams.url = angular.patchURLCI + 'CentralReportes/imprimir_pdf_comprobante_cita';
        //arrParams.url = angular.patchURLCI+'ProgramarCita/report_comprobante_cita';
        ModalReporteFactory.getPopupReporte(arrParams);
        blockUI.stop()
      }

      $scope.descargaFacturaCita = function (cita) {
        //  var idventa = cita.idventa;
        //console.log(idventa);
        cita.venta_origen = 'W';
        blockUI.start('Cargando Boleta...');
        var arrParams = {
          titulo: 'BOLETA ELECTRONICA',
          datos: cita,
          metodo: 'php',
          url: angular.patchURLCI + 'AppReporte/boletaElectronica'
          // url: angular.patchURLCI+'venta/imprimir_pdf_factura_cita'
        }
        ModalReporteFactory.getPopupReporte(arrParams);
        blockUI.stop();
      }

      $scope.descargaFacturaCitaCampania = function (vm) {
        blockUI.start('Cargando Boleta...');
        var cita = vm.obj_resumen.result_venta;
        cita.venta_origen = 'W';
        var arrParams = {
          titulo: 'BOLETA DE CITA',
          datos: cita,
          metodo: 'php',
          url: angular.patchURLCI + 'AppReporte/boletaElectronica'
          //  url: angular.patchURLCI+'venta/imprimir_pdf_factura_cita'
        }
        ModalReporteFactory.getPopupReporte(arrParams);
        blockUI.stop();
      }

      $scope.descargaComprobantePago = function (cita) {
        // var idventa = cita.idventa;
        blockUI.start('Cargando factura...');
        var arrParams = {
          titulo: 'COMPROBANTE ELECTRÓNICO',
          metodo: 'php',
          datos: {
            titulo: 'COMPROBANTE ELECTRÓNICO',
            salida: 'pdf',
            tituloAbv: "F/E",
            data: {
              origen: cita.venta_origen,
              ticket_venta: cita.ticket_venta,
              idsedeempresaadmin: cita.idsedeempresaadmin,
            },
            cita: cita
          },
          // url: angular.patchURLCI + 'AppReporte/boletaElectronica'
          url: `${rootPathSH}centralReportesVentas/comprobanteElectronico`
        }
        ModalReporteFactory.getPopupReporte(arrParams, 'sh');
        blockUI.stop();
      }

      /*$scope.datoTip = null;
      $scope.btnSolicitarCita = function(idsede, idespecialidad){
        return;
        $scope.datoTip = {
          idsede : idsede,
          idespecialidad, idespecialidad
        }
        console.log($scope.datoTip);
        $scope.goToUrl('/seleccionar-cita');
      }*/

      $scope.closeTimer = function (liberar) {
        if ($scope.fSessionCI.timer.activeCount) {
          $interval.cancel($scope.runTimer);
          $scope.timer.activeCount = false;
          $scope.timer.viewTimerExpired = true;
          //liberar cupos
          if (liberar) {
            rootServices.sGetSessionCI().then(function (response) {
              console.log(response);
              programarCitaServices.sLiberarCuposSession(response.datos).then(function (rpta) {
                console.log(rpta);
              });
            });
          }
        }
      }


      $scope.exitTimer = function () {
        if ($scope.fSessionCI.timer.activeCount) {
          $interval.cancel($scope.runTimer);
          $scope.runTimer = null;
          $scope.timer = {}
          $scope.timer.activeCount = false;
          $scope.timer.viewTimerExpired = false;
          $scope.timer.exit = true;
          rootServices.sRegistraTimerSession($scope.timer).then(function (rpta) {
            console.log('exitTimer');
            console.log('datos : ', rpta.datos);
            $scope.fSessionCI = rpta.datos;
          });
        }
      }

      /* setTimeout(function() {
  
        $scope.exitTimer();
      }, 500); */
      $scope.starTimer = function () {
        /*console.log('$scope.timer',$scope.timer);*/
        if (!$scope.fSessionCI.timer.activeCount || ($scope.timer && $scope.timer.countDownTime == '00:00')) {
          $scope.timer = {};
          $scope.timer.start = moment("2018-08-24 00:00:00", "YYYY-MM-DD HH:mm:ss").add(5, 'minute');
          $scope.timer.count = moment("2018-08-24 00:00:00", "YYYY-MM-DD HH:mm:ss").add(5, 'minute');
          $scope.timer.activeCount = true;
          $scope.timer.viewTimerExpired = false;
          $scope.timer.countDownTime = $scope.timer.count.format("mm:ss");
          $scope.timer.exit = false;
          rootServices.sRegistraTimerSession($scope.timer).then(function (rpta) {
            console.log('starTimer');
            $scope.initRunTimer(true);
          });
        }
      }

      $scope.initRunTimer = function (interna) {
        if ($scope.isLoggedIn) {
          //console.log('$scope.initRunTimer');
          rootServices.sGetSessionCI().then(function (response) {
            if (response.datos.idusuario) {
              $scope.fSessionCI = response.datos;
              if (!interna) {
                $scope.timer = $scope.fSessionCI.timer;
                $scope.timer.start = moment($scope.timer.start);
                $scope.timer.count = moment($scope.timer.count);
              }

              $scope.runTimer = $interval(
                function () {
                  if ($scope.fSessionCI.timer && $scope.fSessionCI.timer.activeCount) {
                    $scope.timer.count.subtract(1, 'seconds');
                    $scope.timer.countDownTime = $scope.timer.count.format("mm:ss");
                    //console.log('$scope.timer.countDownTime ',$scope.timer.countDownTime );
                    var diff = $scope.timer.start.unix() - $scope.timer.count.unix();
                    $scope.timer.seconds = moment.duration(diff).asSeconds() * 1000
                    if ($scope.timer.countDownTime == '00:00') {
                      //console.log('cerramos');
                      $scope.closeTimer(true);
                    }
                    $scope.timer.exit = false;
                    rootServices.sRegistraTimerSession($scope.timer);
                  }
                },
                1000
              );
            }
          });
        }
      }
      $scope.initRunTimer();

      $scope.mostrarMsj = function (tipo, titulo, msg, callback) {
        $uibModal.open({
          templateUrl: angular.patchURLCI + 'ProgramarCita/ver_popup_aviso',
          size: 'md',
          backdrop: 'static',
          keyboard: false,
          scope: $scope,
          controller: function ($scope, $modalInstance) {
            $scope.titleForm = titulo;
            $scope.msj = msg;
            $scope.tipo = tipo;

            $scope.btnCancel = function () {
              $modalInstance.dismiss('btnCancel');
              if (tipo == 1) {
                if (callback && callback != null) {
                  callback();
                }
              }
            }

            if (tipo == 2) {
              setTimeout(function () {
                $scope.btnCancel();
              }, 10000);
            }
          }
        });
      }

      /* END */
    }])
  .service("rootServices", function ($http, $q) {
    return ({
      sGetSessionCI: sGetSessionCI,
      sLogoutSessionCI: sLogoutSessionCI,
      sGetConfig: sGetConfig,
      sListarNotificacionesEventos: sListarNotificacionesEventos,
      sUpdateLeidoNotificacion: sUpdateLeidoNotificacion,
      sCargaObjetoNotificacion: sCargaObjetoNotificacion,
      sRegistraTimerSession: sRegistraTimerSession,
    });
    function sGetSessionCI() {
      var request = $http({
        method: "post",
        url: angular.patchURLCI + "acceso/getSessionCI"
      });
      return (request.then(handleSuccess, handleError));
    }
    function sLogoutSessionCI() {
      var request = $http({
        method: "post",
        url: angular.patchURLCI + "acceso/logoutSessionCI"
      });
      return (request.then(handleSuccess, handleError));
    }
    function sGetConfig(datos) {
      var request = $http({
        method: "post",
        url: angular.patchURLCI + "acceso/get_config",
        data: datos
      });
      return (request.then(handleSuccess, handleError));
    }
    function sListarNotificacionesEventos(datos) {
      var request = $http({
        method: "post",
        url: angular.patchURLCI + "acceso/lista_notificaciones_eventos",
        data: datos
      });
      return (request.then(handleSuccess, handleError));
    }
    function sUpdateLeidoNotificacion(datos) {
      var request = $http({
        method: "post",
        url: angular.patchURLCI + "ControlEventoWeb/update_leido_notificacion",
        data: datos
      });
      return (request.then(handleSuccess, handleError));
    }
    function sCargaObjetoNotificacion(datos) {
      var request = $http({
        method: "post",
        url: angular.patchURLCI + "ControlEventoWeb/carga_objeto_notificacion",
        data: datos
      });
      return (request.then(handleSuccess, handleError));
    }
    function sRegistraTimerSession(datos) {
      var request = $http({
        method: "post",
        url: angular.patchURLCI + "acceso/registra_timer_session",
        data: datos
      });
      return (request.then(handleSuccess, handleError));
    }
  });
/* DIRECTIVAS */
appRoot.
  directive('ngEnter', function () {
    return function (scope, element, attrs) {
      element.bind("keydown", function (event) {
        if (event.which === 13) {
          scope.$apply(function () {
            scope.$eval(attrs.ngEnter);
          });
        }
      });
    };
  })
  .directive("scrollCheckout", function ($window) {
    return function (scope, element, attrs) {
      angular.element($window).bind("scroll", function () {
        // var width_window = $(window).width();
        // var height_header = $('.navbar').height();
        // if($(window).scrollTop() >= height_header + 100){
        // $('.filtros').addClass("sticky");
        // }else{
        // $('.filtros').removeClass("sticky");
        // }


        if ($(this).scrollTop() >= 300) {
          // console.log('pone fijo');
          $(".checkout").addClass('scroll');
        } else {
          // console.log('scroll', $(this).scrollTop());
          $(".checkout").removeClass('scroll');
        }



      });
    };
  })
  .directive('fileModel', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;
        element.bind('change', function () {
          scope.$apply(function () {
            modelSetter(scope, element[0].files[0]);
          });
        });
      }
    };
  }])
  .directive('focusMe', function ($timeout, $parse) {
    return {
      link: function (scope, element, attrs) {
        var model = $parse(attrs.focusMe);

        scope.$watch(model, function (pValue) {
          value = pValue || 0;
          $timeout(function () {
            element[value].focus();
            // console.log(element[value]);
          });
        });
      }
    };
  })
  .directive('stringToNumber', function () {
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        // console.log(scope);
        ngModel.$parsers.push(function (value) {
          // console.log('p '+value);
          return '' + value;
        });
        ngModel.$formatters.push(function (value) {
          // console.log('f '+value);
          return parseFloat(value, 10);
        });
      }
    };
  })
  .directive('enterAsTab', function () {
    return function (scope, element, attrs) {
      element.bind("keydown keypress", function (event) {
        if (event.which === 13 || event.which === 40) {
          event.preventDefault();
          var fields = $(this).parents('form:eq(0),body').find('input, textarea, select');
          var index = fields.index(this);
          if (index > -1 && (index + 1) < (fields.length - 1))
            fields.eq(index + 1).focus();
        }
        if (event.which === 38) {
          event.preventDefault();
          var fields = $(this).parents('form:eq(0),body').find('input, textarea, select');
          var index = fields.index(this);
          if ((index - 1) > -1 && index < fields.length)
            fields.eq(index - 1).focus();
        }
      });
    };
  })
  .directive('hcChart', function () {
    return {
      restrict: 'E',
      template: '<div></div>',
      scope: {
        options: '='
      },
      link: function (scope, element) {
        // scope.$watch(function () {
        //   return attrs.chart;
        // }, function () {
        //     if (!attrs.chart) return;
        //     var charts = JSON.parse(attrs.chart);
        //     $(element[0]).highcharts(charts);
        Highcharts.chart(element[0], scope.options);
        // });

      }
    };
  })
  .directive('smartFloat', function () {
    var FLOAT_REGEXP = /^\-?\d+((\.|\,)\d+)?$/;
    return {
      require: 'ngModel',
      link: function (scope, elm, attrs, ctrl) {
        ctrl.$parsers.unshift(function (viewValue) {
          if (FLOAT_REGEXP.test(viewValue)) {
            ctrl.$setValidity('float', true);
            if (typeof viewValue === "number")
              return viewValue;
            else
              return parseFloat(viewValue.replace(',', '.'));
          } else {
            ctrl.$setValidity('float', false);
            return undefined;
          }
        });
      }
    };
  })
  .directive('optionsClass', function ($parse) {
    return {
      require: 'select',
      link: function (scope, elem, attrs, ngSelect) {
        // get the source for the items array that populates the select.
        var optionsArray = attrs.ngOptions.split(' ');
        var optionsSourceStr = optionsArray.pop();

        //Get the field name that represents the label of the option (the item before 'for')
        var labelField = '';
        angular.forEach(optionsArray, function (token, index) {
          if (token == "for") {
            var itemParts = optionsArray[index - 1].split('.');
            labelField = (itemParts.length == 2) ? itemParts[1] : optionsArray[index - 1];
            return false;
          }
        });

        // use $parse to get a function from the options-class attribute
        // that you can use to evaluate later.
        getOptionsClass = $parse(attrs.optionsClass);
        scope.$watchCollection(optionsSourceStr, function (items) {
          scope.$$postDigest(function () {
            // when the options source changes loop through its items.
            angular.forEach(items, function (item, index) {
              // evaluate against the item to get a mapping object for
              // for your classes.
              var classes = getOptionsClass(item),
                // also get the option you're going to need. This can be found
                // by looking for the option with the appropriate index in the
                // value attribute.
                option = elem.find("option[label='" + item[labelField] + "']");
              // now loop through the key/value pairs in the mapping object
              // and apply the classes that evaluated to be truthy.
              angular.forEach(classes, function (add, className) {
                if (add) {
                  angular.element(option).addClass(className);
                } else {
                  angular.element(option).removeClass('optionComando');
                  console.log('Elimina clase: ', item[labelField]);
                }
              });
            });
          });
        });
      }
    };
  })
  .config(function (blockUIConfig) {
    blockUIConfig.message = 'Cargando datos...';
    blockUIConfig.delay = 0;
    blockUIConfig.autoBlock = false;
    //i18nService.setCurrentLang('es');
  })
  .filter('getRowSelect', function () {
    return function (arraySelect, item) {
      var fSelected = {};
      angular.forEach(arraySelect, function (val, index) {
        if (val.id == item) {
          fSelected = val;
        }
      })
      return fSelected;
    }
  })
  .filter('numberFixedLen', function () {
    return function (n, len) {
      var num = parseInt(n, 10);
      len = parseInt(len, 10);
      if (isNaN(num) || isNaN(len)) {
        return n;
      }
      num = '' + num;
      while (num.length < len) {
        num = '0' + num;
      }
      return num;
    };
  })
  .factory("ModalReporteFactory", function ($uibModal, $http, blockUI, rootServices) {
    var interfazReporte = {
      getPopupReporte: function (arrParams, origenServicio) { //console.log(arrParams.datos.salida,' as');
        if (arrParams.datos.salida == 'pdf' || angular.isUndefined(arrParams.datos.salida)) {
          $uibModal.open({
            templateUrl: angular.patchURLCI + 'CentralReportes/ver_popup_reporte',
            size: 'xlg',
            controller: function ($scope, $modalInstance, arrParams) {
              $scope.titleModalReporte = arrParams.titulo;
              $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
              }
              blockUI.start('Preparando reporte');
              $http.post(arrParams.url, arrParams.datos)
                .success(function (data, status) {
                  blockUI.stop();
                  if (arrParams.metodo == 'php') {
                    if (origenServicio == 'sh') {
                      $('#frameReporte').attr("src", rootPathFilesSH + data.urlTempPDF);
                    } else {
                      $('#frameReporte').attr("src", data.urlTempPDF);
                    }
                    //}else if( arrParams.metodo == 'js' ){
                  } else {
                    var docDefinition = data.dataPDF
                    pdfMake.createPdf(docDefinition).getBuffer(function (buffer) {
                      var blob = new Blob([buffer]);
                      var reader = new FileReader();
                      reader.onload = function (event) {
                        var fd = new FormData();
                        fd.append('fname', 'temp.pdf');
                        fd.append('data', event.target.result);
                        $.ajax({
                          type: 'POST',
                          url: angular.patchURLCI + 'CentralReportes/guardar_pdf_en_temporal', // Change to PHP filename
                          data: fd,
                          processData: false,
                          contentType: false
                        }).done(function (data) {
                          $('#frameReporte').attr("src", data.urlTempPDF);
                        });
                      };
                      reader.readAsDataURL(blob);
                    });
                  }
                })
                .error(function (data, status) {
                  blockUI.stop();
                });
            },
            resolve: {
              arrParams: function () {
                return arrParams;
              }
            }
          });
        } else if (arrParams.datos.salida == 'excel') {
          blockUI.start('Preparando reporte');
          $http.post(arrParams.url, arrParams.datos)
            .success(function (data, status) {
              blockUI.stop();
              if (data.flag == 1) {
                //window.open = arrParams.urlTempEXCEL;
                window.location = data.urlTempEXCEL;
              }
            });
        }
      },
      getPopupGraph: function (arrParams) {
        if (arrParams.datos.tipoCuadro == 'grafico' || arrParams.datos.tiposalida == 'grafico' || angular.isUndefined(arrParams.datos.tipoCuadro)) {
          $uibModal.open({
            templateUrl: angular.patchURLCI + 'CentralReportes/ver_popup_grafico',
            size: 'xlg',
            controller: function ($scope, $modalInstance, arrParams) {
              $scope.metodos = {};
              $scope.titleModalGrafico = arrParams.datos.titulo;
              $scope.metodos.listaColumns = false;
              $scope.metodos.listaData = false;

              $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
              }

              rootServices.sGraphicData(arrParams.url, arrParams.datos).then(function (data) {
                $scope.metodos.chartOptions = arrParams.structureGraphic;
                //console.log(data.series[0]);
                $scope.metodos.chartOptions.chart.events = {
                  load: function () {
                    var thes = this;
                    setTimeout(function () {
                      thes.setSize($("#chartOptions").parent().width(), $("#chartOptions").parent().height());
                    }, 10);
                  }
                };
                if (data.tipoGraphic == 'line' || data.tipoGraphic == 'bar') {
                  $scope.metodos.chartOptions.xAxis.categories = data.xAxis;
                  $scope.metodos.chartOptions.series = data.series;
                }
                //TRANSICIÓN DE LAS GRÁFICAS DE REPORTES DE ENCUESTA QUE SE ENCUENTRA EN LA INTRANET
                if (data.tipoGraphic == 'pie') {//
                  var arrData = [];
                  var tamanio = 300;
                  //SE RECORRE data.series PARA OBTENER TODAS LAS PREGUNTAS CON SUS RESPECTIVOS DATOS
                  angular.forEach(data.series, function (value, key) {
                    arrData.push({
                      name: value.descripcion_pr, colorByPoint: true, size: 200, center: [tamanio, null], showInLegend: true, data: data.series[key].respuestas,
                      total: data.series[key].totalPorPie
                    });
                    tamanio = tamanio + 300;
                  });
                  //console.log(arrData);
                  $scope.metodos.chartOptions.series = arrData;
                }
                if (data.tipoGraphic == 'line_encuesta') {//EL TIPO DE GRÁFICA PARA ESTE CASO ES ESPECIAL PORQUE
                  var arrData = [];
                  $scope.metodos.chartOptions.xAxis.categories = data.xAxis;
                  $scope.metodos.chartOptions.title.text = (data.series[0].descripcion).toUpperCase();
                  angular.forEach(data.series[0].respuestas, function (value, key) {
                    arrData.push({ name: data.series[0].respuestas[key].name, data: data.series[0].respuestas[key].data });
                  });
                  $scope.metodos.chartOptions.series = arrData;
                  //console.log(arrData);
                }
                if (data.tieneTabla == true) {
                  $scope.metodos.listaColumns = data.columns;
                  $scope.metodos.listaData = data.tablaDatos;
                  $scope.metodos.contTablaDatos = false;
                  $scope.metodos.linkText = 'VER TABLA DE DATOS';
                  $scope.linkVerTablaDatos = function () {
                    if ($scope.metodos.contTablaDatos === true) {
                      $scope.metodos.contTablaDatos = false;
                      $scope.metodos.linkText = 'VER TABLA DE DATOS';
                    } else {
                      $scope.metodos.contTablaDatos = true;
                      $scope.metodos.linkText = 'OCULTAR TABLA DE DATOS';
                    }

                  }
                }
              });
            },
            resolve: {
              arrParams: function () {
                return arrParams;
              }
            }
          });
        }
      }
    }
    return interfazReporte;
  })
  .factory('getUserMedia', function ($window) {
    return function (opts) {
      return new Promise(function (resolve, reject) {
        $window.navigator.webkitGetUserMedia(opts, resolve, reject);
      });
    };
  })
  .filter('griddropdown', function () {
    return function (input, context) {
      var map = context.col.colDef.editDropdownOptionsArray;
      var idField = context.col.colDef.editDropdownIdLabel;
      var valueField = context.col.colDef.editDropdownValueLabel;
      var initial = context.row.entity[context.col.field];
      if (typeof map !== "undefined") {
        for (var i = 0; i < map.length; i++) {
          if (map[i][idField] == input) {
            return map[i][valueField];
          }
        }
      } else if (initial) {
        return initial;
      }
      return input;
    };
  });

// Prevent the backspace key from navigating back.
$(document).unbind('keydown').bind('keydown', function (event) {
  var doPrevent = false;
  if (event.keyCode === 8) {
    var d = event.srcElement || event.target;
    if ((d.tagName.toUpperCase() === 'INPUT' &&
      (
        d.type.toUpperCase() === 'TEXT' ||
        d.type.toUpperCase() === 'PASSWORD' ||
        d.type.toUpperCase() === 'FILE' ||
        d.type.toUpperCase() === 'SEARCH' ||
        d.type.toUpperCase() === 'EMAIL' ||
        d.type.toUpperCase() === 'NUMBER' ||
        d.type.toUpperCase() === 'TEL' ||
        d.type.toUpperCase() === 'DATE')
    ) ||
      d.tagName.toUpperCase() === 'TEXTAREA'
    ) {
      doPrevent = d.readOnly || d.disabled;
    }
    else {
      doPrevent = true;
    }
  }

  if (doPrevent) {
    event.preventDefault();
  }
});
/*
var BrowserDetect = {
  init: function () {
    this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
    this.version = this.searchVersion(navigator.userAgent)
      || this.searchVersion(navigator.appVersion)
      || "an unknown version";
    this.OS = this.searchString(this.dataOS) || "an unknown OS";
  },
  searchString: function (data) {
    for (var i = 0; i < data.length; i++) {
      var dataString = data[i].string;
      var dataProp = data[i].prop;
      this.versionSearchString = data[i].versionSearch || data[i].identity;
      if (dataString) {
        if (dataString.indexOf(data[i].subString) != -1)
          return data[i].identity;
      }
      else if (dataProp)
        return data[i].identity;
    }
  },
  searchVersion: function (dataString) {
    var index = dataString.indexOf(this.versionSearchString);
    if (index == -1) return;
    return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
  },
  dataBrowser: [
    {
      string: navigator.userAgent,
      subString: "Chrome",
      identity: "Chrome"
    },
    {
      string: navigator.userAgent,
      subString: "OmniWeb",
      versionSearch: "OmniWeb/",
      identity: "OmniWeb"
    },
    {
      string: navigator.vendor,
      subString: "Apple",
      identity: "Safari",
      versionSearch: "Version"
    },
    {
      prop: window.opera,
      identity: "Opera",
      versionSearch: "Version"
    },
    {
      string: navigator.vendor,
      subString: "iCab",
      identity: "iCab"
    },
    {
      string: navigator.vendor,
      subString: "KDE",
      identity: "Konqueror"
    },
    {
      string: navigator.userAgent,
      subString: "Firefox",
      identity: "Firefox"
    },
    {
      string: navigator.vendor,
      subString: "Camino",
      identity: "Camino"
    },
    {        // for newer Netscapes (6+)
      string: navigator.userAgent,
      subString: "Netscape",
      identity: "Netscape"
    },
    {
      string: navigator.userAgent,
      subString: "MSIE",
      identity: "Explorer",
      versionSearch: "MSIE"
    },
    {
      string: navigator.userAgent,
      subString: "Gecko",
      identity: "Mozilla",
      versionSearch: "rv"
    },
    {         // for older Netscapes (4-)
      string: navigator.userAgent,
      subString: "Mozilla",
      identity: "Netscape",
      versionSearch: "Mozilla"
    }
  ],
  dataOS: [
    {
      string: navigator.platform,
      subString: "Win",
      identity: "Windows"
    },
    {
      string: navigator.platform,
      subString: "Mac",
      identity: "Mac"
    },
    {
      string: navigator.userAgent,
      subString: "iPhone",
      identity: "iPhone/iPod"
    },
    {
      string: navigator.platform,
      subString: "Linux",
      identity: "Linux"
    }
  ]

};
BrowserDetect.init(); */

