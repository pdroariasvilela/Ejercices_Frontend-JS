function culquiComponent($log, $q, $uibModal) {
  var $ctrl = this;

  $ctrl.culqui = {
    load: function (attrs) {

      Culqi.publicKey = attrs.key;
      Culqi.settings({
        title: 'Villa Salud',
        currency: 'PEN',
        description: attrs.description,
        amount: attrs.amount
      });
    },
    pay: function () {
      var q = $q.defer();

      // Abrimos modal de pagos
      Culqi.open();

      window.culqi = function () {

        if (Culqi.token) { // ¡Token creado exitosamente!
          // Get the token ID:
          $log.info('Se ha creado un token:' + Culqi.token.id);

          q.resolve(Culqi.token);
        } else { // ¡Hubo algún problema!
          // Mostramos JSON de objeto error en consola
          console.log('Culqi.error', Culqi.error);

          $uibModal.open({
            templateUrl: angular.patchURLCI + 'ProgramarCita/ver_popup_aviso',
            size: 'sm',
            //backdrop: 'static',
            //keyboard:false,
            scope: $scope,
            controller: function ($scope, $modalInstance) {
              $scope.titleForm = 'Aviso';
              $scope.msj = Culqi.error.user_message;

              $scope.btnCancel = function () {
                $modalInstance.dismiss('btnCancel');
              }
            }
          });

          q.reject(Culqi.error);
        }
      };

      return q.promise;
    }
  };
}

culquiComponent.$inject = [
  '$log', '$q', '$uibModal'
];

