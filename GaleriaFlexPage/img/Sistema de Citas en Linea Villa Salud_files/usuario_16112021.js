angular.module('theme.usuario', ['theme.core.services','ui.bootstrap','ui.utils','vcRecaptcha'])
  .controller('usuarioController', ['$scope', '$controller','$uibModal','$bootbox', '$window', 'blockUI','$filter',
    'usuarioServices',
    'rootServices',
    'localStorageService',
    'SweetAlert',
    'vcRecaptchaService',
    function($scope, $controller, $uibModal, $bootbox, $window, blockUI,$filter,
      usuarioServices,
      rootServices,
      localStorageService,
      SweetAlert,
      vcRecaptchaService
    ){
    'use strict';
    $scope.modulo = 'usuario';
    $scope.titleForm = 'Registro en Citas en Linea';
    //$scope.fDataUser = {};
    $scope.listaSexos = [
      {id:'-', descripcion:'SELECCIONE SEXO'},
      {id:'F', descripcion:'FEMENINO'},
      {id:'M', descripcion:'MASCULINO'}
    ];

    //Recapcha
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

    $scope.fDataUsuario = {};
    $scope.init = function(){
      blockUI.start('Cargando perfil...');
      rootServices.sGetSessionCI().then(function (response) {
        if(response.flag == 1){
          $scope.fDataUser = response.datos;
		  $scope.fDataUser.departamento = {
			  "id" : $scope.fDataUser.iddepartamento,
			  "descripcion" : $scope.fDataUser.departamento
		  }
		  $scope.fDataUser.provincia = {
			  "id" : $scope.fDataUser.idprovincia,
			  "descripcion" : $scope.fDataUser.provincia
		  }
		  $scope.fDataUser.distrito = {
			  "id" : $scope.fDataUser.iddistrito,
			  "descripcion" : $scope.fDataUser.distrito
		  }
          $scope.fSessionCI = response.datos;
          if(!$scope.fSessionCI.nombre_imagen || $scope.fSessionCI.nombre_imagen === ''){
            $scope.fSessionCI.nombre_imagen = 'noimage.jpg';
          }
        }
      });
      $scope.selectedTab = '0';
      $controller('parienteController', {
        $scope : $scope
      });
      $scope.initPariente();
      blockUI.stop();
    }
    /*==== TIPO DE DOCUMENTO ====*/
    $scope.listatipodocumento = [
      {id: 'DNI', name: 'DNI'},
      {id: 'CE',  name: 'CARNET EXTRANJERIA'},
      {id: 'PAS', name: 'PASAPORTE'}
    ];
    $scope.initPerfil = function(){
      $scope.listaTiposSangre = [
        {id:0, descripcion: 'SELECCIONE TIPO SANGRE'},
        {id:1, descripcion: 'A+'},
        {id:2, descripcion: 'A-'},
        {id:3, descripcion: 'B+'},
        {id:4, descripcion: 'B-'},
        {id:5, descripcion: 'O+'},
        {id:6, descripcion: 'O-'},
        {id:7, descripcion: 'AB+'},
        {id:8, descripcion: 'AB-'},
      ];
      $scope.fDataDashboard={};
      var ind = 0;
      angular.forEach($scope.listaTiposSangre, function(value, key) {
        if(value.id == $scope.fSessionCI.tipo_sangre.id){
          ind = key;
        }
      });
      $scope.fDataDashboard.tipo_sangre = $scope.listaTiposSangre[ind];
      $scope.fDataDashboard.peso = $scope.fSessionCI.peso;
      $scope.fDataDashboard.estatura = $scope.fSessionCI.estatura;

      $scope.fAlertPerfilCli = null;
      /*console.log($scope.fDataDashboard.tipo_sangre);
      console.log($scope.listaTiposSangre);*/
    }

    /*$scope.initRecaptchaReg = function () {
      var datos = {
        tipo: 'captcha'
      }
      rootServices.sGetConfig(datos).then(function(rpta){
        $scope.keyRecaptcha =  rpta.datos.KEY_RECAPTCHA;
          grecaptcha.render('recaptcha-registro', {
          'sitekey' : $scope.keyRecaptcha,
          'callback' : recaptchaResponseReg,
        });
      });
    }*/
      $scope.fDataUser = {};
      $scope.fDataUser.sexo = '-';
      $scope.captchaValidoReg = false;
      $scope.acepta = false;
      $scope.fDataUser.tipo_documento =  $scope.listatipodocumento[0].id;

      var hoy = new Date();
      var d = hoy.getDate();
      var m = hoy.getMonth(); //January is 0!
      var y = hoy.getFullYear() - 18;
      var mm = '';
      var dd = '';
      if(d<10){
        dd='0'+d
      }else{
        dd=d
      }
      if((m+1)<10){
        mm='0'+(m+1)
      }else{
        mm=(m+1)
      }
      $scope.fDataUser.max_fecha = y + '-' + mm +'-' + dd;

      $scope.seleccionaFecha = function(){
        if (navigator.userAgent.indexOf("Firefox") != -1 && $scope.fDataUser.fecha_nacimiento == null) {
          console.log('Firefox');
          $scope.fDataUser.fecha_nacimiento = new Date(y,m,d)
        }
      }


    $scope.initRegistrarUsuario = function(){
      /* $scope.fDataUser = {};
      $scope.fDataUser.sexo = '-';
      $scope.fDataUser.fecha_nacimiento = '-';
      $scope.captchaValidoReg = false;
      $scope.acepta = false;
      $scope.fDataUser.tipo_documento =  $scope.listatipodocumento[0];
      var hoy = new Date();
      var d = hoy.getDate();
      var m = hoy.getMonth(); //January is 0!
      var y = hoy.getFullYear() - 18;
      $scope.fDataUser.fecha_nacimiento = new Date(y,m,d);
      console.log('User ', $scope.fDataUser); */
    }
    $scope.verificarDoc = function(){
      if(!$scope.fDataUser.num_documento || $scope.fDataUser.num_documento == null || $scope.fDataUser.num_documento == ''){
        $scope.fAlert = {};
        $scope.fAlert.type= 'danger';
        $scope.fAlert.msg='Debe ingresar un Número de documento válido.';
        $scope.fAlert.strStrong = 'Error';
        $scope.fAlert.icon = 'fa fa-exclamation';
        return;
	  }
	  if( $scope.fDataUser.tipo_documento == 'DNI' && $scope.fDataUser.num_documento.length > 8 ){
		$scope.fAlert = {};
        $scope.fAlert.type= 'danger';
        $scope.fAlert.msg='Debe ingresar un Número de DNI válido.';
        $scope.fAlert.strStrong = 'Error';
        $scope.fAlert.icon = 'fa fa-exclamation';
        return;
	  }
      usuarioServices.sVerificarUsuarioPorDocumento($scope.fDataUser).then(function (rpta) {
        $scope.fDataUser.tipo_documento = $scope.fDataUser.tipo_documento;
        $scope.fAlert = {};
        if( rpta.flag == 2 ){ //Cliente registrado en Sistema Hospitalario
          $scope.fDataUser = rpta.usuario;
          // $scope.fDataUser.tipo_documento = $scope.fDataUser.tipo_documento;

          // formato dd/mm/yyyy o dd-mm-yyyy
          var dt1   = parseInt($scope.fDataUser.fecha_nacimiento.substring(0,2));
          var mon1  = parseInt($scope.fDataUser.fecha_nacimiento.substring(3,5));
          var yr1   = parseInt($scope.fDataUser.fecha_nacimiento.substring(6,10));
          $scope.fDataUser.fecha_nacimiento = new Date(yr1, mon1-1, dt1);

          $scope.fAlert.type= 'info';
          $scope.fAlert.msg= rpta.message;
          $scope.fAlert.icon= 'fa fa-smile-o';
          $scope.fAlert.strStrong = 'Genial! ';
        }else if( rpta.flag == 1 ){ // Usuario ya registrado en web
          //$scope.fDataUser = rpta.usuario;
          $scope.fAlert.type= 'danger';
          $scope.fAlert.msg= rpta.message;
          $scope.fAlert.strStrong = 'Aviso! ';
          $scope.fAlert.icon = 'fa fa-exclamation-circle';
        }else if(rpta.flag == 0){
          var num_documento = $scope.fDataUser.num_documento;
          var tipDocu = $scope.fDataUser.tipo_documento
          $scope.fAlert.type= 'warning';
          $scope.fAlert.msg= rpta.message;
          $scope.fAlert.strStrong = 'Aviso! ';
          $scope.fAlert.icon = 'fa fa-frown-o';
          $scope.fDataUser = {};
          $scope.fDataUser.num_documento = num_documento;
          $scope.fDataUser.sexo = '-';
          $scope.fDataUser.tipo_documento = tipDocu;
         // console.log($scope.fDataUser.tipo_documento);
        }
        $scope.fAlert.flag = rpta.flag;
      });
    }

    $scope.btnCancel = function(){
      $modalInstance.dismiss('btnCancel');
    }
    $scope.limpiaDpto = function(){
      $scope.fDataUser.departamento = null;
      $scope.fDataUser.idprovincia  = null;
      $scope.fDataUser.provincia    = null;
      $scope.fDataUser.iddistrito   = null;
      $scope.fDataUser.distrito     = null;
    }
    $scope.limpiaProv = function(){
      $scope.fDataUser.provincia  = null;
      $scope.fDataUser.iddistrito = null;
      $scope.fDataUser.distrito   = null;
    }
    $scope.limpiaDist = function(){
      $scope.fDataUser.distrito = null;
    }
    $scope.limpiaIdDpto = function(){
      $scope.fDataUser.iddepartamento = null;
      $scope.fDataUser.idprovincia    = null;
      $scope.fDataUser.provincia      = null;
      $scope.fDataUser.iddistrito     = null;
      $scope.fDataUser.distrito       = null;
    }
    $scope.limpiaIdProv = function(){
      $scope.fDataUser.idprovincia  = null;
      $scope.fDataUser.iddistrito   = null;
      $scope.fDataUser.distrito     = null;
    }
    $scope.limpiaIdDist = function(){
      $scope.fDataUser.iddistrito = null;
    }
    /*OBTENER DEPARTAMENTO POR CÓDIGO */
    $scope.obtenerDepartamentoPorCodigo = function () {
      if( $scope.fDataUser.iddepartamento ){
        var arrData = {
          'codigo': $scope.fDataUser.iddepartamento
        }
        usuarioServices.sListarDepartamentoPorCodigo(arrData).then(function (rpta) {
          if( rpta.flag == 1){
            $scope.fDataUser.iddepartamento = rpta.datos.id;
            $scope.fDataUser.departamento   = rpta.datos.descripcion;
            $('#fDatadepartamento').focus();
          }
        });
      }
    }
    /*OBTENER DEPARTAMENTO POR AUTOCOMPLETADO */
    $scope.getDepartamentoAutocomplete = function (value) {
      var params = {
        search: value,
        sensor: false
      }
      return usuarioServices.sListarDepartamentoPorAutocompletado(params).then(function(rpta) {
        $scope.noResultsLD = false;
        if( rpta.flag === 0 ){
          $scope.noResultsLD = true;
        }
        return rpta.datos;
      });
    }
    $scope.getSelectedDepartamento = function ($item, $model, $label) {
      $scope.fDataUser.iddepartamento = $item.id;
      $scope.fDataUser.idprovincia    = null;
      $scope.fDataUser.provincia      = null;
      $scope.fDataUser.iddistrito     = null;
      $scope.fDataUser.distrito       = null;
    };
    /*OBTENER PROVINCIA POR CÓDIGO*/
    $scope.obtenerProvinciaPorCodigo = function () {
      if( $scope.fDataUser.idprovincia ){
        var arrData = {
          'codigo'        : $scope.fDataUser.idprovincia,
          'iddepartamento': $scope.fDataUser.iddepartamento
        }
        usuarioServices.sListarProvinciaDeDepartamentoPorCodigo(arrData).then(function (rpta) {
          if( rpta.flag == 1){
            $scope.fDataUser.idprovincia  = rpta.datos.id;
            $scope.fDataUser.provincia    = rpta.datos.descripcion;
            $('#fDataprovincia').focus();
          }
        });
      }
    }
    /*OBTENER PROVINCIA POR AUTOCOMPLETADO */
    $scope.getProvinciaAutocomplete = function (value) {
      var params = {
        search: value,
        id    : $scope.fDataUser.iddepartamento,
        sensor: false
      }
      return usuarioServices.sListarProvinciaPorAutocompletado(params).then(function(rpta) {
        $scope.noResultsLP = false;
        if( rpta.flag === 0 ){
          $scope.noResultsLP = true;
        }
        return rpta.datos;
      });
    }
    $scope.getSelectedProvincia = function ($item, $model, $label) {
      $scope.fDataUser.idprovincia  = $item.id;
      $scope.fDataUser.iddistrito   = null;
      $scope.fDataUser.distrito     = null;
  };
    /*OBTENER DISTRITO POR CÓDIGO*/
    $scope.obtenerDistritoPorCodigo = function () {
      if( $scope.fDataUser.iddistrito ){
        var arrData = {
          'codigo'        : $scope.fDataUser.iddistrito,
          'iddepartamento': $scope.fDataUser.iddepartamento,
          'idprovincia'   : $scope.fDataUser.idprovincia
        }
        usuarioServices.sListarDistritosDeProvinciaPorCodigo(arrData).then(function (rpta) {
          if( rpta.flag == 1){
            $scope.fDataUser.iddistrito = rpta.datos.id;
            $scope.fDataUser.distrito   = rpta.datos.descripcion;
            $('#fDatadistrito').focus();
          }
        });
      }
    }
    /*OBTENER DISTRITO POR AUTOCOMPLETADO */
    $scope.getDistritoAutocomplete = function (value) {
      var params = {
        search  : value,
        id_dpto : $scope.fDataUser.iddepartamento,
        id_prov : $scope.fDataUser.idprovincia,
        sensor  : false
      }
      return usuarioServices.sListarDistritoPorAutocompletado(params).then(function(rpta) {
        $scope.noResultsLDis = false;
        if( rpta.flag === 0 ){
          $scope.noResultsLDis = true;
        }
        return rpta.datos;
      });
    }
    $scope.getSelectedDistrito = function ($item, $model, $label) {
      $scope.fDataUser.iddistrito = $item.id;
    };
    $scope.registrarUsuario = function (){
      $scope.sendEventChangeGA('FormularioRegistro','click', 'ClickRegistrarFormulario', 0);
      $scope.crearAlerta = function(msg){
        $scope.fAlert = {};
        $scope.fAlert.type= 'danger';
        $scope.fAlert.msg= msg;
        $scope.fAlert.strStrong = 'Error';
        $scope.fAlert.icon = 'fa fa-exclamation';
        return;
      }
      if( $scope.fDataUser.tipo_documento == ''){
        $scope.crearAlerta('Seleccione Tipo de documento.');
        return;
      }
      if(!$scope.fDataUser.num_documento || $scope.fDataUser.num_documento == null || $scope.fDataUser.num_documento == ''){
        $scope.crearAlerta('Debe ingresar un Número de documento válido.');
        return;
	    }

      if( $scope.fDataUser.tipo_documento == 'DNI' && $scope.fDataUser.num_documento.length > 8 ){
        $scope.crearAlerta('Debe ingresar un Número de DNI válido.');
        return;
      }

      if(!$scope.fDataUser.nombres || $scope.fDataUser.nombres == null || $scope.fDataUser.nombres == ''){
        $scope.crearAlerta('Debe ingresar Nombres.');
        return;
      }

      if(!$scope.fDataUser.apellido_paterno || $scope.fDataUser.apellido_paterno == null || $scope.fDataUser.apellido_paterno == ''){
        $scope.crearAlerta('Debe ingresar Apellido paterno.');
        return;
      }

      if(!$scope.fDataUser.apellido_materno || $scope.fDataUser.apellido_materno == null || $scope.fDataUser.apellido_materno == ''){
        $scope.crearAlerta('Debe ingresar Apellido materno.');
        return;
      }

      if(!$scope.fDataUser.email || $scope.fDataUser.email == null || $scope.fDataUser.email == ''){
        $scope.crearAlerta('Debe ingresar E-mail.');
        return;
      }
      if(!$scope.fDataUser.fecha_nacimiento || $scope.fDataUser.fecha_nacimiento == null || $scope.fDataUser.fecha_nacimiento == ''){
        $scope.crearAlerta('Debe ingresar Fecha Nacimiento.');
        return;
      }
      if(!$scope.fDataUser.celular || $scope.fDataUser.celular == null || $scope.fDataUser.celular == ''){
        $scope.crearAlerta('Debe ingresar Celular.');
        return;
      }
      if($scope.fDataUser.sexo =='-'){
        $scope.crearAlerta('Seleccione sexo.');
        return;
      }
      if( !$scope.fDataUser.clave         ||
          $scope.fDataUser.clave == null  ||
          $scope.fDataUser.clave == ''    ||
          !$scope.fDataUser.repeat_clave  ||
          $scope.fDataUser.repeat_clave == null ||
          $scope.fDataUser.repeat_clave == ''
      ){
        $scope.crearAlerta('Debe ingresar Claves.');
        return;
      }
      if($scope.fDataUser.clave !== $scope.fDataUser.repeat_clave){
        $scope.crearAlerta('Las claves ingresadas no coinciden');
        return;
      }
      /*if(!$scope.resultado || $scope.resultado == ''){
        $scope.fAlert = {};
        $scope.fAlert.type= 'danger';
        $scope.fAlert.msg= 'Debe completar validación';
        $scope.fAlert.strStrong = 'Error.';
        return;
      }*/
      if(!$scope.acepta){
        $scope.fAlert = {};
        $scope.fAlert.type= 'danger';
        $scope.fAlert.msg= 'Debe aceptar los Términos y Condiciones.';
        $scope.fAlert.strStrong = 'Error';
        return;
      }
      //reCapcha

      console.log('vcRecaptchaService.getResponse()',$scope.recapcha);
      if(typeof $scope.recapcha === 'undefined' || $scope.recapcha === ""){ //if string is empty
        $scope.fAlert = {};
        $scope.fAlert.type= 'danger';
        $scope.fAlert.msg= 'Debe resolver el captcha';
        $scope.fAlert.strStrong = 'Error.';
        return;
      }
      if(angular.isDefined(localStorageService.get('paquete_campania_id_session'))){
        $scope.fDataUser.idcampana = localStorageService.get('paquete_campania_id_session');
      }
      blockUI.start('Registrando usuario...');
      $scope.fDataUser.g_recaptcha_response = $scope.recapcha;
      usuarioServices.sRegistrarUsuario($scope.fDataUser).then(function (rpta) {
		$scope.cbExpiration();
        if(rpta.flag == 0){
          $scope.fAlert = {};
          $scope.fAlert.type= 'danger';
          $scope.fAlert.msg= rpta.message;
          $scope.fAlert.strStrong = 'Error';
          $scope.fAlert.icon = 'fa fa-exclamation';

        }else if(rpta.flag == 1){
          $scope.fDataUser = {};
          $scope.fDataUser.sexo = '-';
          $scope.fDataUser.tipo_documento = 'DNI';
          $scope.fAlert = {};
          $scope.btnViewLogin();
          $uibModal.open({
            templateUrl: angular.patchURLCI+'Usuario/ver_popup_registro_exitoso',
            size: 'lg',
            //backdrop: 'static',
            //keyboard:false,
            scope: $scope,
            controller: function ($scope, $modalInstance) {
              $scope.titleForm = 'Genial! ';
              $scope.msj = rpta.message;

              $scope.btnCancel = function(){
                $modalInstance.dismiss('btnCancel');
              }
            }
          });
        }
        blockUI.stop();
      });
    }
    $scope.closeAlert = function() {
        $scope.fAlert = null;
    }
    $scope.btnActualizarDatosCliente = function(){
      if(typeof($scope.fDataUser.nombres) == "undefined" || $scope.fDataUser.nombres == null || $scope.fDataUser.nombres == '')
      {
        SweetAlert.swal({
          title: "Atención",
          text: "Debe colocar los nombres",
          type: "warning",
          showCancelButton: false,
          confirmButtonColor: "#038dcc",confirmButtonText: "Aceptar!",
          closeOnConfirm: true
        });
        return;
      }
      if(typeof($scope.fDataUser.apellido_paterno) == "undefined" || $scope.fDataUser.apellido_paterno == null || $scope.fDataUser.apellido_paterno == '')
      {
        SweetAlert.swal({
          title: "Atención",
          text: "Debe colocar el apellido paterno",
          type: "warning",
          showCancelButton: false,
          confirmButtonColor: "#038dcc",confirmButtonText: "Aceptar!",
          closeOnConfirm: true
        });
        return;
      }
      if(typeof($scope.fDataUser.apellido_materno) == "undefined" || $scope.fDataUser.apellido_materno == null || $scope.fDataUser.apellido_materno == '')
      {
        SweetAlert.swal({
          title: "Atención",
          text: "Debe colocar el apellido materno",
          type: "warning",
          showCancelButton: false,
          confirmButtonColor: "#038dcc",confirmButtonText: "Aceptar!",
          closeOnConfirm: true
        });
        return;
      }
      if($scope.fDataUser.sexo == "-")
      {
        SweetAlert.swal({
          title: "Atención",
          text: "Debe seleccionar el sexo",
          type: "warning",
          showCancelButton: false,
          confirmButtonColor: "#038dcc",confirmButtonText: "Aceptar!",
          closeOnConfirm: true
        });
        return;
      }
      if($scope.fDataUser.fecha_nacimiento == "-")
      {
        SweetAlert.swal({
          title: "Atención",
          text: "Debe colocar su fecha de nacimiento",
          type: "warning",
          showCancelButton: false,
          confirmButtonColor: "#038dcc",confirmButtonText: "Aceptar!",
          closeOnConfirm: true
        });
        return;
      }
      if(typeof($scope.fDataUser.celular) == "undefined")
      {
        SweetAlert.swal({
          title: "Atención",
          text: "Debe colocar su número de télefono movil",
          type: "warning",
          showCancelButton: false,
          confirmButtonColor: "#038dcc",confirmButtonText: "Aceptar!",
          closeOnConfirm: true
        });
        return;
      }
      if(typeof($scope.fDataUser.departamento) == "undefined" || $scope.fDataUser.departamento == null)
      {
        SweetAlert.swal({
          title: "Atención",
          text: "Debe colocar el departamento",
          type: "warning",
          showCancelButton: false,
          confirmButtonColor: "#038dcc",confirmButtonText: "Aceptar!",
          closeOnConfirm: true
        });
        return;
      }
      if(typeof($scope.fDataUser.provincia) == "undefined" || $scope.fDataUser.provincia == null)
      {
        SweetAlert.swal({
          title: "Atención",
          text: "Debe colocar la provincia",
          type: "warning",
          showCancelButton: false,
          confirmButtonColor: "#038dcc",confirmButtonText: "Aceptar!",
          closeOnConfirm: true
        });
        return;
      }
      if(typeof($scope.fDataUser.distrito) == "undefined" || $scope.fDataUser.distrito == null)
      {
        SweetAlert.swal({
          title: "Atención",
          text: "Debe colocar el distrito",
          type: "warning",
          showCancelButton: false,
          confirmButtonColor: "#038dcc",confirmButtonText: "Aceptar!",
          closeOnConfirm: true
        });
        return;
      }
      if(typeof($scope.fDataUser.direccion) == "undefined" || $scope.fDataUser.direccion == null)
      {
        SweetAlert.swal({
          title: "Atención",
          text: "Debe colocar la dirección",
          type: "warning",
          showCancelButton: false,
          confirmButtonColor: "#038dcc",confirmButtonText: "Aceptar!",
          closeOnConfirm: true
        });
        return;
      }
      blockUI.start('Actualizando datos...');
      usuarioServices.sActualizarDatosCliente($scope.fDataUser).then(function (rpta) {
        if(rpta.flag == 0){
          SweetAlert.swal({
            title: "Error",
            text: rpta.message,
            type: "error",
            showCancelButton: false,
            confirmButtonColor: "#d9534f",confirmButtonText: "Aceptar!",
            closeOnConfirm: true
          });
          /*$scope.fAlert = {};
          $scope.fAlert.type= 'danger';
          $scope.fAlert.msg= rpta.message;
          $scope.fAlert.strStrong = 'Error';
          $scope.fAlert.icon = 'fa fa-exclamation';
          setTimeout(function() {
                $scope.closeAlert();
              }, 15000);*/
        }else if(rpta.flag == 1){
          var msg =  rpta.message;
          usuarioServices.sRecargarUsuarioSession($scope.fDataUser).then(function (rpta) {
            if(rpta.flag == 1){
              SweetAlert.swal({
                title: "Genial!",
                text: msg,
                type: "info",
                showCancelButton: false,
                confirmButtonColor: "#44469D",confirmButtonText: "Aceptar!",
                closeOnConfirm: true
              });
              /*$scope.init();
              $scope.fAlert = {};
              $scope.fAlert.type= 'success';
              $scope.fAlert.msg= msg;
              $scope.fAlert.icon= 'fa fa-smile-o';
              $scope.fAlert.strStrong = 'Genial! ';
              setTimeout(function() {
                $scope.closeAlert();
              }, 15000);*/
              if( rpta.datos.perfil_completo ){
                $("#perfil").addClass("animation-perfil-inicial");
                setTimeout(function() {
                  $("#perfil").removeClass("animation-perfil-inicial");
                  $("#perfil").addClass("animation-perfil");
                }, 1800);
              }else{
                $("#perfil").removeClass("animation-perfil-inicial animation-perfil");
              }
            } else{
              alert('Error inesperado');
            }
          });
        }
        blockUI.stop();
      });
    }

    $scope.btnActualizarClave = function (){
      $scope.closeAlertClave = function() {
        $scope.fAlertClave = null;
      }

      $scope.fDataUsuario.miclave = 'si';
      blockUI.start('Actualizando datos...');
      usuarioServices.sActualizarPasswordUsuario($scope.fDataUsuario).then(function (rpta){
        if(rpta.flag == 1){
          $scope.fAlertClave = {};
          $scope.fAlertClave.type= 'success';
          $scope.fAlertClave.msg= rpta.message;
          $scope.fAlertClave.strStrong = 'Genial.';
          $scope.fDataUsuario = {};
        }else if(rpta.flag == 2){
          $scope.fDataUsuario.clave = null;
          $scope.fAlertClave = {};
          $scope.fAlertClave.type= 'warning';
          $scope.fAlertClave.msg= rpta.message;
          $scope.fAlertClave.strStrong = 'Advertencia.';
        }else if(rpta.flag == 0){
          $scope.fDataUsuario.claveNueva = null;
          $scope.fDataUsuario.claveConfirmar = null;
          $scope.fAlertClave = {};
          $scope.fAlertClave.type= 'danger';
          $scope.fAlertClave.msg= rpta.message;
          $scope.fAlertClave.strStrong = 'Error. ';
          setTimeout(function() {
            $('#nuevoPass').focus();
          }, 500);
        }else{
          alert('Error inesperado');
        }
        blockUI.stop();
        setTimeout(function() {
            $scope.closeAlertClave();
          }, 1000);
      });
    }

    $scope.btnCambiarMiFotoPerfil = function (usuario, session){
      blockUI.start('Abriendo formulario...');
      $uibModal.open({
        templateUrl: angular.patchURLCI+'usuario/ver_popup_foto_perfil',
        controller: function ($scope, $modalInstance) {
          $scope.titleForm = 'Cambiar Foto de perfil';
          $scope.dataUsuario = usuario;
          $scope.session = session;
          $scope.closeAlertSubida = function() {
            $scope.fAlertSubida = null;
          }

          $scope.aceptarSubida = function (){
            blockUI.start('Subiendo Archivo...');
            var formData = new FormData();
            angular.forEach($scope.fDataSubida,function (val,index) {
              formData.append(index,val);
            });
            usuarioServices.sSubirFotoPerfil(formData).then(function (rpta) {
              var nuevoArchivo = rpta.nuevoNombre;
              if(rpta.flag == 1){
                $scope.cancelSubida();
                usuarioServices.sRecargarUsuarioSession($scope.dataUsuario).then(function (rpta) {
                  if(rpta.flag == 1){
                    $scope.session.nombre_imagen = nuevoArchivo;
                    $window.location.reload();
                  } else{
                    alert('Error inesperado');
                  }
                });
              }else if(rpta.flag == 0){
                $scope.fAlertSubida = {};
                $scope.fAlertSubida.type= 'warning';
                $scope.fAlertSubida.msg= rpta.message;
                $scope.fAlertSubida.strStrong = 'Advertencia.';
              }else{
                alert('Error inesperado');
              }

              blockUI.stop();
              setTimeout(function() {
                $scope.closeAlertSubida();
              }, 1000);
            });
          }

          $scope.cancelSubida = function () {
            $modalInstance.dismiss('cancelSubida');
            $scope.fDataSubida = {};
          }
          blockUI.stop();
        }
      });
    }

    $scope.btnActualizarPerfilClinico = function (){
      blockUI.start('Actualizando datos...');
      $scope.fAlertPerfilCli = null;
      usuarioServices.sActualizarPerfilClinico($scope.fDataDashboard).then(function(rpta){
        var msg = rpta.message;
        if(rpta.flag == 1){
          usuarioServices.sRecargarUsuarioSession($scope.fSessionCI).then(function(rpta){
            if(rpta.flag == 1){
              $scope.fSessionCI = rpta.datos;
              $scope.initPerfil();
              $scope.fAlertPerfilCli = {};
              $scope.fAlertPerfilCli.type= 'success';
              $scope.fAlertPerfilCli.msg= msg;
              $scope.fAlertPerfilCli.strStrong = 'Genial!';
            }
          });
        }else{
          $scope.fAlertPerfilCli = {};
          $scope.fAlertPerfilCli.type= 'warning';
          $scope.fAlertPerfilCli.msg= rpta.message;
          $scope.fAlertPerfilCli.strStrong = 'Advertencia.';
        }
        blockUI.stop();
      });
    }

  }])
  .service("usuarioServices",function($http, $q) {
    return({
      sVerificarUsuarioPorDocumento : sVerificarUsuarioPorDocumento,
      sRegistrarUsuario             : sRegistrarUsuario,
      sActualizarDatosCliente       : sActualizarDatosCliente,
      sRecargarUsuarioSession       : sRecargarUsuarioSession,
      sActualizarPasswordUsuario    : sActualizarPasswordUsuario,
      sSubirFotoPerfil              : sSubirFotoPerfil,
      sActualizarPerfilClinico      : sActualizarPerfilClinico,
      sListarDepartamentoPorCodigo  : sListarDepartamentoPorCodigo,
      sListarProvinciaDeDepartamentoPorCodigo: sListarProvinciaDeDepartamentoPorCodigo,
      sListarDistritosDeProvinciaPorCodigo: sListarDistritosDeProvinciaPorCodigo,
      sListarDepartamentoPorAutocompletado: sListarDepartamentoPorAutocompletado,
      sListarProvinciaPorAutocompletado: sListarProvinciaPorAutocompletado,
      sListarDistritoPorAutocompletado: sListarDistritoPorAutocompletado,
      sListarDepartamentos: sListarDepartamentos,
    });
    function sVerificarUsuarioPorDocumento(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"Usuario/verificar_usuario_por_documento",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sRegistrarUsuario(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"Usuario/registrar_usuario",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sActualizarDatosCliente(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"Usuario/actualizar_datos_cliente",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sRecargarUsuarioSession(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"Usuario/recargar_usuario_session",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sActualizarPasswordUsuario(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"Usuario/actualizar_password_usuario",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sSubirFotoPerfil(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"Usuario/subir_foto_perfil",
            data : datos,
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sActualizarPerfilClinico(datos) {
      var request = $http({
            method : "post",
            url : angular.patchURLCI+"Usuario/actualizar_perfil_clinico",
            data : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sListarDepartamentoPorCodigo (pDatos) {
      var datos = pDatos || {};
      var request = $http({
        method  : "post",
        url     : angular.patchURLCI+"Usuario/lista_departamento_por_codigo",
        data    : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sListarProvinciaDeDepartamentoPorCodigo (pDatos) {
      var datos = pDatos || {};
      var request = $http({
        method  : "post",
        url     : angular.patchURLCI+"Usuario/lista_provincia_departamento_por_codigo",
        data    : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sListarDistritosDeProvinciaPorCodigo (pDatos) {
      var datos = pDatos || {};
      var request = $http({
        method  : "post",
        url     : angular.patchURLCI+"Usuario/lista_distrito_provincia_por_codigo",
        data    : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sListarDepartamentoPorAutocompletado (datos) {
      var request = $http({
        method  : "post",
        url     : angular.patchURLCI+"Usuario/lista_dptos_por_autocompletado",
        data    : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sListarProvinciaPorAutocompletado (datos) {
      var request = $http({
        method  : "post",
        url     : angular.patchURLCI+"Usuario/lista_prov_por_autocompletado",
        data    : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sListarDistritoPorAutocompletado (datos) {
      var request = $http({
        method  : "post",
        url     : angular.patchURLCI+"Usuario/lista_distr_por_autocompletado",
        data    : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
    function sListarDepartamentos(pDatos) {
      var datos = pDatos || {};
      var request = $http({
        method  : "post",
        url     : angular.patchURLCI+"usuario/lista_departamentos",
        data    : datos
      });
      return (request.then( handleSuccess,handleError ));
    }
  });
