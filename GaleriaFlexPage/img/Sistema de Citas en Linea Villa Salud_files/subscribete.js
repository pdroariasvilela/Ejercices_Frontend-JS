angular
  .module('theme.subscribete', [])
  .component('subscribete', {
    templateUrl: angular.patchURLCI + 'Miscellaneous/msc_cargar_componente_subscribete',
    controller: ['$log', '$scope',
    'blockUI',
    'promocionesServices',
    function ($log, $scope,
      blockUI,
      promocionesServices
    ) {
      let $ctrl = this;

      $ctrl.$onInit = function () {
        $ctrl.email = null;
        $ctrl.mensaje = '';

      };

    $ctrl.btnSubscribe = function(){
      console.log('$ctrl.email : ',$ctrl.email);
      if( $ctrl.email == undefined || $ctrl.email == ''){
        $ctrl.mensaje = 'Ingrese un email válido';
        $ctrl.clase = 'text-danger';
        // alert('Ingrese un email válido');
      }else{
        var params = {
          'email' : $ctrl.email
        }
        blockUI.start('Enviando...');
        promocionesServices.sRegistrarSubscripcion(params).then(function (rpta) {
          blockUI.stop();
          if(rpta.flag == 1){
            $ctrl.clase = 'text-success';
            $ctrl.email = null;
          }else if(rpta.flag == 0){
            $ctrl.clase = 'text-danger';

          }else{
            alert('Error inesperado');
          }
          $ctrl.mensaje = rpta.message;
        });

      }
    }
    $ctrl.limpiarMensaje = function(){
      $ctrl.mensaje = '';
    }

    }],
    bindings: {
      // subscribeModel: '='
    }
  });