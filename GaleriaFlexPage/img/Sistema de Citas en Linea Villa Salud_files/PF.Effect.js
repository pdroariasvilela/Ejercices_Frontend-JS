PF.Effect={
	minimizedLabel:function(inputIdentifier,labelIdentifier){
		var inputEl=PF.DOM.Builder.store[inputIdentifier];
		var labelEl=PF.DOM.Builder.store[labelIdentifier];
		if(inputEl&&labelEl){
			PF.DOM.addEvent(inputEl, 'focus', function(){
				PF.DOM.addClass(labelEl, 'algpf-focused');
				var placeHolderValue=PF.DOM.getAttr(inputEl, 'alg-placeholder');
				if(placeHolderValue&&placeHolderValue.length>0){
					PF.DOM.setAttr(inputEl, 'placeholder',placeHolderValue);
				}
			})
			PF.DOM.addEvent(inputEl, 'blur', function(){
				if(inputEl.value.trim().length==0){
					PF.DOM.removeClass(labelEl, 'algpf-focused');
				}
				PF.DOM.removeAttr(inputEl,'placeholder');
			})
		}
		
	},
	errorToolTipEnabled:function(inputIdentifier){
		var inputEl=PF.DOM.Builder.store[inputIdentifier],
			parentEl=inputEl.parentElement;
		PF.DOM.setAttr(parentEl,'tooltip-error','false');
		PF.DOM.addEvent(inputEl, 'focus', function(){
			PF.DOM.addClass(parentEl,'algpf-tooltip-error-focus')
		})
		PF.DOM.addEvent(inputEl, 'blur', function(){
			PF.DOM.removeClass(parentEl,'algpf-tooltip-error-focus')
		})
	},
	errorToolTip:function(cfg){
		var errorMessage=cfg.errorMessage,
			errorMessageElement=cfg.errorMessageElement,
			inputEl=cfg.inputEl,
			parentEl=inputEl.parentElement;
		PF.DOM.setAttr(parentEl,'tooltip-error','false');
		if(errorMessage&&errorMessage.length>0){
			PF.DOM.setAttr(parentEl,'tooltip-error','true');
			var errorMessageText=document.createTextNode(errorMessage);
			errorMessageElement.appendChild(errorMessageText);	
		}
	},
	
	loadMask: function(containerEl, show){
		
		var offsetWidth=containerEl.offsetWidth,
			offsetHeight=containerEl.offsetHeight,
			tpl={
				tag :'div',
				cls: 'algpf-loadmask-container',
				elIdentifier:'loadMask-container',
				styles : {
					width : offsetWidth+'px',
					height : offsetHeight+'px'
				},
				children : [
		            {
		            	tag : 'div',
		            	cls: 'algpf-loadmask-background'
		            },
		            {
		            	tag : 'div',
		            	cls: 'algpf-loadmask-icon',
		            	children: [
		            	     {
		            	    	 tag : 'div',
		            	    	 cls : 'algpf-loading-wrapper',
		            	    	 children : [
	        	    	             {
	        	    	            	 tag : 'div',
	        	    	            	 cls : 'algpf-loading',
	        	    	            	 children : [
		            	    	             {
		            	    	            	 tag : 'div'
		            	    	             }
		    	    	             	]
	        	    	             }
		    	             	]
		            	    		 
		            	     }     
		            	]
		            }
	            ]
			}
		
		var el=PF.DOM.Builder.createElement(tpl);
		containerEl.insertBefore(el, containerEl.childNodes[0]);
	},
	/*arojas [se agrega planes y cuotas ] - 29/09/2018 - inicio*/
	removeloadMask :function(containerEl){
		while (containerEl.firstChild) {
			containerEl.removeChild(containerEl.firstChild);
		}		
	}
	/*arojas [se agrega planes y cuotas ] - 29/09/2018 - fin*/
}
