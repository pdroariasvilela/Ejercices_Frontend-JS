PF.Cards={
	configuration: {},
	name:'',
	lastname:'',
	key:'',
	brandCode:'',
	buttonTemplate: {
		tag : 'div',
		cls : 'aglpf-button-pay',
		children : [
			{tag:'span',text :'{payText} '},
			{tag:'b',text :'{currency}'},
			{tag:'span',text :' '},
			{tag:'b',text :'{amount}'}
		]
	},
	
	maskCardNumber:function(cardNumber){
		var segments=cardNumber.replace(' ',''),
			lastNumber=segments.substring(segments.length-4);
		var maskedString='***'+lastNumber;
		return maskedString;
	},
	validateCardNumber:function(){
		var me = this;
		var inputCardNumber=PF.DOM.Builder.store['cardnumber-input'],
			cardNumberErrorMessage=PF.DOM.Builder.store['cardnumber-input-error-message'],
			inputContainer=inputCardNumber.parentElement
			valid=true;
		PF.DOM.removeClass(inputContainer, "algpf-error");
		while(cardNumberErrorMessage.firstChild){
			cardNumberErrorMessage.removeChild(cardNumberErrorMessage.firstChild);
		}
		var brands=PF.Cards.brands;
		var cardNumberContainer=PF.DOM.Builder.store['card-container'];
		if(PF.DOM.getAttr(cardNumberContainer,'edit-mode')=='true'){
			var result=PF.Validator.Cards.validateCard({accept: brands, cardValue: inputCardNumber.value})
			PF.Cards.cleanBrandIcon();
			PF.Cards.resolvePosibleBrandIcon(result);
			if((result.card_type&&result.card_type.name)&&(result.valid&&result.luhn_valid&&result.length_valid)){
				var cardNumber=inputCardNumber.value;
				var maskedString=PF.Cards.maskCardNumber(cardNumber);
				/*arojas [se agrega planes y cuotas] 29/09/2018 - inicio*/
				var bin=cardNumber.replace(new RegExp(' ', 'g'),'').substring(0,6);
				/*arojas [se agrega planes y cuotas] 29/09/2018 - fin*/
				var crypt = new JSEncrypt();
				var pubkey = PF.Cards.key;
				crypt.setPublicKey(pubkey);
				var cryptoValue=crypt.encrypt(cardNumber.replace(new RegExp(' ', 'g'),''));
				PF.Cards.identifierValue=cryptoValue;
				inputCardNumber.value='*******';
				var cardNumberDisplay=PF.DOM.Builder.store['cardnumber-display'];
				while(cardNumberDisplay.firstChild){
					cardNumberDisplay.removeChild(cardNumberDisplay.firstChild);
				}
				var maskedEl=document.createTextNode(maskedString);
				cardNumberDisplay.appendChild(maskedEl);
				var cardNumberContainer=PF.DOM.Builder.store['card-container'];
				PF.DOM.setAttr(cardNumberContainer,'edit-mode','false');
				PF.Cards.brandCode=result.card_type.code;
				var data=PF.Cards.configuration.data,
					operation=data.operation,
					amount=operation.amount;
				/*arojas [se agrega planes y cuotas] 29/09/2018 - inicio*/
				PF.Cards.refreshPlanQuota(bin);
				/*arojas [se agrega planes y cuotas] 29/09/2018 - fin*/
				PF.GA.addImpression({
					brandCode : PF.Cards.brandCode,
					amount: amount
				})
				
			}else{
				valid=false;
				var errorMessage=PF.Messages.getErrorMessage('invalidCardNumber');
				PF.DOM.addClass(inputContainer, "algpf-error");
				PF.Effect.errorToolTip({
					errorMessage:errorMessage,
					errorMessageElement: cardNumberErrorMessage,
					inputEl: inputCardNumber
				})
				
				
			}
		}
		return valid;
	},
	
	formatExpiryDate : function(value) {
		var finalValue=value.replace(new RegExp('/', 'g'),'');
		if(finalValue.length>2){
			finalValue=finalValue.substring(0,2)+'/'+finalValue.substring(2,4);	
		}
		
		return finalValue;
	},
	formatCardNumber : function(cardNumber, cardType) {
		var numAppendedChars = 0;
		var formattedNumber = '';
		if (!cardType) {
			return cardNumber;
		}
		var cardFormatString = cardType.format;
		cardNumber=cardNumber.replace(new RegExp(' ', 'g'),'');
		for(var i = 0; i < cardNumber.length; i++) {
			var cardFormatIndex = i + numAppendedChars;
			if (!cardFormatString || cardFormatIndex >= cardFormatString.length) {
				return cardNumber;
			}
			
			if (cardFormatString.charAt(cardFormatIndex) !== 'x') {
				numAppendedChars++;
				formattedNumber += cardFormatString.charAt(cardFormatIndex) + cardNumber.charAt(i);
			} else {
				formattedNumber += cardNumber.charAt(i);
			}
		}
		
		return formattedNumber;
	},
	panelTemplate: {
		tag:'div',
		cls:'algpf-panel-wrapper',
		elIdentifier:'algpf-panel-wrapper',
		children : [
			{
				tag:'div',
				cls : 'algpf-title',
				text :'{titleText}'
			},
            {
            	tag:'div',
            	cls:'algpf-input-wrapper',
            	elIdentifier:'card-container',
            	attr:{
            		'edit-mode':'true'
            	},
            	children: [
    	           {
    	        	   tag:'div',
    	        	   id:'algpf-cardimages-{counter}',
    	        	   elIdentifier:'card-images',
    	        	   cls:'algpf-cardimages'
    	           },
    	           {
    	        	   tag:'div',
    	        	   elIdentifier:'edit-cardnumber-button',
    	        	   cls:'algpf-edit-button'
    	           },
    	           {
					   tag : 'div',
					   cls : 'algpf-error-message',
					   elIdentifier:'cardnumber-input-error-message'
				   },
    	           {
	        	   		tag:'label',
	        	   		attr: {
    	        	          'for': 'algpf-cardnumber-input-{counter}'
    	           		},
    	           		elIdentifier:'cardnumber-input-label',
    	           		text: '{cardNumberText}'
    	           },
    	           {
    	        	   tag:'input',
    	        	   id:'algpf-cardnumber-input-{counter}',
    	        	   elIdentifier:'cardnumber-input',
    	        	   cls:'algpf-input',
    	        	   attr: {
    	        		   'type': 'tel',
    	        		   'maxlength':'19'
    	        	   }
    	           },
    	           {
    	        	   tag:'div',
    	        	   elIdentifier:'cardnumber-display',
    	        	   cls:'algpf-input display'
    	           }
            	]
            },
            {
            	tag:'div',
            	cls:'algpf-input-wrapper  algpf-col-6',
            	children: [
    	           {
    	        	   tag:'label',
    	        	   attr: {
    	        		   'for': 'algpf-expirydate-input-{counter}'
    	        	   },
    	        	   elIdentifier:'expirydate-input-label',
   	           		   text: '{expiryDateText}'
    	           },
    	           {
					   tag : 'div',
					   cls : 'algpf-error-message',
					   elIdentifier:'expirydate-input-error-message'
				   },
    	           {
    	        	   tag:'input',
    	        	   cls:'algpf-input',
    	        	   elIdentifier:'expirydate-input',
    	        	   id:'algpf-expirydate-input-{counter}',
    	        	   attr: {
    	        		   'type': 'tel',
    	        		   'alg-placeholder' : 'MM/AA',
    	        		   'alg-mask':'00/00',
    	        		   'maxlength':'5'
    	        	   }
    	           }
	           ]
            },
            {
            	tag:'div',
            	cls:'algpf-input-wrapper algpf-col-6',
            	children: [
    	           {
    	        	   tag:'label',
    	        	   attr: {
    	        		   'for': 'algpf-securitycode-input-{counter}'
    	        	   },
    	        	   elIdentifier:'securitycode-input-label',
   	           		   text: '{securityCodeText}'
    	           },
				   {
					   tag : 'div',
					   cls: 'algpf-image-info',
					   children : [
							{
								tag:'img',
								attr: {
									src : PF.baseURL+PF.context+'/images/PF/info-icon.png'
								}
							},
							{
								tag : 'div',
								cls : 'algpf-image-info-content',
								text : '{securityCodeInfoText}'
							}
					   ]
				   },
				   {
					   tag : 'div',
					   cls : 'algpf-error-message',
					   elIdentifier:'securitycode-input-error-message'
				   },
    	           {
    	        	   tag:'input',
    	        	   cls:'algpf-input',
    	        	   elIdentifier:'securitycode-input',
    	        	   id:'algpf-securitycode-input-{counter}',
    	        	   attr: {
    	        		   'type': 'tel',
    	        		   'maxlength':'4'
    	        	   }
    	           }
	           ]
            },
            // arojas [se agrega planes y cuotas] 29/09/2018 - inicio
            {
				tag : 'div',
				cls: 'algpf-planquota-container',
				elIdentifier : 'planquota-container'
			},
			// arojas [se agrega planes y cuotas] 29/09/2018 - fin
            {
            	tag:'div',
            	elIdentifier:'customerfullname-container',
            	cls : 'algpf-editor-container',
            	attr:{
            		'edit-mode':'false'
            	},
            	children: [
				   {
					   tag : 'div',
					   cls:'algpf-input-wrapper only-on-display',
					   children : [
							{
								   tag:'label',
								   cls : 'algpf-focused',
								   attr: {
									   'for': 'algpf-customename-input-{counter}'
								   },
								   elIdentifier:'customername-input-label',
								   text: '{customerNameText}'
							},
							{
								   tag:'div',
								   cls:'algpf-input display',
								   elIdentifier:'customername-display',
								   text : '{customerFullNameValue}'
							}
		               ]
				   },    
    	           
    	           
    	           {
    	        	   tag : 'div',
    	        	   cls:'algpf-input-wrapper algpf-col-6 only-on-edit',
					   children : [
			               {
		    	        	   tag:'label',
		    	        	   cls : 'algpf-focused',
		    	        	   attr: {
		    	        		   'for': 'algpf-customename-input-{counter}'
		    	        	   },
		    	        	   elIdentifier:'customername-input-label',
		    	        	   text: '{customerNameText}'
		    	           },
		    	           {
							   tag : 'div',
							   cls : 'algpf-error-message',
							   elIdentifier:'customername-input-error-message'
						   },
		    	           {
		    	        	   tag:'input',
		    	        	   cls:'algpf-input only-on-edit',
		    	        	   elIdentifier:'customername-input',
		    	        	   id:'algpf-customername-input-{counter}'
		    	           }
		               ]
    	        	   
    	           },
    	           {
    	        	   tag : 'div',
    	        	   cls:'algpf-input-wrapper algpf-col-6 only-on-edit',
					   children : [
			               {
		    	        	   tag:'label',
		    	        	   cls : 'algpf-focused ',
		    	        	   attr: {
		    	        		   'for': 'algpf-customerlastname-input-{counter}'
		    	        	   },
		    	        	   elIdentifier:'customerlastname-input-label',
		    	        	   text: '{customerLastNameText}'
		    	           },
		    	           {
							   tag : 'div',
							   cls : 'algpf-error-message',
							   elIdentifier:'customerlastname-input-error-message'
						   },
		    	           {
		    	        	   tag:'input',
		    	        	   cls:'algpf-input only-on-edit',
		    	        	   elIdentifier:'customerlastname-input',
		    	        	   id:'algpf-customerlastname-input-{counter}'
		    	           }
					   ]
    	        		   
    	           }
	           ]
            },
            {
            	tag :'div',
            	elIdentifier:'button-pay'
            },
            {
            	tag : 'div',
            	cls: 'algpf-logopayme',
            	children:[
    	            {
    	            	tag:'img',
    	            	attr:{
    	            		src: PF.baseURL+PF.context+'/images/PF/powered_by_payme.png'
    	            	}
    	            }
    	        ]
            }
    	]
	},
	cleanBrandIcon:function(){
		var cardImageItems=document.querySelectorAll(".algpf-cardimages .algpf-card-item-image");
		for (var i = 0; i < cardImageItems.length; i++) {
			var cardImageItem=cardImageItems[i];
			cardImageItem.classList.remove('active');
			cardImageItem.classList.remove('valid');
		}
	},
	resolvePosibleBrandIcon:function(result){
		if(result.possible_card_type&&result.possible_card_type.length>0){
			for(var i=0;i<result.possible_card_type.length;i++){
				var possibleCardItem=result.possible_card_type[i];
				var cardImageActiveItems=document.querySelectorAll('.algpf-cardimages .algpf-card-item-image[data-brand='+possibleCardItem+']');
				for(var j=0;j<cardImageActiveItems.length;j++){	
					var cardImageActiveItem=cardImageActiveItems[j];
					cardImageActiveItem.classList.add('active');
				}
			}
		}else if(result.card_type&&result.card_type.code){
			var cardImageActiveItems=document.querySelectorAll('.algpf-cardimages .algpf-card-item-image[data-brand='+result.card_type.code+']');
			for(var j=0;j<cardImageActiveItems.length;j++){	
				var cardImageActiveItem=cardImageActiveItems[j];
				cardImageActiveItem.classList.add('active');
			}
		}
	},
	build: function(cfg){
		var cssId = 'algpf-css',
			data=cfg.data,
			operation=data.operation,
			customer=data.customer,
			fullName=(customer.name!=null?customer.name:'')+' '+(customer.lastname!=null?customer.lastname:'');
		PF.Cards.name=customer.name;
		
		PF.Cards.lastname=customer.lastname;
		PF.Cards.key=cfg.settings.key;
		PF.Cards.brands=cfg.settings.brands;
		if (!document.getElementById(cssId))
		{
		    var head  = document.getElementsByTagName('head')[0];
		    var link  = document.createElement('link');
		    link.id   = cssId;
		    link.rel  = 'stylesheet';
		    link.type = 'text/css';
		    link.href = PF.baseURL+PF.context+'/css/PF/cards-theme.css';
		    link.media = 'all';
		    head.appendChild(link);
		}
		var el=PF.DOM.Builder.createElement(PF.Cards.panelTemplate,{
			counter: '1',
			titleText: PF.Messages.getMessage('defaultTitle'),
			cardNumberText: PF.Messages.getMessage('cardNumberLabel'),
			expiryDateText: PF.Messages.getMessage('expiryDateLabel'),
			securityCodeText: PF.Messages.getMessage('securityCodeLabel'),
			securityCodeInfoText: PF.Messages.getMessage('securityCodeInfo'),
			customerNameText: PF.Messages.getMessage('customerNameLabel'),
			customerLastNameText: PF.Messages.getMessage('customerLastnameLabel'),
			customerFullNameValue: PF.DOM.decodeUTF8(fullName)
		});
		
		PF.Effect.minimizedLabel('cardnumber-input', 'cardnumber-input-label')
		PF.Effect.minimizedLabel('expirydate-input', 'expirydate-input-label')
		PF.Effect.minimizedLabel('securitycode-input', 'securitycode-input-label')
		PF.Effect.minimizedLabel('customername-input', 'customername-input-label')
		PF.Effect.minimizedLabel('customerlastname-input', 'customerlastname-input-label')
		PF.Effect.errorToolTipEnabled('cardnumber-input');
		PF.Effect.errorToolTipEnabled('expirydate-input');
		PF.Effect.errorToolTipEnabled('securitycode-input');
		PF.Effect.errorToolTipEnabled('customername-input');
		PF.Effect.errorToolTipEnabled('customerlastname-input');
		var cardImages=PF.DOM.Builder.store['card-images'];
		var cardNumberInput=PF.DOM.Builder.store['cardnumber-input'];
		var expiryDateInput=PF.DOM.Builder.store['expirydate-input'];
		var securityCodeInput=PF.DOM.Builder.store['securitycode-input'];
		var nameInput=PF.DOM.Builder.store['customername-input'];
		var lastnameInput=PF.DOM.Builder.store['customerlastname-input'];
		var cardContainerEl=PF.DOM.Builder.store['card-container'];
		
		var brands=cfg.settings.brands;
		for(var i=0; i<brands.length;i++){
			var brandItem=brands[i];
			var cardItem=PF.DOM.Builder.createElement({
				tag: 'div',
				attr: {
					'data-brand' : brandItem
				},
				cls : 'algpf-card-item-image active'
			});
			cardImages.appendChild(cardItem);
		}
		if(cfg.feature.buttonPay){
			var buttonPayContainerEl=PF.DOM.Builder.store['button-pay'];
			var buttonPayEl=PF.DOM.Builder.createElement(PF.Cards.buttonTemplate,{
				counter: '1',
				payText: PF.Messages.getMessage('payButton'),
				currency: PF.DOM.decodeUTF8(operation.currency.symbol),
				amount: PF.DOM.decodeUTF8(operation.amount)
			});
			buttonPayContainerEl.appendChild(buttonPayEl);
			PF.DOM.addEvent(buttonPayContainerEl, 'click', function(){
				PF.Pay.execute();
			});
			buttonPayContainerEl
		}
		cardNumberInput.addEventListener('blur',function(event){
			PF.Cards.validateCardNumber();
			
		})
		cardNumberInput.addEventListener('keypress',function(event){
			if(event.which == 8 || event.which == 46 || event.which == 37 || event.which == 39){
				return true;
			}
			if(event.which >= 48 && event.which <= 57){
				return true;
			}
			event.preventDefault()
		})
		securityCodeInput.addEventListener('keypress',function(event){
			if(event.which == 8 || event.which == 46 || event.which == 37 || event.which == 39){
				return true;
			}
			if(event.which >= 48 && event.which <= 57){
				return true;
			}
			event.preventDefault()
		})
		expiryDateInput.addEventListener('keyup',function(event){
			var currentValue=expiryDateInput.value;
			var newValue=PF.Cards.formatExpiryDate(expiryDateInput.value);
			if(currentValue!=newValue){
				var input=expiryDateInput,
					currentSelectionStart=input.selectionStart,
					newLength=newValue.length,
					newStartValue=currentValue.substring(0,currentSelectionStart).replace(new RegExp('/', 'g'),'');
				var spacesCount=0;
				for(var i=0;i<newLength;i++){
					var currentChar=newValue.charAt(i);
					if((i-spacesCount)>=newStartValue.length){
						break;
					}
					if(currentChar=='/'){
						spacesCount++;
					}
				}
				var newSelectionStart=newStartValue.length+spacesCount;
				
				expiryDateInput.value=newValue;
				setTimeout(function(){
					expiryDateInput.setSelectionRange(newSelectionStart,newSelectionStart);
				},1)
			}
			
		})
		expiryDateInput.addEventListener('keypress',function(event){
			if(event.which == 8 || event.which == 46 || event.which == 37 || event.which == 39){
				return true;
			}
			if(event.which >= 48 && event.which <= 57){
				return true;
			}
			event.preventDefault()
		})
		cardNumberInput.addEventListener('keypress',function(event){
			if(event.which == 8 || event.which == 46 || event.which == 37 || event.which == 39){
				return true;
			}
			if(event.which >= 48 && event.which <= 57){
				return true;
			}
			event.preventDefault()
		})
		
		cardNumberInput.addEventListener('keyup',function(){
			var result=PF.Validator.Cards.validateCard({
				accept: brands,
				cardValue: cardNumberInput.value
			})
			PF.Cards.cleanBrandIcon();
			PF.Cards.resolvePosibleBrandIcon(result);
			
			if(PF.DOM.getAttr(cardContainerEl, 'edit-mode')=='true'){
				if(result.card_type&&result.card_type.code){
					
					var currentValue=cardNumberInput.value,
						input=cardNumberInput,
						newValue=PF.Cards.formatCardNumber(currentValue,result.card_type);
					if(newValue!=currentValue){
						var currentSelectionStart=input.selectionStart,
							newLength=newValue.length,
							newStartValue=currentValue.substring(0,currentSelectionStart).replace(new RegExp(' ', 'g'),'');
						var spacesCount=0;
						for(var i=0;i<newLength;i++){
							var currentChar=newValue.charAt(i);
							if((i-spacesCount)>=newStartValue.length){
								break;
							}
							if(currentChar==' '){
								spacesCount++;
							}
						}
						var newSelectionStart=newStartValue.length+spacesCount;
						cardNumberInput.value=newValue;
						setTimeout(function(){
							cardNumberInput.setSelectionRange(newSelectionStart,newSelectionStart);
						},1)
					}
				}
			}
		});
		var editButtonEl=PF.DOM.Builder.store['edit-cardnumber-button'];
		var customerNameEl=PF.DOM.Builder.store['customername-display'];
		var customerFullnameContainerEl=PF.DOM.Builder.store['customerfullname-container'];
		nameInput.value=PF.Cards.name;
		lastnameInput.value=PF.Cards.lastname;
		PF.DOM.addEvent(customerNameEl, "click", function(){
			PF.Cards.initEditNames(nameInput);
		})
		var unselectedInputsName=function(){
			setTimeout(function(){
				var activeEl=document.activeElement;
				if(activeEl){
					if(!(activeEl.id ==nameInput.id || activeEl.id==lastnameInput.id)){
						if(PF.Cards.validateNames(true)){
							PF.Cards.name=nameInput.value;
							PF.Cards.lastname=lastnameInput.value;
							var fullname=PF.Cards.name+' '+PF.Cards.lastname;
							
							while(customerNameEl.firstChild){
								customerNameEl.removeChild(customerNameEl.firstChild);
							}
							var fullnameEl=document.createTextNode(fullname);
							customerNameEl.appendChild(fullnameEl);
							PF.DOM.setAttr(customerFullnameContainerEl, 'edit-mode', 'false');
						}
					}	
				}
			},200);
		}
		PF.DOM.addEvent(nameInput, 'blur',unselectedInputsName);
		PF.DOM.addEvent(lastnameInput, 'blur',unselectedInputsName);
		
		PF.DOM.addEvent(editButtonEl, "click", function(){
			var me = this;
			PF.Cards.brandCode='';
			cardNumberInput.value='';
			PF.Cards.identifierValue='';
			var result=PF.Validator.Cards.validateCard({
				accept: brands,
				cardValue: cardNumberInput.value
			})
			PF.Cards.cleanBrandIcon();
			PF.Cards.resolvePosibleBrandIcon(result);
			PF.DOM.setAttr(cardContainerEl, 'edit-mode', 'true');
			cardNumberInput.focus();
			
			/*arojas [se agrega logica para planes y cuotas] 29/09/2018 - inicio*/
			PF.Cards.clearPlanQuota();
			/*arojas [se agrega logica para planes y cuotas] 29/09/2018 - fin*/
			
		})
		return el;
	},
	initEditNames:function(nextFocusEl){
		var customerFullnameContainerEl=PF.DOM.Builder.store['customerfullname-container'];
		var nameInput=PF.DOM.Builder.store['customername-input'];
		var lastnameInput=PF.DOM.Builder.store['customerlastname-input'];
		PF.DOM.setAttr(customerFullnameContainerEl, 'edit-mode', 'true');
		nameInput.value=PF.Cards.name;
		lastnameInput.value=PF.Cards.lastname;
		if(nextFocusEl){
			nextFocusEl.focus();	
		}
	},
	validateSecurityCode: function(){
		var isAmex=PF.Cards.brandCode=='AMEX'?true:false,
			securityCodeInput=PF.DOM.Builder.store['securitycode-input'],
			securityCodeErrorMessage=PF.DOM.Builder.store['securitycode-input-error-message'],
			securityCodeInputContainer=securityCodeInput.parentElement,
			securityCodeValue=securityCodeInput.value,
			valid=true,
			errorMessage='';
		while(securityCodeErrorMessage.firstChild){
			securityCodeErrorMessage.removeChild(securityCodeErrorMessage.firstChild);
		}
		
		PF.DOM.removeClass(securityCodeInputContainer, "algpf-error");
		var regNumber = /^\d+$/;
		
		if(regNumber.test(securityCodeValue)){
			if(isAmex){
	    		if(securityCodeValue.length != 4){
	    			valid=false;
	    			errorMessage=PF.Messages.getErrorMessage('securtyCode4Digits');
	    			PF.DOM.addClass(securityCodeInputContainer, "algpf-error");
	    		}
	    	}else{
	    		if(securityCodeValue.length!=3){
	    			valid=false;
	    			errorMessage=PF.Messages.getErrorMessage('securtyCode3Digits');
	    			PF.DOM.addClass(securityCodeInputContainer, "algpf-error");
	    		}
	    	}
		}else{
			valid=false;
			errorMessage=PF.Messages.getErrorMessage('securtyCodeInvalidFormat');
			PF.DOM.addClass(securityCodeInputContainer, "algpf-error");
		}
		
		if(!valid){
			PF.Effect.errorToolTip({
				errorMessage:errorMessage,
				errorMessageElement: securityCodeErrorMessage,
				inputEl: securityCodeInput
			})
		}
		return valid;
	},
	validateExpiryDate: function(){
		
		var valid=true,
			errorMessage='',
			expiryDateInput=PF.DOM.Builder.store['expirydate-input'],
			expiryDateErrorMessage=PF.DOM.Builder.store['expirydate-input-error-message'],
			expiryDateInputContainer=expiryDateInput.parentElement,
			expiryDateValue=expiryDateInput.value;
		while(expiryDateErrorMessage.firstChild){
			expiryDateErrorMessage.removeChild(expiryDateErrorMessage.firstChild);
		}
		PF.DOM.removeClass(expiryDateInputContainer, "algpf-error");
		expiryDateValue=expiryDateValue.replace(new RegExp('/', 'g'),'');
		var regNumber = /^\d+$/;
		if(expiryDateValue.length==4&&regNumber.test(expiryDateValue)){
			var selectedMonth=expiryDateValue.substring(0,2),
				selectedYear='20'+expiryDateValue.substring(2,4),
				currentDate=new Date(),
				currentMonth=currentDate.getMonth()+1,
				currenrYear= currentDate.getFullYear(),
				currentMaxNumber=currenrYear*100+currentMonth*1,
				selectedNumber=selectedYear*100+selectedMonth*1;
			if((selectedMonth*1)<1||(selectedMonth*1)>12){
				errorMessage=PF.Messages.getErrorMessage('expiryDateInvalidMonth');
				PF.DOM.addClass(expiryDateInputContainer, "algpf-error");
				valid=false;
			}else{
				if(selectedNumber<currentMaxNumber){
					errorMessage=PF.Messages.getErrorMessage('expiryDateMinorToday');
					PF.DOM.addClass(expiryDateInputContainer, "algpf-error");
					valid=false;
				}
			}
		}else{
			errorMessage=PF.Messages.getErrorMessage('expiryDateInvalidFormat');
			PF.DOM.addClass(expiryDateInputContainer, "algpf-error");
			valid=false;
		}
		if(!valid){
			PF.Effect.errorToolTip({
				errorMessage:errorMessage,
				errorMessageElement: expiryDateErrorMessage,
				inputEl: expiryDateInput
			})
		}
		return valid;
	},
	validateNames: function(editing){

		var valid=true,
			errorMessageName='',
			errorMessageLastname='',
			nameInput=PF.DOM.Builder.store["customername-input"],
			nameErrorMessage=PF.DOM.Builder.store['customername-input-error-message'],
			lastnameInput=PF.DOM.Builder.store["customerlastname-input"];
			lastnameErrorMessage=PF.DOM.Builder.store['customerlastname-input-error-message'],
			nameInputContainer=nameInput.parentElement,
			lastnameInputContainer=lastnameInput.parentElement;
		while(nameErrorMessage.firstChild){
			nameErrorMessage.removeChild(nameErrorMessage.firstChild);
		}
		while(lastnameErrorMessage.firstChild){
			lastnameErrorMessage.removeChild(lastnameErrorMessage.firstChild);
		}
		PF.DOM.removeClass(nameInputContainer, "algpf-error");
		PF.DOM.removeClass(lastnameInputContainer, "algpf-error");
		
		var name=nameInput.value;
		var lastName=lastnameInput.value;
		var customerFullnameContainerEl=PF.DOM.Builder.store['customerfullname-container'];
		var currentEditing=editing?editing:(PF.DOM.getAttr(customerFullnameContainerEl, 'edit-mode')=='true');
		
		var validatorRegExp=/^[a-zA-Z \u00e1\u00e9\u00ed\u00F3\u00FA\u00F1\u00C1\u00C9\u00CD\u00D3\u00DA\u00D1]+$/;
		
		if(name.length<2 ){
			if(currentEditing===false){
				PF.Cards.initEditNames();	
				currentEditing=true;
			}
			PF.DOM.addClass(nameInputContainer, "algpf-error");
			valid=false;
			errorMessageName=PF.Messages.getErrorMessage('nameMinimumLength');
			PF.Effect.errorToolTip({
				errorMessage:errorMessageName,
				errorMessageElement: nameErrorMessage,
				inputEl: nameInput
			})
		}
		if(lastName.length<=0){
			if(currentEditing===false){
				PF.DOM.Cards.initEditNames();	
				currentEditing=true;
			}
			PF.DOM.addClass(lastnameInputContainer, "algpf-error");
			valid=false;
			errorMessageLastname=PF.Messages.getErrorMessage('lastnameNotEmpty');
			PF.Effect.errorToolTip({
				errorMessage:errorMessageLastname,
				errorMessageElement: lastnameErrorMessage,
				inputEl: lastnameInput
			})
		}
		
		return valid;
	},
	isValidForm:function(){
		var valid=true;
		var enableQuota = PF.PlanQuota.enable;	
		
		if(!PF.Cards.validateCardNumber()){
			valid=false;
		}
		/*arojas [se agrega validacion para planes y cuotas] 29/09/2018 - inicio*/
		if(enableQuota && PF.PlanQuota.isBuildPlan){
			  if(!this.validatePlan()){				
				valid = false;
			  }
		}
		/*arojas [se agrega validacion para planes y cuotas] 29/09/2018 - fin*/
		
		if(!PF.Cards.validateExpiryDate()){
			valid=false;
		}
		if(!PF.Cards.validateSecurityCode()){
			valid=false;
		}
		if(!PF.Cards.validateNames()){
			valid=false;
		}
		return valid;
	},
	getPaymentData:function(){
		var expiryDateInput=PF.DOM.Builder.store['expirydate-input'],
			expiryDateValue=expiryDateInput.value;
		var securityCodeInput=PF.DOM.Builder.store['securitycode-input'],
			securityCodeValue=securityCodeInput.value;
		
		var planField = PF.DOM.Builder.store['plan-input'],
			planValue=planField?planField.value:null;
		var quotaField = PF.DOM.Builder.store['quota-input'],
			quotaVlue=quotaField?quotaField.value:null;
		
		var crypt = new JSEncrypt();
		var pubkey = PF.Cards.key;
		crypt.setPublicKey(pubkey);
		
		var expiryDate=crypt.encrypt(expiryDateValue.replace('/',''));
		var securityCode=crypt.encrypt(securityCodeValue);
		var data={
			cardNumber: PF.Cards.identifierValue,
			expiryDate:expiryDate,
			securityCode:securityCode,
			name: PF.Cards.name,
			lastname: PF.Cards.lastname,
			plan: planValue,
			quota: quotaVlue
		};
		return data;
	},
	render: function(cfg,el){
		cfg.listeners.beforeRender();
		var containerEl=document.getElementById(cfg.containerID);
		var wrapperPanelItems=document.querySelectorAll(".algpf-panel-wrapper");
		if(wrapperPanelItems){
			for (var i = 0; i < wrapperPanelItems.length; i++) {
				var wrapperPanel=wrapperPanelItems[i];
				var parentWraper=wrapperPanel.parentElement;
				while(parentWraper.firstChild){
					parentWraper.removeChild(parentWraper.firstChild);
				}		
			}
		}
		containerEl.appendChild(el);
		
		cfg.listeners.afterRender();
		containerEl.scrollIntoView(true)
	},
	
	/*arojas [se agrega para planes y cuotas] 29/09/2018  inicio*/
	setPlanQuota: function(planQuota){
		var me = this;
		me.planQuota = planQuota;
	},
	getPlanQuota: function(){
		var me = this;
		return me.planQuota;
	},
	clearPlanQuota:function(){
		var me=this;
		me.refreshPlanQuota('');
	},
	refreshPlanQuota:function(bin){
		if(PF.PlanQuota){
			 PF.PlanQuota.refresh(bin);
		}			
	},
	validatePlan:function(){
		var isValid=false;
		if(PF.PlanQuota.isBuildPlan){
		   	isValid=PF.PlanQuota.isValid();				
		}			
		return isValid;
	}
	/*arojas [se agrega para planes y cuotas] 29/09/2018  fin*/
}