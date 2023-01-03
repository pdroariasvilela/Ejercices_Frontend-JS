PF.Pay={
	running:false,
	data:{
		headers:{
			identifier : null,
			signature : null
		},
		body:{
			peration:{
				number: null,
				amount: null,
				currencyCode: null,
				productDescription: null,
				customer: { name: null, lastName: null, email: '', address: '', zip: '', city: '', state: '', country: '', phone: ''}
			},
			settings:{
				returnURL: '',
				mcc : '',
				commerceAssociated : ''
			},
			features:{
				recurrent:{
					accepted: true,
					customer: { name: '', lastName: '', email: '', address: '', zip: '', city: '', state: '', country: '', phone: ''}
				},
				wallet:{
					ecommerceCode: 'AAGGBB',
					userCode: '11-444-2'
				},
				reserved: [
					{name: 'campo1', value: 'valor 1'},
					{name: 'campo2', value: 'valor 2'}
				]
			},
			payment:{
				cardNumber:'',
				expiryDate:'',
				securityCode:'',
				token:''
			}
		}
	},
	printResponse:function(responseType,message){
		var config= PF.Cards.configuration,
			containerID= config.containerID;
		var tpl={
			tag:'div',
			cls : 'algpf-panel-wrapper algpf-response-container',
			attr: {
				'data-responsetype': '{responseType}'
			},
			children : [
	            {
	            	tag : 'div',
	            	cls: 'algpf-response-icon',
	            	children : [
        	            {
        	            	tag : 'img',
        	            	attr : {
        	            		'src' : PF.baseURL+PF.context+'/images/PF/response-icon-{responseType}.png'
        	            	}
        	            }
	            	]
	            },
	            {
	            	tag : 'div',
	            	cls: 'algpf-response-message',
	            	text : '{message}'
	            }
            ]
		}
		var containerEl= document.getElementById(containerID);
		while (containerEl.firstChild) {
			containerEl.removeChild(containerEl.firstChild);
		}
		var responseEl= PF.DOM.Builder.createElement(tpl,{
			responseType: responseType,
			message: message
		});
		containerEl.appendChild(responseEl);
		
	},
	buildPostData:function(){
		
		var paymentData=PF.Cards.getPaymentData(),
			config=PF.Cards.configuration,			
			settings=config.settings,
			data=config.data,
			feature=config.feature,
			operation=data.operation,
			operationNumber=operation.operationNumber,
			amount=operation.amount,
			currency=operation.currency,
			currencyCode=currency.code,
			productDescription=operation.productDescription,
			language=settings.locale;
		var	responseType=settings.responseType;
		var requestData={
			operation: {
				number: operationNumber,
				amount: amount,
				currencyCode: currencyCode,
				productDescription: productDescription
			},
			settings:{
				language : language,
				responseType : responseType
			},
			payment:{
				cardholderInformation:{
					name : paymentData.name,
					lastname : paymentData.lastname
				},
				cardNumber: paymentData.cardNumber,
				expiryDate: paymentData.expiryDate,
				securityCode: paymentData.securityCode
			}
		}
		if(paymentData.plan&&paymentData.quota){
			if(paymentData.plan.trim().length>0&&paymentData.quota.trim().length>0){
				if(!requestData['features']){
					requestData['features']={};
				}
				requestData['features']['planQuota']={
					enable: true,
					plan: paymentData.plan,
					quota: paymentData.quota
				}
			}
		}
		if(data.shipping){
			requestData.operation.shipping=data.shipping;
		}
		if(data.billing){
			requestData.operation.billing=data.billing;
		}
		if(data.customer){
			requestData.operation.customer=data.customer;
		}
		if(data.customer){
			requestData.operation.customer=data.customer;
		}
		if(feature){
			if(feature.reserved){
				if(!requestData['features']){
					requestData['features']={};
				}
				requestData['features']['reserved'] = feature.reserved;
			}
		}
		console.info({requestData:requestData})
		return requestData;
	},
	execute:function(){
		if(!PF.Pay.running){
			PF.Pay.running=true;
			if(PF.Cards.isValidForm()){
				
				
				var config=PF.Cards.configuration,			
					settings=config.settings,
					data=config.data,
					signature = data.signature,
					url=PF.baseURL+PF.context+'/rest/pf/authorize',
					listeners=config.listeners,
					afterPay=listeners.afterPay,
					identifier=settings.identifier;
				
				
				var containerEl=PF.DOM.Builder.store['algpf-panel-wrapper'];
				
				PF.Effect.loadMask(containerEl, true);
				
				var requestData=PF.Pay.buildPostData();
				PF.GA.addProduct({
						brandCode: PF.Cards.brandCode,
						amount: data.operation.amount,
						operationID: settings.identifier+''+ data.operation.operationNumber,
						nameCommerce: settings.identifier
					},function(){
						PF.Ajax.request({
							url: url,
							method: 'POST',
							headers: {
								identifier : identifier,
								signature : signature
							},
							type : 'json',
							data: requestData,
							callback: function(response){
								var responseType='error';
								if(response.success===true||response.success==='true'){
									var payment=response.payment;
									if(response.payment.accepted===true||response.payment.accepted==='true'){
										responseType='success'
									}else{
										responseType='denied'
									}
								}else{
									responseType='error';
								}
								PF.Pay.printResponse(responseType, response.message);
								PF.GA.processAuthorization({
										brandCode: PF.Cards.brandCode,
										amount: data.operation.amount,
										operationID: identifier+''+ data.operation.operationNumber,
										nameCommerce: identifier
									},
									true,
									(responseType=='success')
								)								
								setTimeout(function(){
									PF.Pay.running=false;
									afterPay(response);	
								},100)
								
							}
						})
				})
			}else{
				PF.Pay.running=false;
			}
			
		}		
		
		
	}
}