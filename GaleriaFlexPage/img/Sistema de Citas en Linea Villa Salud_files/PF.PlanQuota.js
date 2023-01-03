PF.PlanQuota = {
//View	
planInputTpl:{
				tag : 'div',
				cls : 'algpf-input-wrapper  algpf-col-6 algpf-plan-wrapper {status}',
				elIdentifier:'plan-wrapper',
				children : [ 
					{
						tag : 'label',
						attr : {
							'for' : 'algpf-plan-input-{counter}'
						},
						cls : 'algpf-focused',
						elIdentifier : 'plan-input-label',
						text : '{planText}'
					}, {
						tag : 'div',
						cls : 'algpf-error-message',
						elIdentifier : 'plan-input-error-message'
					}, {
						tag : 'select',
						cls : 'algpf-input',
						elIdentifier : 'plan-input',
						id : 'algpf-plan-input-{counter}',
						children: [
							{ 
								tag: 'option', 
								text: '{selectPlan}',
								attr: {
									value: ''
								}
							}
						]
					}
				]
},
		
quotaInputTpl:{
		tag : 'div',
		cls : 'algpf-input-wrapper  algpf-col-6 algpf-quota-wrapper {status}',
		elIdentifier : 'quota-input-wrapper',
		children : [ 
			{
				tag : 'label',
				attr : {
					'for' : 'algpf-quota-input-{counter}'
				},
				cls : 'algpf-focused',
				elIdentifier : 'quota-input-label',
				text : '{quotaText}'
			}, {
				tag : 'div',
				cls : 'algpf-error-message',
				elIdentifier : 'quota-input-error-message'
			}, {
				tag : 'select',
				cls : 'algpf-input',
				elIdentifier : 'quota-input',
				id : 'algpf-quota-input-{counter}'
			}
		]
	},		

	
//[ construir el input de planes ]  retorna el plan inicio 
	
buildPlanInput:function(planItems){
		var me=this,
			planInputTpl=me.planInputTpl;
		
		var wrapperEl = PF.DOM.Builder.store['plan-wrapper'];
		if (wrapperEl) {
			var parentElement = wrapperEl.parentElement;
			if (parentElement) {
				wrapperEl.parentElement.removeChild(wrapperEl);
			}
			PF.DOM.Builder.store['plan-wrapper'] = null;
		}
		
		var planInputEl=PF.DOM.Builder.createElement(planInputTpl,{
			selectPlan: PF.Messages.getMessage('waytopay'),
			planText: PF.Messages.getMessage('waytopay'),
			counter: '1'
		});
		
		// evento cuando seleccionamos un plan
		var selectInput=PF.DOM.Builder.store['plan-input'];
		selectInput.addEventListener('change', function(){
			var planValue=selectInput.value;
			PF.log('plan '+planValue+' is selected');
			me.refreshQuotaInput(planValue);
			me.isValid();				
							
		});
		me.listPlanSelection = me.getPlanJSON();
		console.log('Inicio Prueba plan 2221');
		console.log(me.listPlanSelection);
		PF.DOM.each(planItems, function(index, planItem) {
			console.log(planItem);
			var optionEl=PF.DOM.Builder.createElement({ 
				tag: 'option', 
				text: planItem.name,
				attr: {
					value: planItem.code
				}
			});
			if(optionEl.value==me.listPlanSelection.Normal || optionEl.value=="01"){					
				optionEl.selected ="true";	
				console.log("Prueba alignet")
				//var planValue=selectInput.value;
				//me.refreshQuotaInput(planValue);
				//me.isValid();				
			}				
			selectInput.appendChild(optionEl);
		});
		console.log("Prueba15-02-2021")
			var planValue=selectInput.value;
			me.refreshQuotaInput(planValue);
			me.isValid();	
		me.planInput=selectInput;
		me.quotaInput=null;
		return planInputEl;
	},
	
	//[ construir el input de planes ] fin
	
	buildPlan:function(status){			
		var me = this,
		planInputTpl = me.planInputTpl,
		containerEl = me.getContainerEl();	
		var wrapperEl = PF.DOM.Builder.store['plan-wrapper'];
		if (wrapperEl) {
			var parentElement = wrapperEl.parentElement;
			if (parentElement) {
				wrapperEl.parentElement.removeChild(wrapperEl);
			}
			PF.DOM.Builder.store['plan-wrapper'] = null;
		}
		
		var planInputEl = PF.DOM.Builder.createElement(planInputTpl, {
			selectPlan: PF.Messages.getMessage('waytopay'),
			planText: PF.Messages.getMessage('waytopay'),
			counter : '1',
			status:status
		
		});
		var selectInput = PF.DOM.Builder.store['plan-input'];
								
		var optionEl = PF.DOM.Builder.createElement({
				tag : 'option',
				text : 'Normal',
				attr : {
					value : '00'
				}
			});						
		optionEl.selected = "true";		
		console.log('prueba');
		selectInput.appendChild(optionEl);	
		containerEl.appendChild(planInputEl);
		console.log('prueba 02-02-2021');	
	},		
	buildQuota:function(status){
		var me = this,  			
		containerEl = me.getContainerEl(),
		quotaInputTpl = me.quotaInputTpl;
		
		var wrapperEl = PF.DOM.Builder.store['quota-input-wrapper'];
		if (wrapperEl) {
			console.log("alignet3")
			var parentElement = wrapperEl.parentElement;
			if (parentElement) {
				wrapperEl.parentElement.removeChild(wrapperEl);
			}
			PF.DOM.Builder.store['quota-input-wrapper'] = null;
		}	
				      
		var quotaInputEl = PF.DOM.Builder.createElement(quotaInputTpl, {
				quotaText : PF.Messages.getMessage('dues'),
				counter : '1',
				status:status
		});		
		
		var selectInput=PF.DOM.Builder.store['quota-input'];
		
		var optionEl = PF.DOM.Builder.createElement({
				tag : 'option',
				text : 'Sin cuotas',
				attr : {
					value : '00'
				}
			});
		console.log("alignet3")
		console.log(optionEl);
		selectInput.appendChild(optionEl);			
		containerEl.appendChild(quotaInputEl);												
	},
	refreshQuotaInput:function(planCode){
		console.log('entro refreshQuotaInput')
		var me = this,
			containerEl = me.getContainerEl(),
			quotaInputTpl=me.quotaInputTpl;
		var wrapperEl=PF.DOM.Builder.store['quota-input-wrapper'];			
		console.log('values for refreshquotainput')
		console.log(containerEl);
		console.log(wrapperEl);
		if(wrapperEl){
			console.log('existe wrapper1')
			var parentElement=wrapperEl.parentElement;
			if(parentElement){
				wrapperEl.parentElement.removeChild(wrapperEl);
			}
			PF.DOM.Builder.store['quota-input-wrapper']=null;
		}
		if(containerEl){
			console.log('existe containert')
			var quotaItems=me.getQuotas(planCode);
			if(quotaItems.length>0){
				console.log('entro refreshQuotaInput mas de cero')
				var quotaInputEl=PF.DOM.Builder.createElement(quotaInputTpl,{
					quotaText: PF.Messages.getMessage('dues'), 
					counter: '1'
				});
				var selectInput=PF.DOM.Builder.store['quota-input'];

				PF.DOM.each(quotaItems, function(index, quotaItem) {
					var optionEl=PF.DOM.Builder.createElement({ 
						tag: 'option', 
						text: quotaItem.name,
						attr: {
							value: quotaItem.code
						}
					});
					
					selectInput.appendChild(optionEl);
				});
				me.quotaInput=selectInput;
				containerEl.appendChild(quotaInputEl);
			}
			
		}
	},
	render:function(){
		var me = this,
			containerEl = me.getContainerEl();			
		var plans=me.getPlans();
		PF.log({plans:plans});
		var planInput=null;
		PF.DOM.removeChildren(containerEl);
		if(plans && plans.items && plans.items.length>0){
			PF.log('begin render');
			planInput=me.buildPlanInput(plans.items);
		}
		
		if(planInput){
			containerEl.appendChild(planInput);
			me.isBuildPlan = true;
		}
		
		PF.Effect.minimizedLabel('plan-input', 'plan-input-label')
		PF.Effect.errorToolTipEnabled('plan-input');
		
	},
	renderInitial:function(status){			
		console.log("alignet2")
		var me = this,
		containerEl = me.getContainerEl();						
		PF.DOM.removeChildren(containerEl);
		me.buildPlan(status);
		me.buildQuota(status);
		PF.Effect.minimizedLabel('plan-input', 'plan-input-label')
		PF.Effect.errorToolTipEnabled('plan-input');
		
	},		
	getPlanQuotaToRender:function(){
		var me = this;
		var plans=me.getPlans();
		PF.log({plans:plans});
		var items=[];
		if(plans && plans.items && plans.items.length>0){							 
			items = plans.items;				
		}		
		return items;
	},		
	getPlanValue:function(){
		var me=this,
			planInput=me.planInput,
			value=planInput?planInput.value:'';
		return value;
	},
	getQuotaValue:function(){
		var me=this,
			quotaInput=me.quotaInput,
			value=quotaInput?quotaInput.value:'';
		return value;
	},		


	selectQuotaDefault :function(code){
		var me = this;
		code = '01';
		me.refreshQuotaInput(code); 			
	},
	selectPlanDefault:function(){	
		var me = this;			
		console.log('selectplandefault: ');
		console.log(me.listPlanSelection.Normal);
		me.selectQuotaDefault(me.listPlanSelection.Normal);		
	},
	getPlanJSON :function(){			
		 var me = this,
		 listPlanSelection;
		 var list = me.getPlans();
		 var items = list.items;
		 PF.DOM.each(items,function(index, listItem){				  
			    var name = listItem.name;
			    if(name == 'Normal'){
			    	me.normal = listItem.code;				    	
			    }else{
			    	me.diferido = listItem.code;
			    }				    
		    });
			listPlanSelection={
					 Normal: me.normal,
					 Diferido : me.diferido				
			}			 
		 return listPlanSelection;
	},
	isValidPlanQuota:function(){
		var me= this;
		var isValid=false;
		if(me.isBuildPlan){
			var element=PF.DOM.Builder.store['plan-input'];
			var elementWrapper=PF.DOM.Builder.store['plan-wrapper'];			
			PF.DOM.removeClass(elementWrapper, "algpf-error");
			var planValue=element.value;
			if(planValue=='Forma de pago'){
				isValid = false;
				PF.DOM.addClass(elementWrapper, "algpf-error");
				me.errorSetup('plan-input-error-message','errorFormaPago',element);					
			}else{
				isValid = true;
			}			 			
		}	
		return isValid;
	},		
	  errorSetup:function(securityCodeErrorMessageParam,errorMessageParam,inputElParam){       	 
  	    var securityCodeErrorMessage = PF.DOM.Builder.store[securityCodeErrorMessageParam];					
			var errorMessage = PF.Messages.getErrorMessage(errorMessageParam);	 				
			while (securityCodeErrorMessage.firstChild) {
				securityCodeErrorMessage.removeChild(securityCodeErrorMessage.firstChild);
			} 				
			PF.Effect.errorToolTip({
				errorMessage : errorMessage,
				errorMessageElement : securityCodeErrorMessage,
				inputEl : inputElParam
			});	
  },
	
	//  end  view
	
	// Model
	
getPlanesQuotas:function(bin, callback){
		var me=this,
			merchant = me.getMercantIdentifier(),
			currency = me.getCurrencyIdentifier();
		var data={};
		PF.log("Begin mask load effect");	
		var mainWrapperCard=PF.DOM.Builder.store['planquota-container'];
		if(mainWrapperCard != undefined || mainWrapperCard != null) {
			PF.Effect.loadMask(mainWrapperCard, true);				
		}			
		if(bin != null && bin.length>0){								
				   me.getPostPlanesAndQuota(merchant, currency, bin,function(responseData){
						data=responseData;
						PF.log('loading bin '+bin+ ' plan and quotas for merchant identifier '+merchant+' and currency '+currency);
						callback(data);
						if(data != null && data.errorCode=='00' || data.errorCode=='KO'){						 					
							var plan = responseData.planes;
							if(plan != null && plan.length > 0 && data.errorCode=='00'){
							   PF.log('Begin setDefault plan quota');
							   me.setDefaultPlanQuota();
							}
							PF.log('Delete mask load effect');
							var loadMask=PF.DOM.Builder.store['loadMask-container'];   						
							PF.Effect.removeloadMask(loadMask);	
						}else{
							PF.log("error consulte plan and quota");
							PF.log('Delete mask load effect');
							var loadMask1=PF.DOM.Builder.store['loadMask-container'];   						
							PF.Effect.removeloadMask(loadMask1);
						}					
					});
	  
		}else{
			PF.log('bin is empty');
			callback(data);
		}
	},
   getPostPlanesAndQuota:function (merchant, currency, bin, callback){
	  var  url =  PF.baseURL+'WS_PLANCUOTA/rest/operationAcquirer/consulteNewSchemeLight',	 
	  requestData = {
			"idEcommerce": merchant,
			"bin": bin,
			"currency": currency
	  };
	  PF.log('url servicio planes y cuotas');
	  PF.log({url:url});
	  PF.Ajax.request({
		  url : url,
			method : 'POST',
			type : 'json',			
			data : requestData,
			callback : function(response) {
				if(callback){
					callback(response);
				}
			}			  
	  });
   },
   setDefaultPlanQuota:function(){
       var me = this;
        me.selectPlanDefault();  
        console.log('entro defaultplan');
   },
   
  // end model
   
   //Controller
	parsePlans : function(data){
		var me=this,
			plans={items:[]},
			quotas={};
		if(data && data.errorCode=='00' && data.planes){
			PF.DOM.each(data.planes, function(index, planItem) {
				if(!quotas[planItem.idPlan]){
					quotas[planItem.idPlan]={items:[]};
					plans.items.push({code:planItem.idPlan,name:planItem.namePlan});
				}
				quotas[planItem.idPlan].items.push({code:planItem.idQuota,name: planItem.nameQuota});
			})
		}
		me.quotas=quotas;
		me.plans=plans;
	},
	getPlans : function(){
		var me = this;
		return me.plans;
	},
	getQuotas : function(planCode){
		var me=this,
			quotasData=[];
		if(planCode != null &&planCode.trim().length>0&& me.quotas[planCode]){
			quotasData=me.quotas[planCode].items;
		}	
		// obtener las cuotas ordenadas
		var code = me.orderQuotasForCode(quotasData);
		var listOrder=me.mergeQuota(code,quotasData);            
		return listOrder;
	},
	orderQuotasForCode :function(element){
		 var list=[];  
		PF.DOM.each(element, function(index, elementItem) {				
			var code = elementItem.code;		
			list.push(code);				
		});			
		return list.sort();
	},
	mergeQuota:function(code,quotas){
		var list=[];
			for(key in code){					
				PF.DOM.each(quotas, function(index, quotasItem) {
					var quotasItemcode = quotasItem.code;					
					if( quotasItemcode == code[key] ){					
						list.push(quotasItem);						
					}				
				});								
			}								
		return list;
	},
//  fin controller	
	
  //  construccion widget
	setConfiguration:function(config){
		PF.log('setConfiguration..');
		
		PF.log({config:config});
		var me = this,
		baseConfig    = config,
		feature       = baseConfig.feature?baseConfig.feature:{},
		data          = baseConfig.data?baseConfig.data:{},
		operation     = data.operation?data.operation:{},
		currency      = operation.currency?operation.currency:{},
		currencyCode  = currency.code,
		planQuota     = feature.planQuota?feature.planQuota:false,
		renderTo      = 'planquota-container',
		settings      = baseConfig.settings,
		merchant      = settings.identifier?settings.identifier:settings.merchant;
		
		if(planQuota && planQuota===true || planQuota == "true" ){
			PF.log('enable plan quota');
			me.enablePlanQuota();
		}else{
			PF.log('disable plan quota');
			me.disablePlanQuota();
		}	
		me.containerIdentifier=renderTo;
		me.merchantIdentifier=merchant;
		me.currencyIdentifier=currencyCode == 'PEN' ? '604' : '840';
	},
	enable:false,
	planTemplate : {
		
	},
	planQuota : {
		
	},
	getMercantIdentifier:function(){
		var me = this;
		return me.merchantIdentifier;
	},
	getCurrencyIdentifier:function(){
		var me = this;
		return me.currencyIdentifier;
	},
	getContainerEl:function(){
		var me=this,
		contentEl=PF.DOM.Builder.store[me.containerIdentifier];
		return contentEl;
	},
	getPlan: function(){
		var me=this,	
		planValue=me.getPlanValue();
		return planValue;
	},
	getQuota: function(){
		var me = this,
		quotaValue = me.getQuotaValue();
		return quotaValue;
	},
	enablePlanQuota:function(){
		var me = this;
		me.enable=true;
	},
	disablePlanQuota:function(){
		var me = this;
		me.enable=false;
	},
	isEnabled:function(){
		var me = this;
		return me.enable;
	},
	
	
	//ejecuta cuando se coloca el bin
	refresh : function(bin){
		PF.log('execute refresh..');
		var me=this;
		var planQuotaData=null;
		PF.log('using '+me.containerIdentifier);
		var contentEl=me.getContainerEl();
		if(!contentEl){
			PF.log('Plan quota not found container');
		}else if(me.enable){
			
			var refreshRender=function(){
				me.parsePlans(planQuotaData);
				PF.log({contentEl:contentEl});
				me.render();
				PF.log('refreshing plan and quota with bin '+bin);
			}				
			if(bin != null && bin.trim().length>0){					
				me.renderInitial('disable');	

				var getPlanesQuotass = function(){												
					me.getPlanesQuotas(bin, function(responsePlanQuotaData){				 					    	
					var mainWrapperCard=PF.DOM.Builder.store['planquota-container'];
					if(mainWrapperCard != undefined || mainWrapperCard != null) {
						PF.Effect.loadMask(mainWrapperCard, true);				
					}						
					planQuotaData=responsePlanQuotaData;
					PF.log({planQuotaData:planQuotaData});						
				    var code = responsePlanQuotaData.errorCode;						
				    if(code == '00' || code=='KO'){
						var loadMask1=PF.DOM.Builder.store['loadMask-container'];   						
						PF.Effect.removeloadMask(loadMask1);						
						refreshRender();
					}						
				  });
				}					 									
			    getPlanesQuotass();						 				  				 		
			}else{
				refreshRender();
			}				
		}else{
			PF.log('Plan quota is disabled ');
		}
	},
	isValid :function(){
		var me = this;
		return me.isValidPlanQuota();
	}

}