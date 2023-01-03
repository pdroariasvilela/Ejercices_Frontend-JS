angular
  .module('themesApp', [
    'theme',
    'theme.demos',
  ])
  .config(function (localStorageServiceProvider) {
    localStorageServiceProvider
      .setPrefix('villasalud')
      .setStorageType('sessionStorage')
      .setNotify(true, true);
  })
  .config(['$provide', '$routeProvider', function($provide, $routeProvider) {
    'use strict';

    $routeProvider
      .when('/', {
        templateUrl: angular.dirViews+'inicio.php'
      })
      .when('/:templateFile', {
        templateUrl: function(param) {
          return angular.dirViews + param.templateFile + '.php';
        },
        hotkeys: [
          ['a', 'Sort by price', 'sort(price)']
        ],
        resolve: {
          loadModalTurnoProducto: function ($ocLazyLoad) {
            return $ocLazyLoad.load({type: 'html', path: angular.patchURLCI +'Promociones/carga_modal_turno'});
          },
          loadModalRespuestaFallida: function ($ocLazyLoad) {
            return $ocLazyLoad.load({type: 'html', path: angular.patchURLCI + 'Promociones/carga_modal_respuesta_failed'});
          },
          loadModalLogin: function ($ocLazyLoad) {
            return $ocLazyLoad.load({type: 'html', path: angular.patchURLCI + 'Promociones/carga_modal_login'});
          },
		      loadModalAviso: function ($ocLazyLoad) {
            return $ocLazyLoad.load({type: 'html', path: angular.patchURLCI + 'Promociones/carga_modal_aviso'});
          }
        }
      })
      .when('/:templateFile/:modulo', {
        templateUrl: function(param) {
          return angular.dirViews + param.templateFile + '.php';
        },
        hotkeys: [
          ['a', 'Sort by price', 'sort(price)']
        ],
        resolve: {
          loadModalTurnoProducto: function ($ocLazyLoad) {
            return $ocLazyLoad.load({type: 'html', path: angular.patchURLCI +'Promociones/carga_modal_turno'});
          },
          loadModalRespuestaFallida: function ($ocLazyLoad) {
            return $ocLazyLoad.load({type: 'html', path: angular.patchURLCI + 'Promociones/carga_modal_respuesta_failed'});
          },
          loadModalLogin: function ($ocLazyLoad) {
            return $ocLazyLoad.load({type: 'html', path: angular.patchURLCI + 'Promociones/carga_modal_login'});
          },
		      loadModalAviso: function ($ocLazyLoad) {
            return $ocLazyLoad.load({type: 'html', path: angular.patchURLCI + 'Promociones/carga_modal_aviso'});
          }
        }
      })
      .when('/:templateFile/:modulo/:segmento', {
        templateUrl: function(param) {
          return angular.dirViews + param.templateFile + '.php';
        },
        hotkeys: [
          ['a', 'Sort by price', 'sort(price)']
        ],
        resolve: {
          loadModalTurnoProducto: function ($ocLazyLoad) {
            return $ocLazyLoad.load({type: 'html', path: angular.patchURLCI +'Promociones/carga_modal_turno'});
          },
          loadModalRespuestaFallida: function ($ocLazyLoad) {
            return $ocLazyLoad.load({type: 'html', path: angular.patchURLCI + 'Promociones/carga_modal_respuesta_failed'});
          },
          loadModalLogin: function ($ocLazyLoad) {
            return $ocLazyLoad.load({type: 'html', path: angular.patchURLCI + 'Promociones/carga_modal_login'});
		  },
		  loadModalAviso: function ($ocLazyLoad) {
            return $ocLazyLoad.load({type: 'html', path: angular.patchURLCI + 'Promociones/carga_modal_aviso'});
          }
        }
      })
      .when('#', {
        templateUrl: angular.dirViews+'inicio.php',
      })
      .otherwise({
        redirectTo: '/'
      });
  }])
  .run(function ($rootScope, rootServices) {
    console.log('session run()')
    $rootScope.authSession = {
      profile: null,
      auth: false,
      check: function () {

        rootServices.sGetSessionCI().then(function (response) {

          if (response.flag === 1) {
            console.log('Init Verificacion de session run().rootServices.sGetSessionCI().if === 1')

            $rootScope.authSession.profile = response.datos;
            $rootScope.authSession.auth = true;

            return true;
          }

          if (response.flag === 0) {
            console.log('Init Verificacion de session run().rootServices.sGetSessionCI().if === 0')

            $rootScope.authSession.profile = null;
            $rootScope.authSession.auth = false;
          }

          console.log('Finished Verificacion de session run()')

          return false;
        }, function (err) {

        });
      }
    };

    //$rootScope.authSession.check();
  })
  .directive('demoOptions', function () {
    return {
      restrict: 'C',
      link: function (scope, element, attr) {
        element.find('.demo-options-icon').click( function () {
          //element.toggleClass('active');
          $('.demo-options.content').toggleClass('active');
          console.log($('.demo-options.content'));
        });
      }
    };
  })
  .directive('iCheck', ['$timeout', '$parse', function ($timeout, $parse) {
    return {
        require: 'ngModel',
        link: function ($scope, element, $attrs, ngModel) {
            return $timeout(function () {
                var value = $attrs.value;
                var $element = $(element);
                console.log('element',$element);
                // var myArr=["minimal","flat","square"];
                // var aCol=['red','green','aero','grey','orange','pink','purple','yellow','blue','purple','primary']

                /*for (var i = 0; i < myArr.length; ++i) {
                  for (var j = 0; j < aCol.length; ++j) {
                    // $('.icheck-minimal .blue.icheck input').iCheck({checkboxClass: 'icheckbox_minimal-blue',radioClass: 'iradio_minimal-blue'});
                    $('.icheck-' + myArr[i] + ' .' + aCol[j] + '.icheck input').iCheck({
                      checkboxClass: 'icheckbox_' + myArr[i] + '-' + aCol[j],
                      radioClass: 'iradio_' + myArr[i] + '-' + aCol[j],
                      increaseArea: '20%'
                    });
                  }
                }*/

                // Instantiate the iCheck control.
                $element.iCheck({
                    checkboxClass: 'icheckbox_square-primary',
                    radioClass: 'iradio_square-primary',
                    increaseArea: '20%'
                });

                // If the model changes, update the iCheck control.
                $scope.$watch($attrs.ngModel, function (newValue) {
                    $element.iCheck('update');
                });

                // If the iCheck control changes, update the model.
                $element.on('ifChanged', function (event) {
                    if ($element.attr('type') === 'radio' && $attrs.ngModel) {
                        $scope.$apply(function () {
                            ngModel.$setViewValue(value);
                        });
                    }
                });

            });
        }
    };
}]);
