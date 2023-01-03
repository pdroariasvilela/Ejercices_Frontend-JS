angular
  	.module('theme.bannerPromocion', [])
  	.component('bannerPromocion',{
		templateUrl : angular.patchURLCI + 'Miscellaneous/msc_cargar_componente_bannerPromocion',
	  	controller: [
			'$scope','promocionesServices',
			function($scope,promocionesServices)
			{
				let $ctrl = this;
				$ctrl.$onInit = function(){
					promocionesServices.sCargarBanner().then(function (rpta) {
						if (rpta.flag === 1) {
							$ctrl.bannerText1 = rpta.text1;
							$ctrl.bannerText2 = rpta.text2;
							$ctrl.bannerText3 = rpta.text3;
							$ctrl.url_fondo = rpta.url_fondo;
							$ctrl.url_fondo_resp = rpta.url_fondo_resp;
							$ctrl.url_imagen_izq = rpta.url_imagen_izq;
						}
					});
				}
			}
	  	],
	  	bindings: {
			session: '=',
	  	}
  	})
  	.component('bannerPendientes',{
		templateUrl : angular.patchURLCI + 'Miscellaneous/msc_cargar_componente_bannerPendientes',
	  	controller: [
			'$scope','promocionesServices', '$location',
			function($scope,promocionesServices, $location)
			{
				let $ctrl = this;
				$ctrl.$onInit = function(){
					promocionesServices.sCargarBannerPendientes().then(function (rpta) {
						if (rpta.flag === 1) {
							$ctrl.bannerText1 = rpta.text1;
							$ctrl.bannerText2 = rpta.text2;
							$ctrl.bannerText3 = rpta.text3;
							$ctrl.url_fondo = rpta.url_fondo;
							$ctrl.url_fondo_resp = rpta.url_fondo_resp;
							$ctrl.url_imagen_der = rpta.url_imagen_der;
						}
					});
					// $ctrl.close_banner = $scope.close_banner();
					console.log('metodos', $ctrl.metodos);
					$ctrl.close_banner = $ctrl.metodos;
				}
				$ctrl.goToUrl = function(path){
					$location.path(path);
				}
			}
	  	],
	  	bindings: {
			metodos: '=',
	  	}
  	})
	;