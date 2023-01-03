PF.Init={
	running:false,
	validBrands:{
		'VISA': 'valid',
		'MSCD': 'valid',
		'AMEX': 'valid',
		'DINC': 'valid'
	},
	defaults:{
		containerID: 'alg-paymeform-container',
		listeners: {
			beforeRender: function(){},
			afterRender: function(){},
			beforePay: function(){},
			afterPay: function(response){}
		},
		settings: {
			locale: 'es_PE',
			brands: ['VISA']
		},
		feature: {
			buttonPay: true
		}
	},
	execute: function(config){
		if(!PF.Init.running){
			PF.Init.running=true;
			PF.Cards.configuration = PF.DOM.mixJSON(PF.Init.defaults, config);
			
			var brands=[];
			var configurationBrands=PF.Cards.configuration.settings.brands;
			for(var i=0; i<configurationBrands.length;i++){
				var brandItem=configurationBrands[i].trim();
				if(PF.Init.validBrands[brandItem]=='valid'){
					brands.push(brandItem);
				}
			}
			PF.Cards.configuration.settings.brands=brands;
			
			PF.loadScript('locale.'+PF.Cards.configuration.settings.locale);
			PF.currentLocale=PF.Cards.configuration.settings.locale;
			var retryCount=0;
			var initUI=function(ignoreLocale){
				setTimeout(function(){
					var testMessage=PF.Messages.getMessage('testMessage');
					if(PF.Messages.getMessage('testMessage')=='OK'||ignoreLocale){
						var el=PF.Cards.build(PF.Cards.configuration);
						
						PF.Cards.render(PF.Cards.configuration, el);
						/*arojas [se agrega planes y cuotas ] - 29/09/2018 - inicio*/
						PF.PlanQuota.setConfiguration(PF.Cards.configuration);
						
						/*arojas [se agrega planes y cuotas ] - 29/09/2018 - fin*/
						
					}else{
						retryCount++;
						if(retryCount<20){
							initUI();	
						}else{
							initUI(true);
						}
					}	
				}, 100);
			}
			initUI();
			PF.Init.running=false;
			var data=PF.Cards.configuration.data,
				settings=PF.Cards.configuration.settings,
				currentTime=(new Date()).getTime(),
				identifier=settings.identifier,
				currencyCode=data.operation.currency.code,
				userId=identifier+''+currentTime;
			
			PF.GA.processView({
				userID : userId,
				currency:  currencyCode,
				typeDesign:'PaymeForm',
				idCommerce: identifier
			})
		}
		
	
		
		
	}
}