angular
  .module('theme.components', [])
  .service('culquiComponent', culquiComponent)
  .component('turnoProductoAtencion', {
    templateUrl: angular.patchURLCI + 'Promociones/carga_componente_turno_producto',
    controller: ['$scope', '$log', '$uibModal', function ($scope, $log, $uibModal) {
      var $ctrl = this;

      $ctrl.open = function () {
        var modalInstance = $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'myModalContent.html', // template modal-turno.php
          size: 'xlg',
          controller: function (
            $scope,
            $modalInstance,
            $log,
            listaFechasAtencion,
            especialidad,
            objProducto,
            tipo,
            resultCallback,
            programarCitaServices,
            blockUI,
            detalleProductosCampServices
          ) {


            $scope.listaFechasAtencion = listaFechasAtencion;
            $scope.objProducto = objProducto;
            console.log('objProducto', objProducto);
            console.log('listaFechasAtencion', listaFechasAtencion);
            console.log('tipo', tipo);
            console.log('resultCallback', resultCallback);

            $scope.arrayFechas = [];
            $scope.turnos = [];
            $scope.selectFecha = {};
            $scope.planning = {};

            // programacion asistencial (P)
            $scope.mostrarProgramacionP = false;
            $scope.lista_medicos = [];
            $scope.selectedMedico = null;

            $scope.mostrarTurno = false;
            $scope.tipo = tipo;
            $scope.resultCallback = resultCallback;
            // Array de fechas
            if ($scope.listaFechasAtencion) {
              angular.forEach($scope.listaFechasAtencion, function (value, key) {
                this.push(value.fecha);
              }, $scope.arrayFechas);
            }

            blockUI.start('Cargando programación...');
            if ($scope.tipo == 'reprogramacion' && $scope.objProducto.modo_atencion == 'VC') {
              $scope.objProducto.tipo_cons = 'vc'
            } else {
              $scope.objProducto.tipo_cons = 'cp'
            }
            programarCitaServices.sCargarPlanning({
              itemEspecialidad: {
                id: $scope.objProducto.id_especialidad,
                tipo_programacion: $scope.objProducto.tipo_programacion,
              },
              modo_atencion: $scope.objProducto.modo_atencion,
              itemSede: $scope.objProducto.itemSede,
              // itemSede: {
              //   id: $scope.objProducto.id_sede,
              //   idsede: $scope.objProducto.id_sede
              // },
              tipo_atencion: $scope.objProducto.tipo_atencion_medica,
              tipo_cons: $scope.objProducto.tipo_cons,
              array_fechas: $scope.arrayFechas
            }).then(function (rpta) {
              $scope.planning = rpta.planning;
              blockUI.stop();
            });

            $scope.ok = function () {
              $modalInstance.close({ listaFechasAtencion: listaFechasAtencion });
            };

            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };

            // Al hacer click en una fecha del calendario
            $scope.seleccionarFecha = function (objFecha) {
              switch ($scope.objProducto.tipo_atencion_medica) {
                case 'P':
                  $scope.verTurnoPorProductoP(objFecha);
                  break;
                case 'CM':
                  $scope.verTurnoHora(objFecha);
                  break;
                case 'EA':
                  if ($scope.objProducto.tipo_programacion == 1) {
                    $scope.verTurnoHora(objFecha);
                  } else {
                    $scope.verTurnoPorProductoP(objFecha);
                  }
                  break;
                default:
                  console.log('No se encontró el tipo de atención medica');
              }
            };

            $scope.verTurnoPorProductoP = function (objFecha) {
              $scope.selectFecha = objFecha;
              $scope.lista_medicos = [];

              detalleProductosCampServices.sCargarListaSalaProductoAsistencial(objFecha)
                .then(function (response) {
                  if (response.flag === 1) {
                    $scope.mostrarProgramacionP = true;


                    angular.forEach(response.data.lista_medicos, function (value, key) {
                      this.push({
                        datos_medico: value.datos_medico,
                        fecha_programada: value.fecha_programada,
                        hora_inicio: moment(value.hora_inicio, 'hh:mm').format('hh:mm a'),
                        hora_fin: moment(value.hora_fin, 'hh:mm').format('hh:mm a'),
                        id_prog_medico: value.id_prog_medico,
                        nombre_especialidad: value.nombre_especialidad,
                        numero_ambiente: value.numero_ambiente
                      });
                    }, $scope.lista_medicos);
                  }

                });
            };

            $scope.verTurnoHora = function (fecha) {
              $scope.selectFecha = fecha;
              blockUI.start('Cargando turnos disponibles...');
              programarCitaServices.sCargarTurnosDisponibles($scope.selectFecha).then(function (rpta) {
                $scope.turnos = rpta.datos;
                $scope.mostrarTurno = true;
                blockUI.stop();
              });
            };

            $scope.checkedCupo = function (cupo) {
              console.log('cupo_seleccionado', cupo);
              $scope.fSeleccion = cupo;
              cupo.checked = true;
              angular.forEach($scope.turnos, function (value, key) {
                angular.forEach(value.cupos, function (objCupo, indCupo) {
                  if (objCupo.iddetalleprogmedico != cupo.iddetalleprogmedico) {
                    $scope.turnos[key].cupos[indCupo].checked = false;
                  }
                });
              });
            };

            $scope.okAgendaConsulta = function () {
              $scope.fSeleccion.hora_inicio_det_f = moment($scope.fSeleccion.hora_inicio_det, 'hh:mm').format('hh:mm a');
              $scope.fSeleccion.hora_fin_det_f = moment($scope.fSeleccion.hora_fin_det, 'hh:mm').format('hh:mm a');

              $modalInstance.close($scope.fSeleccion);
            };
            // BOTON REPROGRAMAR
            $scope.okReprog = function () {
              console.log('$scope.fSeleccion', $scope.fSeleccion);
              $modalInstance.close($scope.fSeleccion);
              $scope.resultCallback($scope.fSeleccion);
            };

            $scope.onSelectedMedico = function (medico) {
              $scope.fSeleccion = medico;
              $scope.selectedMedico = medico;
            };

            $scope.seleccionarAgenda = function () {
              $scope.selectFecha.agendar_asistencia = $scope.selectedMedico;
              $modalInstance.close($scope.selectFecha);
            };
          },
          controllerAs: 'modal',
          resolve: {
            listaFechasAtencion: function () {
              return $ctrl.listaFechasAtencion;
            },
            especialidad: function () {
              return $ctrl.especialidad;
            },
            objProducto: function () {
              return $ctrl.objProducto;
            },
            tipo: function () {
              return $ctrl.tipo;
            },
            resultCallback: function () {
              return $ctrl.resultCallback;
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
          // Enviamos valor al Model
          $log.info(selectedItem);
          $ctrl.objAtencion = selectedItem;
        },
          function () {
            $log.info('Modal dismissed at: ' + new Date());
          });
      };
    }],
    bindings: {
      objAtencion: '=',
      listaFechasAtencion: '=',
      objProducto: '=',
      tipo: '=',
      resultCallback: '&'
    }
  })
  .component('agregaCarrito', {
    templateUrl: angular.patchURLCI + 'Miscellaneous/msc_cargar_componente_agregar_carrito',
    controller: ['$scope', '$log', '$uibModal', 'blockUI', '$location', 'localStorageService',
      function ($scope, $log, $uibModal, blockUI, $location, localStorageService
      ) {
        var $ctrl = this;
        $ctrl.verAviso = () => {
          const objProd = $ctrl.objProducto;
          console.log('objProd', objProd);
          if( objProd.idespecialidad == 100 ) { // 100: Resonancia Magnetica
            const url = angular.patchURLCI+'ProgramarCita/ver_popup_avisos';
            const size = 'lg';
            const titulo = 'AVISO DE RESONANCIA MAGNETICA';
            const dirImages = angular.patchURL + 'assets/img/';
            const imagen = 'alertas/aviso_resonancia.jpg';
            const boolTexto = false;
            $uibModal.open({
              templateUrl: url,
              size: size,
              //backdrop: 'static',
              //keyboard:false,
              scope: $scope,
              controller: function ($scope, $modalInstance) {
                $scope.titleForm = titulo;
                $scope.dirImages = dirImages;
                $scope.imagen = imagen;
                $scope.boolTexto = boolTexto;
                $scope.mensaje = '';
                $scope.btnCancel = function(){
                  $modalInstance.dismiss('btnCancel');
                  $ctrl.openModal();
                }
              }
            });
            return;
          }
          $ctrl.openModal();
        }
        $ctrl.openModal = () => {
          if ($ctrl.cart) {
            var modalInstance = $uibModal.open({
              animation: true,
              ariaLabelledBy: 'modal-title',
              ariaDescribedBy: 'modal-body',
              templateUrl: angular.patchURLCI + 'Miscellaneous/msc_cargar_modal_seleccion_turno',
              size: 'lg',
              scope: $scope,
              controller: function (
                $scope,
                $modalInstance,
                objProducto,
                objItems,
                cart,
                especialidadServices,
                programarCitaServices,
                detalleProductosCampServices,
                procedimientosServices,
                programarCitaServices,
                localStorageService,
                blockUI, rootServices
              ) {
                console.log('Producto', objProducto);
                $scope.objProducto = objProducto;
                $scope.objItems = objItems;
                $scope.arrayFechas = [];
                $scope.diaSeleccionado = false;
                $scope.mostrarBtnPago = false;
                $scope.mostrarResumenPago = false;
                $scope.acepta = false;
                $scope.patchURL = angular.patchURL;
                var title0 = '1. ELEGIR EL PACIENTE';
                var title1 = '1. ELEGIR EL PACIENTE Y FECHA';
                var title2 = '2. SELECCIONE AL MÉDICO Y HORARIO';
                var title3 = 'RESUMEN DE LA COMPRA';
                $scope.modulo = 'carrito';
                $scope.cart = cart;
                // Cargamos datos de session
                rootServices.sGetSessionCI().then(function (response) {
                  if (response.flag == 1) {
                    $scope.pasarela_pago = response.datos.pasarela_pago;
                  }
                });
                if (objProducto.tiene_programacion) {
                  $scope.title = title1;
                  especialidadServices.sCargarFechasDisponibles(objProducto).then(function (rpta) {
                    if (rpta.flag == 1) {
                      $scope.listaFechasAtencion = rpta.datos;
                      angular.forEach($scope.listaFechasAtencion, function (value, key) {
                        this.push(value.fecha_programada);
                      }, $scope.arrayFechas);
                      $scope.cargarPlaning();
                    } else {
                      $scope.planning = {
                        'mostrar': false
                      }
                    }
                  });
                } else {
                  $scope.title = title0;
                  $scope.itemSeleccionado = {};
                  $scope.mostrarBtnPago = true;
                }
                $scope.cargarPlaning = function () {
                  blockUI.start('Cargando programación...');
                  // console.log('objProducto', objProducto);
                  var params = {
                    itemEspecialidad: {
                      id: $scope.objProducto.id_especialidad,
                      tipo_programacion: $scope.objProducto.tipo_programacion,
                    },
                    itemSede: {
                      id: $scope.objProducto.idsede
                    },
                    tipo_atencion: $scope.objProducto.tipo_atencion_medica,
                    modo_atencion: $scope.objProducto.modo_atencion,
                    array_fechas: $scope.arrayFechas
                  }
                  programarCitaServices.sCargarPlanning(params).then(function (rpta) {
                    $scope.planning = rpta.planning;
                    blockUI.stop();
                  });
                }
                $scope.seleccionarFecha = function (objFecha) {
                  $scope.diaSeleccionado = true;
                  $scope.title = title2;
                  // Virtuales
                  if ($scope.objProducto.modo_atencion == 'VC') {
                    switch ($scope.objProducto.tipo_atencion_medica) {
                      case 'P':
                        $scope.verTurnoHora(objFecha);
                        break;
                      case 'CM':
                        $scope.verTurnoHora(objFecha);
                        break;

                    }
                  }
                  // Presenciales
                  else {
                    switch ($scope.objProducto.tipo_atencion_medica) {
                      case 'P':
                        $scope.verTurnoPorProductoP(objFecha);
                        break;
                      case 'CM':
                        $scope.verTurnoHora(objFecha);
                        break;
                      case 'EA':
                        if ($scope.objProducto.tipo_programacion == 1) {
                          $scope.verTurnoHora(objFecha);
                        } else {
                          $scope.verTurnoPorProductoP(objFecha);
                        }
                        break;
                    }
                  }
                }
                $scope.verTurnoPorProductoP = function (objFecha) {
                  $scope.selectFecha = objFecha;
                  $scope.lista_medicos = [];
                  detalleProductosCampServices.sCargarListaSalaProductoAsistencial(objFecha).then(function (response) {
                    if (response.flag === 1) {
                      $scope.mostrarProgramacionP = true;
                      angular.forEach(response.data.lista_medicos, function (value, key) {
                        this.push({
                          datos_medico: value.datos_medico,
                          fecha_programada: value.fecha_programada,
                          hora_inicio: moment(value.hora_inicio, 'hh:mm').format('hh:mm a'),
                          hora_fin: moment(value.hora_fin, 'hh:mm').format('hh:mm a'),
                          id_prog_medico: value.id_prog_medico,
                          nombre_especialidad: value.nombre_especialidad,
                          idespecialidad: value.idespecialidad,
                          numero_ambiente: value.numero_ambiente
                        });
                      }, $scope.lista_medicos);
                    }
                  });
                }
                $scope.verTurnoHora = function (fecha) {
                  $scope.selectFecha = fecha;
                  blockUI.start('Cargando turnos disponibles...');
                  programarCitaServices.sCargarTurnosDisponibles($scope.selectFecha).then(function (rpta) {
                    $scope.turnos = rpta.datos;
                    $scope.mostrarTurno = true;
                    blockUI.stop();
                  });
                }
                $scope.mostrarCalendario = function () {
                  $scope.diaSeleccionado = false;
                  $scope.itemSeleccionado = null;
                  $scope.title = title1;
                }
                $scope.checkedCupo = function (cupo) {
                  $scope.itemSeleccionado = cupo;
                  $scope.itemSeleccionado.datos_medico = cupo.medico;
                  $scope.itemSeleccionado.hora_inicio = cupo.hora_inicio_det;
                  $scope.itemSeleccionado.hora_inicio_f = cupo.hora_formato;
                  cupo.checked = true;
                  angular.forEach($scope.turnos, function (value, key) {
                    angular.forEach(value.cupos, function (objCupo, indCupo) {
                      if (objCupo.iddetalleprogmedico != cupo.iddetalleprogmedico) {
                        $scope.turnos[key].cupos[indCupo].checked = false;
                      }
                    });
                  });
                };
                $scope.onSelectedMedico = function (medico) {
                  $scope.itemSeleccionado = medico;
                };
                $scope.agregarCarrito = function (close) {
                  console.log('tipo_atencion_medica', $scope.objProducto.tipo_atencion_medica);
                  console.log('modo_atencion', $scope.objProducto.modo_atencion);

                  $scope.itemSeleccionado.nombre_especialidad = $scope.objProducto.nombre_especialidad;
                  $scope.itemSeleccionado.idespecialidad = $scope.objProducto.idespecialidad;
                  $scope.itemSeleccionado.idproductomaster = objProducto.idproductomaster;
                  $scope.itemSeleccionado.producto = objProducto.nombre_producto;
                  $scope.itemSeleccionado.precio_sede = objProducto.precio_sede;
                  $scope.itemSeleccionado.idsede = objProducto.idsede;
                  $scope.itemSeleccionado.sede = objProducto.sede;
                  $scope.itemSeleccionado.tipo_atencion_medica = objProducto.tipo_atencion_medica;
                  $scope.itemSeleccionado.modo_atencion = $scope.objProducto.modo_atencion;
                  $scope.itemSeleccionado.tipo_programacion = objProducto.tipo_programacion;
                  $scope.itemSeleccionado.tiene_programacion = objProducto.tiene_programacion;
                  $scope.itemSeleccionado.paciente = objProducto.paciente.paciente;
                  $scope.itemSeleccionado.idcliente_atencion = objProducto.paciente.idclientepariente;
                  $scope.cart.push($scope.itemSeleccionado);
                  var params = {
                    carrito: $scope.cart,
                    objSede: {
                      idsede: objProducto.idsede,
                      idsedeempresaadmin: objProducto.idsedeempresaadmin
                    }
                  }

                  procedimientosServices.sActualizarListaItemsSession(params).then(function (rpta) {
                    if (rpta.flag == 1) {
                      $scope.listaItems = rpta.datos.compra.listaItems;
                      $scope.objItems.total_pagar = rpta.datos.compra.totales.total_pago;
                      $scope.objItems.total_pago_culqi = rpta.datos.compra.totales.total_pago_culqi;
                      $scope.objItems.cantidad = $scope.listaItems.length;

                      if (close) {
                        $modalInstance.close($scope.cart);
                        if ($scope.objProducto.productos_relacionados !== null) {
                          $scope.mostrarAviso($scope.objProducto);
                        }
                      }

                    }
                  });
                }

                $scope.quitarDeLista = function (index) {
                  console.log('quitando....');
                  if (angular.isDefined($scope.cart[index].iddetalleprogmedico)) {
                    programarCitaServices.sLiberaCupoCarrito($scope.cart[index]).then(function (rpta) {
                      if (rpta.flag == 1) {
                        console.log(rpta.message);
                      }
                    });
                  }
                  $scope.cart.splice(index, 1);
                  var params = {
                    carrito: $scope.cart,
                    objSede: {
                      idsede: objProducto.idsede,
                      idsedeempresaadmin: objProducto.idsedeempresaadmin
                    }
                  }
                  procedimientosServices.sActualizarListaItemsSession(params).then(function (rpta) {
                    if (rpta.flag == 1) {
                      $scope.cart = rpta.datos.compra.listaItems;
                      $scope.objItems.total_pagar = rpta.datos.compra.totales.total_pago;
                      $scope.objItems.total_pago_culqi = rpta.datos.compra.totales.total_pago_culqi;
                      $scope.objItems.cantidad = $scope.cart.length;
                    }
                  });
                }
                $scope.redirectResumenPago = function () {
                  var params = {
                    carrito: {}
                  }
                  procedimientosServices.sActualizarListaItemsSession(params).then(function (rpta) {
                    if (rpta.flag == 1) {
                      $scope.listaItems = rpta.datos.compra.listaItems;
                      $scope.objItems.total_pagar = rpta.datos.compra.totales.total_pago;
                      $scope.objItems.total_pago_culqi = rpta.datos.compra.totales.total_pago_culqi;
                      $scope.objItems.cantidad = $scope.listaItems.length;
                      $modalInstance.close($scope.listaItems);
                      $location.path('/compra-resumen');
                    }
                  });
                }
                /* BOTON PAGAR */
                $scope.verResumenPago = function () {

                  $scope.mostrarResumenPago = true;
                  $scope.title = title3;
                  $scope.agregarCarrito(false);
                  if ($scope.objProducto.productos_relacionados !== null) {
                    $scope.mostrarAviso($scope.objProducto);
                  }
                }
                $scope.cancel = function () {
                  $modalInstance.close($scope.cart);
                }
              },
              // controllerAs: 'modal',
              resolve: {
                objProducto: function () {
                  return $ctrl.objProducto;
                },
                objItems: function () {
                  return $ctrl.objItems;
                },
                cart: function () {
                  return $ctrl.cart;
                }
              }
            });
            modalInstance.result.then(function (selectedItem) {
              // Enviamos valor al Modal
              $ctrl.cart = selectedItem;
            },
              function () {
                $log.info('Modal dismissed at: ' + new Date());
              });
          } else {
            var sede = '';
            var especialidad = '';
            if (angular.isDefined(localStorageService.get('objSede'))) {
              sede = '/' + localStorageService.get('objSede').alias;
              if (angular.isDefined(localStorageService.get('especialidad'))) {
                especialidad = '/' + localStorageService.get('especialidad');
              }
            }
            if ($location.path() == '/procedimientos-virtuales' ||
              $location.path().indexOf('/procedimientos-virtuales/') > -1) {
              localStorageService.set('CUSTOM_LOGIN_REDIRECT', '/procedimientos-virtuales' + especialidad);
            } else {
              localStorageService.set('CUSTOM_LOGIN_REDIRECT', '/procedimientos' + sede + especialidad);

            }
            var obj = $ctrl.objProducto;
            var modalInstance = $uibModal.open({
              animation: true,
              ariaLabelledBy: 'modal-title',
              ariaDescribedBy: 'modal-body',
              templateUrl: 'modLogin',
              size: 'sm',
              scope: $scope,
              controller: function ($scope, $modalInstance, obj) {
                var $ctrl = this;
                $scope.obj = obj;
                $ctrl.ok = function () {
                  $location.path('/login');
                  $modalInstance.close({ obj: obj });
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
          }
        }
        $scope.mostrarAviso = function (objProducto) {
          // AVISO DE PRODUCTO RELACIONADO
          console.log('aviso modal');
          var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'modAviso',
            size: 'md',
            scope: $scope,
            controller: function (
              $scope,
              $modalInstance

            ) {
              var $ctrl = this;
              console.log('$scope.objProducto', objProducto);

              $ctrl.objProducto = objProducto;

              $ctrl.ok = function () {

                $modalInstance.close();

              };

            },
            controllerAs: 'ctrl',
            resolve: {
              obj: function () {
                return $scope;
              }
            }
          });
          modalInstance.result.then(function (selectedItem) {
            // Enviamos valor al Model
            $ctrl.obj = selectedItem;
          },
            function () {
              console.log('Modal dismissed at: ' + new Date());

            });
        }
      }], bindings: {
        objAtencion: '=',
        objProducto: '=',
        objItems: '=',
        cart: "=",
        callback: '&'
      }
  })
  .component('seleccionaPaciente', {
    templateUrl: angular.patchURLCI + 'Miscellaneous/msc_cargar_componente_seleccion_paciente',
    controller: ['$scope', '$rootScope', '$controller', 'parienteServices', 'rootServices', 'blockUI', function ($scope, $rootScope, $controller, parienteServices, rootServices, blockUI) {
      var $ctrl = this;
      $ctrl.origen = 'componente';
      $ctrl.fSessionCI = {};
      // console.log('itemFamiliar => ', itemFamiliar);
      $ctrl.listarParientes = function (externo) {
        blockUI.start('Cargando Familiares...');
        parienteServices.sListarParientesCbo().then(function (rpta) {
          $ctrl.listaFamiliares = rpta.datos;
          // $ctrl.itemFamiliar = itemFamiliar;
          blockUI.stop();
          $ctrl.itemFamiliar = '';
          var titular = {
            idusuariowebpariente: 0,
            descripcion: $ctrl.fSessionCI.nombres + ' [TITULAR]',
            paciente: $ctrl.fSessionCI.paciente,
            edad: $ctrl.fSessionCI.edad,
            idclientepariente: $ctrl.fSessionCI.idcliente,
            disabled: false
          }
          $ctrl.listaFamiliares.splice(0, 0, titular);
          /* var linea = {
            idusuariowebpariente:null,
            descripcion: ' ',
            paciente: null,
            edad: null,
            disabled: true
          }
          $ctrl.listaFamiliares.push(linea);
          */
          var comando = {
            idusuariowebpariente: -1,
            descripcion: 'AGREGAR PACIENTE',
            paciente: null,
            edad: null,
            disabled: true
          }
          $ctrl.listaFamiliares.push(comando);
          if (externo) {
            console.log('entra del externo');
            $ctrl.itemFamiliar = $ctrl.listaFamiliares[$ctrl.listaFamiliares.length - 2];
          } else {
            $ctrl.itemFamiliar = $ctrl.listaFamiliares[0];
          }

          if ($ctrl.familiarSeleccionado) {
            angular.forEach($ctrl.listaFamiliares, function (value, key) {
              if (value.idusuariowebpariente == $ctrl.familiarSeleccionado.idusuariowebpariente) {
                $ctrl.itemFamiliar = $ctrl.listaFamiliares[key];
              }
            });
          }
          // console.log('$ctrl.listaFamiliares : ',$ctrl.listaFamiliares);
        });
      }
      $ctrl.cambiaFamiliar = function () {
        if ($ctrl.itemFamiliar.idusuariowebpariente == -1) {
          console.log('Nuevo Familiar')
          $ctrl.btnAgregarNuevoPariente();
        }
      }
      $ctrl.btnAgregarNuevoPariente = function () {
        // $scope.cargarItemFamiliar();
        var callback = function () {
          $ctrl.listarParientes(true);
        }

        $controller('parienteController', {
          $scope: $scope
        });
        // $ctrl.test("hola");
        $scope.btnNuevoPariente(callback, $ctrl);
      }
      // Cargamos datos de session
      rootServices.sGetSessionCI().then(function (response) {
        if (response.flag == 1) {
          $ctrl.fSessionCI = response.datos;
          $ctrl.listarParientes();
        }
      });

    }], bindings: {
      itemFamiliar: '=',
      scope: '='
    }
  })
  .component('confirmarPagar', {
    templateUrl: angular.patchURLCI + 'Miscellaneous/msc_cargar_componente_pagar',
    controller: ['$scope', '$log', 'localStorageService', 'rootServices', 'culquiComponent', 'ventaServices', 'blockUI', '$uibModal',
      function ($scope, $log, localStorageService, rootServices, culquiComponent, ventaServices, blockUI, $uibModal
      ) {
        var $ctrl = this;
        var idsede = localStorageService.get('objSede').id;
        console.log('idsede', idsede);
        var sedeempresaadmin = null;
        if (idsede == 1) {
          sedeempresaadmin = 7;
        } else if (idsede == 3) {
          sedeempresaadmin = 9;
        } else if (idsede == 4) {
          sedeempresaadmin = 15;
        }
        // $ctrl.monto_culqi = '';
        var datos = {
          tipo: 'pago',
          idsedeempresaadmin: sedeempresaadmin,
        };
        $ctrl.pagarCart = function () {
          rootServices.sGetConfig(datos).then(function (rpta) {
            culquiComponent.culqui.load({
              key: rpta.datos.CULQI_PUBLIC_KEY,
              description: rpta.datos.DESCRIPCION_CARGO,
              amount: $ctrl.totales.total_pago_culqi
            });

            // $scope.sendEventChangeGA('BotonPagar','click', 'ComprarProcedimiento', 0);
            culquiComponent.culqui.pay()
              .then(function (token) {
                console.log('token => ', token);
                // Procesamos Pago en nuestro servidor.
                blockUI.start('Procesando solicitud, por favor espere y NO recargue la página...');
                var params = {
                  token: token,
                  lista_productos: $ctrl.objItems,
                  totales: $ctrl.totales
                }
                ventaServices.sGenerarVentaCarrito(params).then(function (response) {

                  if (response.flag === 1) {
                    localStorageService.set('resumen_pago', response.data);
                    $ctrl.callback();
                    $ctrl.objItems = {}
                    $ctrl.totales = {
                      total_pagar: 0,
                      cantidad: 0,
                      total_pago_culqi: '000'
                    }
                    // $ctrl.mostrarPopupExitoso($ctrl.callback);
                    // titulo = 'Genial!';
                    // url = angular.patchURLCI+'ProgramarCita/ver_popup_compra_exitosa';
                    // size = 'lg';


                  } else {
                    $ctrl.mostrarErrorRespuesta(response.data);
                  }



                  blockUI.stop();
                });
              }, function (error) {
                // Si es fallido pasa por acá
                console.log('error => ', error);
                $ctrl.mostrarErrorRespuesta(error);
              });
          });

        }

        $ctrl.mostrarPopupExitoso = function (callback) {
          var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: angular.patchURLCI + 'ProgramarCita/ver_popup_compra_exitosa',
            size: 'lg',
            controller: function ($modalInstance) {
              $scope.btnCancel = function () {
                $modalInstance.dismiss('btnCancel');
              }
              /* setTimeout(function() {
                // var callback = function(){
                  $scope.btnCancel();
                // }
                callback();
              }, 3000); */
            }
          });
        }
        $ctrl.mostrarErrorRespuesta = function (objError) {
          var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'detalleRespuestaFallida',
            size: 'lg',
            controller: function (
              $scope,
              $modalInstance,
              $log,
              objError
            ) {

              var $ctrl = this;

              $scope.objError = objError;


              $scope.ok = function () {
                $modalInstance.close({ objError: objError });
              };

              $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
              };
            },
            controllerAs: 'modal',
            resolve: {
              objError: function () {
                return objError;
              }
            }
          });

          modalInstance.result.then(function (selectedItem) {
            // Enviamos valor al Model
            $ctrl.objError = selectedItem;
          },
            function () {
              $log.info('Modal dismissed at: ' + new Date());
            });
        }

      }], bindings: {
        objItems: '=',
        totales: '=',
        terminos: '=',
        callback: '&'
      }
  })
  .component('pagarPayMe', {
    templateUrl: angular.patchURLCI + 'Miscellaneous/msc_cargar_componente_pay_me',
    controller: ['$scope', 'localStorageService', 'ventaServices', 'blockUI', '$uibModal', 'detalleProductosCampServices',
      function ($scope, localStorageService, ventaServices, blockUI, $uibModal, detalleProductosCampServices
      ) {
        var $ctrl = this;
        $ctrl.openModal = function () {
          //console.log("$ctrl.recapcha",$ctrl.recapcha);
          /*###VALIDAMOS EL CAPTCHA###*/
          var params = {
            recapcha_response: $ctrl.recapcha
          }
          ventaServices.sVerificarReCapcha(params).then(function (response) {
            if (response.code == 1) {
              $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: angular.patchURLCI + 'Miscellaneous/msc_cargar_modal_pay_me',
                size: 'xs',
                scope: $scope,
                controller: function (
                  $scope,
                  $modalInstance
                ) {
                  $scope.title = "Registrar Pago";
                  $scope.responsePayme = false;
                  $ctrl.objItems.modulo = $ctrl.modulo == 'campania' ? true : false;
                  ventaServices.sCargarDataPago($ctrl.objItems).then(function (response) {
                    // PRODUCCION
                    if (response.identifier == '10973')//VES
                    {
                      var keys = '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCYaqNmTzWj61BL1tT6onn6s6IL\nW9YNqF08xWcUVDvDVcCoxVX+65CwhjauS7jgNq2lfe5ide2BI0spS7wmNzi/6a10\nwaDCGbD5pbYyeyG3MknJiv/YKP5HEMcyIF4wCqapABt3geX1dTZNvb8Xhaxhmbo+\nMZfu6g/GFH1DUp/MWQIDAQAB\n-----END PUBLIC KEY-----';


                    } else if (response.identifier == '10974')//SJL
                    {
                      var keys = '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCBzslmBP9+E9tvHIbVgj3fbxPu\nGnwxNhLUwU0MdqE9lKDMqQMaCWiDrZNdnVIq7vKlDTWhCRVVn3bis1zFUUkos2qn\nIMFXs/LhteJb/dH9RZazm33qnAgpmWpff9d0Pk6fg5qX1cVTWKRinCo3MNZFtszh\nI+Tfty5MbP6R9k4qgQIDAQAB\n-----END PUBLIC KEY-----';
                    } else if (response.identifier == '10964')//LURIN
                    {
                      var keys = '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCLZ8eItRpfJLEebzYccWUFMRQp\nvD9r+2dSSCUsQUkv6yQqQUpADsrpo7YhYa4o2bd4sVeL5NN1kvqFB4SeALs4Wo4+\nRQi3KoDMM7AA2j1VqhqClOgCdfQ4L30LHGKyUJdoJ+AxUbIHUwlrDFVMPdE8rv2q\nHOhNRrcONMzhJWkggwIDAQAB\n-----END PUBLIC KEY-----';
                    }

                    else if (response.identifier == '9855') { // VES - PRUEBA
                      var keys = '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCTgmFaAAiMiq6cz361GEhREsdx\ndR6PA30V8P2/sGIuL4ewVsq5pUUnawVQGnEx75NJhIOLEj4gkObCibuz+lAGLK2H\naTdWL7bXLcOHsZrI0cr0wSJVyZTDxBQpY4bfVQRs5HSLFbo4ht92K72i7Ve3cp60\n3wPNmlzzUQUuwJi9SQIDAQAB\n-----END PUBLIC KEY-----';

                    } else {
                      $scope.title = 'Usuario inactivo';
                      return;
                    }
                    /* INICIO PAY-ME */
                    PF.Init.execute({
                      data: {
                        operation: {
                          operationNumber: response.operationNumber,
                          amount: response.amount,
                          currency: {
                            code: 'PEN',
                            symbol: 'S/'
                          },
                          productDescription: 'Pago citas en linea - Villa Salud'
                        },
                        customer: {
                          name: response.name,
                          lastname: response.lastname,
                          email: response.email,
                          address: response.address,
                          zip: response.zip,
                          city: response.city,
                          state: response.state,
                          country: 'Peru',
                          phone: response.phone
                        },
                        signature: response.signature
                      },
                      listeners: {
                        afterPay: function (resp) {
                          if (resp.success == 'true' && resp.payment.accepted == 'true') {
                            //VENTA POR EL CARRITO
                            if ($ctrl.modulo == 'carrito') {
                              blockUI.start('Registrando la venta, por favor espere y NO recargue la página...');
                              var params = {
                                paymeResp: resp,
                                lista_productos: $ctrl.objItems,
                                totales: $ctrl.totales
                              }
                              ventaServices.sGenerarVentaCarritoPayMe(params).then(function (response) {
                                if (response.flag === 1) {
                                  localStorageService.set('resumen_pago', response.data);
                                  $ctrl.callback();
                                  $ctrl.objItems = {}
                                  $ctrl.totales = {
                                    total_pagar: 0,
                                    cantidad: 0,
                                    total_pago_culqi: '000'
                                  }
                                } else {
                                  $ctrl.mostrarErrorRespuesta(response.data);
                                }
                                blockUI.stop();
                              });
                              //VENTA CITAS
                            } else if ($ctrl.modulo == 'programarCita') {
                              blockUI.start('Registrando la cita... Espere y NO recargue la página');
                              var datos = {
                                usuario: $ctrl.objItems,
                                paymeResp: resp,
                              }
                              ventaServices.sGenerarVentaCitasPayMe(datos).then(function (rpta) {
                                var titulo = '';
                                var url = '';
                                var dirImages = angular.patchURL + 'assets/img/';
                                var size = '';
                                var modal = true;
                                if (rpta.flag == 1) {
                                  titulo = 'Genial!';
                                  url = angular.patchURLCI + 'ProgramarCita/ver_popup_compra_exitosa';
                                  size = 'lg';
                                  $ctrl.exitTimer();
                                  // $ctrl.callback();
                                } else if (rpta.flag == 0) {
                                  titulo = 'Aviso!';
                                  url = angular.patchURLCI + 'ProgramarCita/ver_popup_aviso';
                                  size = 'sm';
                                } else if (rpta.flag == 2) {
                                  $ctrl.fSessionCI.compra.listaCitas = angular.copy(rpta.listaDefinitiva);
                                  modal = false;
                                  $scope.mostrarMsj(0, 'Aviso', rpta.message + '. Selecciona nuevas citas.');
                                } else {
                                  alert('Error inesperado');
                                  modal = false;
                                }

                                if (modal) {
                                  $uibModal.open({
                                    templateUrl: url,
                                    size: size,
                                    //backdrop: 'static',
                                    //keyboard:false,
                                    scope: $scope,
                                    controller: function ($scope, $modalInstance) {
                                      $scope.titleForm = titulo;
                                      $scope.msj = rpta.message;
                                      $scope.dirImages = dirImages;
                                      $scope.btnCancel = function () {
                                        $modalInstance.dismiss('btnCancel');
                                      }

                                      if (rpta.flag == 1) {
                                        $ctrl.callback();
                                        /* setTimeout(function() {
                                          var callback = function(){
                                            $scope.btnCancel();
                                          }
                                          $scope.goToResumenCompra(callback);
                                        }, 3000); */
                                      }
                                      blockUI.stop();
                                    }
                                  });
                                }
                              });
                            } else if ($ctrl.modulo == 'campania') {
                              blockUI.start('Registrando la venta, por favor espere y NO recargue la página...');
                              var params = {
                                paymeResp: resp,
                                data: $ctrl.objItems
                              }
                              detalleProductosCampServices.sProcesarCompraPaqueteCampaniaPayme(params).then(function (response) {
                                $ctrl.callback(response);
                                blockUI.stop();
                              });
                            }
                          } else {
                            //SI NO ES APROBADO EL PAGO
                            //MUESTRO EL DETALLE
                            ventaServices.sGetRespuestaPayMe(resp).then(function (resp) {
                              $scope.responsePayme = true;
                              $scope.messagePayMe = resp.descripcion;
                            });
                          }
                        }//End afterPay
                      },//End listeners
                      settings: {
                        key: keys,
                        locale: 'es_PE',
                        identifier: response.identifier,
                        brands: ['VISA', 'MSCD', 'AMEX', 'DINC'],
                        responseType: 'extended'
                      }
                    });
                    /* FIN PAY-ME */
                  });
                  $scope.cancel = function () {
                    $modalInstance.close();
                  }
                }
              });
            } else {
              alerta("Error en el Captcha o Esta Vencido... Intente nuevamente");
            }
          });
        }
      }], bindings: {
        objItems: '=',
        totales: '=',
        terminos: '=',
        recapcha: '=',
        callback: '&',
        modulo: '=',
        exitTimer: '&'
      }
  });
if (screen.width < 1020) {
  // var posicion = $(".modal-footer").offset().top;
  // console.log('posicion', posicion)
  $('footer').scrollTop(0);
}
