PF.GA = {
	id: 'UA-101011912-1',
	alias : 'ALGPF',
	brands: {
		'VISA': 'VISA',
		'AMEX': 'American Express',
		'DINC': 'Diners Club',
		'MSCD': 'Mastercard'
	},
	init : function() {
		if (typeof ga === 'undefined'||ga===null) {
			(function(i, s, o, g, r, a, m) {
				i['GoogleAnalyticsObject'] = r;
				i[r] = i[r] || function() {
					(i[r].q = i[r].q || []).push(arguments)
				}, i[r].l = 1 * new Date();
				a = s.createElement(o), m = s.getElementsByTagName(o)[0];
				a.async = 1;
				a.src = g;
				m.parentNode.insertBefore(a, m)
			})(window, document, 'script', 'https://www.google-analytics.com/analytics.js','ga');
		}
		ga('create', PF.GA.id, 'auto',PF.GA.alias,{
			'siteSpeedSampleRate' : 100
		});
		ga(PF.GA.alias+'.require', 'ec');
		
		
	},
	processView:function(data){
		if(data.userID){
			ga(PF.GA.alias+'.set', 'userId', data.userID);	
		}
		if(data.currency&&data.currency.length>0){
			ga(PF.GA.alias+'.set', 'currencyCode', data.currency);
		}
		ga(PF.GA.alias+'.set', 'dimension1', data.typeDesign);
		ga(PF.GA.alias+'.set', 'dimension8', data.idCommerce);
		ga(PF.GA.alias+'.send', 'event','UserAction','Begin',data.idCommerce);
	},
	addImpression:function(data,callback){
		var brandCode=data.brandCode,
			brandDesc=PF.GA.brands[data.brandCode];
		if(brandDesc){
			var category='Default';
			var list=PF.GA.getProductList();
			var brand='Default';
			var price=data.amount;
			ga(PF.GA.alias+'.ec:addImpression', {
			  'id': brandCode,                   
			  'name': brandDesc,
			  'price': price,
			  'list': list
			});
			ga(PF.GA.alias+'.ec:setAction', 'detail',{
				'list': list
			});
			ga(PF.GA.alias+'.send', 'event', 'UserAction', 'Select', brandCode,{
				hitCallback:function(){
					if(callback){
						callback();
					}
				}
			});  
		}
	},
	getProductList:function(){
		return 'CARDS'; 
	},
	addProduct:function(data,callback){
		var brandCode=data.brandCode,
			brandDesc=PF.GA.brands[data.brandCode];
		if(brandDesc){
			var category='Default';
			var brand='Default';
			var price=data.amount;
			var list=PF.GA.getProductList();
			ga(PF.GA.alias+'.ec:addProduct', {
				'id': brandCode,                   
				'name': brandDesc,
				'price' :price,
				'quantity' : 1
			});
			ga(PF.GA.alias+'.ec:setAction', 'add',{
				'list':list
			});
			ga(PF.GA.alias+'.send', 'event', 'UserAction', 'Pay', brandCode,{
				hitCallback: function(){
					ga(PF.GA.alias+'.ec:setAction', 'checkout', {
						'step': 1,
						'id': data.operationID,
						'affiliation': data.nameCommerce,
						'revenue': data.amount,
						'list':list
					});	
					ga(PF.GA.alias+'.send', 'event', 'UserAction', 'Pay', brandCode,{
						hitCallback: function(){
							PF.GA.processPayment(data,callback);		
						}
					});
				}
			}); 
			
		}
	},
	processPayment:function(data,callback){
		var brandCode=data.brandCode,
			brandDesc=PF.GA.brands[data.brandCode];
		var list=PF.GA.getProductList();
		
		ga(PF.GA.alias+'.ec:setAction', 'checkout', {'step': 2, 'option': brandCode,'list':list});
		ga(PF.GA.alias+'.send', 'event', 'UserAction', 'Pay', brandCode,{
		    hitCallback: function() {
		    	if(callback){
	    			callback();	
		    	}
		    }
		});
	},
	processAuthentication:function(callback){
		
		ga(PF.GA.alias+'.ec:setAction', 'checkout', {'step': 3});
		ga(PF.GA.alias+'.send', 'event', 'UserAction', 'Authentication', {
			hitCallback: function() {
				if(callback){
					callback();	
				}
			}
		});
	},
	processAuthorization:function(data,isAuthenticationSkipped,isSuccessAuthorization){
		var process=function(){
			ga(PF.GA.alias+'.ec:setAction', 'checkout', {'step': 4});
			ga(PF.GA.alias+'.send', 'event', 'UserAction', 'Authorization', {
				hitCallback: function() {
					if(isSuccessAuthorization===true){
						PF.GA.processSuccessAuthorization(data);	
					}
					
				}
			});
		}
		if(isAuthenticationSkipped===true){
			PF.GA.processAuthentication(process);
		}else{
			process();
		}
	},
	processSuccessAuthorization:function(data){
		ga(PF.GA.alias+'.ec:setAction', 'checkout', {'step': 5});
		ga(PF.GA.alias+'.send', 'event', 'UserAction', 'Authorization',{
			hitCallback: function() {
				var brandCode=data.brandCode,
					brandDesc=PF.GA.brands[data.brandCode];
				if(brandDesc){
					var category='Default';
					var brand='Default';
					var price= data.amount;
					ga(PF.GA.alias+'.ec:addProduct', {
						'id': brandCode,                   
						'name': brandDesc,
						'price' :price,
						'quantity' : 1
					});
				}
				ga(PF.GA.alias+'.ec:setAction', 'purchase', {
					'id': data.operationID,
					'affiliation': data.nameCommerce,
					'revenue': data.amount
				});
				ga(PF.GA.alias+'.send', 'event', 'UserAction', 'Authorization');
			}
		});
	},
}
PF.GA.init();

