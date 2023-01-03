angular.module('theme.login', ['theme.core.services','vcRecaptcha'])
  .controller('loginController', ['$scope', '$theme', '$controller', '$uibModal', 'blockUI',
    'loginServices',
    'rootServices', 'localStorageService','vcRecaptchaService',
    function( $scope, $theme, $controller, $uibModal, blockUI,
      loginServices,
      rootServices,
      localStorageService,
      vcRecaptchaService
    ){
    //'use strict';
    $theme.set('fullscreen', true);

    $scope.$on('$destroy', function() {
      $theme.set('fullscreen', false);
    });
    $scope.modulo='login';
    $scope.patchURL = angular.patchURL;
      // Mensaje App
      var msg = 'Ahora puedes comprar tu cita o procedimiento por nuestra App de manera más sencilla.';
      msg += '<div class="row">';
      msg += '<div class="col-sm-6">';
      msg += '<img src="assets/img/mano_celular.png" style="width:280px">';
      msg += '</div>';

      msg += '<div class="col-sm-5 mt-lg">';
      msg += '<p class="smaller">Descarga el App Villa Salud</p>';
      msg += '<img src="assets/img/btn_google_play.svg">';
      msg += '<a href="https://play.google.com/store/apps/details?id=com.villasalud.villasalud_citasenlinea" target="_blank" class="btn btn-principal mt-lg" type="button"> CLIC AQUÍ</a>';
      msg += '</div>';

      msg += '</div>';

        $scope.mostrarMsj(2, 'RECUERDA', msg, null);

    $scope.response = null;
    $scope.widgetId = null;

    /*CREDENCIALES RECAPTCHA */
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

    /*$scope.initLoginRecaptcha = function() {
      var datos = {
        tipo: 'captcha'
      }
      rootServices.sGetConfig(datos).then(function(rpta){
        $scope.keyRecaptcha =  rpta.datos.KEY_RECAPTCHA;
        grecaptcha.render('recaptcha-login', {
          'sitekey' : $scope.keyRecaptcha,
          'callback' : recaptchaResponse,
        });
      });
    };*/

    $scope.fLogin = {};

    $scope.logOut();
    $scope.btnLoginToSystem = function () {
      if($scope.fLogin.usuario == null || $scope.fLogin.clave == null){
        $scope.fAlert = {};
        $scope.fAlert.type= 'danger';
        $scope.fAlert.msg= 'Debe completar los campos usuario y clave.';
        $scope.fAlert.strStrong = 'Error.';
        return;
      }

      /*if(!$scope.resultado || $scope.resultado == ''){
        $scope.fAlert = {};
        $scope.fAlert.type= 'danger';
        $scope.fAlert.msg= 'Debe completar validación';
        $scope.fAlert.strStrong = 'Error.';
        return;
      }*/

      // recaptcha comentado temporalmente
      if(vcRecaptchaService.getResponse() === ""){ //if string is empty
        $scope.fAlert = {};
        $scope.fAlert.type= 'danger';
        $scope.fAlert.msg= 'Debe resolver el captcha';
        $scope.fAlert.strStrong = 'Error.';
        return;
        //alert("Please resolve the captcha and submit!")
      }
      $scope.fLogin.g_recaptcha_response = vcRecaptchaService.getResponse();

      loginServices.sLoginToSystem($scope.fLogin).then(function (response) {
        $scope.fAlert = {};
		    $scope.cbExpiration();
        if( response.flag == 1 ){ // SE LOGEO CORRECTAMENTE
          $scope.fAlert.type= 'success';
          $scope.fAlert.msg= response.message;
          $scope.fAlert.strStrong = 'OK.';
          $scope.getValidateSession(localStorageService.get('CUSTOM_LOGIN_REDIRECT'));
          $scope.logIn();
          // $scope.getNotificaciones();
        }else if( response.flag == 0 ){ // NO PUDO INICIAR SESION
          $scope.fAlert.type= 'danger';
          $scope.fAlert.msg= response.message;
          $scope.fAlert.strStrong = 'Error.';
        }else if( response.flag == 2 ){  // CUENTA INACTIVA
          $scope.fAlert.type= 'warning';
          $scope.fAlert.msg= response.message;
          $scope.fAlert.strStrong = 'Información.';
          $scope.listaSedes = response.datos;
        }
        $scope.fAlert.flag = response.flag;
        //$scope.fLogin = {};
      });
    }

    $scope.btnResendPass = function (){
      $scope.fRecuperaDatos = {};
      $uibModal.open({
        templateUrl: angular.patchURLCI+'Acceso/ver_popup_formulario_password',
        size: '',
        backdrop: 'static',
        keyboard:false,
        scope: $scope,
        controller: function ($scope, $modalInstance) {
          $scope.titleForm = 'Generar nueva contraseña';

          $scope.btnCancel = function(){
            $scope.fAlertPass = null;
            $modalInstance.dismiss('btnCancel');
          }

          $scope.generaNewPassword = function(){
            if(typeof $scope.fRecuperaDatos.recapcha === 'undefined' || $scope.fRecuperaDatos.recapcha === ""){ //if string is empty
              alert("Por favor resolver el captcha!");
              return;
            }
            blockUI.start('Enviando nueva contraseña...');
            loginServices.sGeneraNewPassword($scope.fRecuperaDatos).then(function(response){
              $scope.fAlertPass = {};
              if( response.flag == 1 ){ // SE GENERO CORRECTAMENTE
                $scope.fAlertPass.type= 'success';
                $scope.fAlertPass.msg= response.message;
                $scope.fAlertPass.strStrong = 'Genial! ';
              }else if( response.flag == 0 ){ // NO PUDO GENERAR
                $scope.fAlertPass.type= 'danger';
                $scope.fAlertPass.msg= response.message;
                $scope.fAlertPass.strStrong = 'Error. ';
              }else if( response.flag == 2 ){  // OTRA COSA
                $scope.fAlertPass.type= 'warning';
                $scope.fAlertPass.msg= response.message;
                $scope.fAlertPass.strStrong = 'Información. ';
              }else{
                alert('Error Inesperado.');
              }
              $scope.fRecuperaDatos = {};
              blockUI.stop();
            });
          }
        }
      });
    }
  }])
  .service("loginServices",function($http, $q) {
    return({
        sLoginToSystem: sLoginToSystem,
        sGeneraNewPassword: sGeneraNewPassword
    });

    function sLoginToSystem(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"acceso/",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sGeneraNewPassword(datos) {
      var request = $http({
		method : "post",
		url : angular.patchURLCI+"acceso/genera_new_password",
		data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
  });