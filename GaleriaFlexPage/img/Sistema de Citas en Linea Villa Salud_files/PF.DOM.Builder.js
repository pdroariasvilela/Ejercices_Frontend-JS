PF.DOM.Builder={
	store:{},
	resolveListeners:function(element,listeners){
		if(listeners.load){
			element.onload=listeners.load;
		}
		if(listeners.click){
			element.onclick=listeners.click;
		}
	},
	resolveParameters:function(value,parameters){
		var finalValue=value;
		if (typeof value === 'string' || value instanceof String){
			if(value&&value.length>0){
				if(PF.DOM.isObject(parameters)){
					
					for (var parameterName in parameters) {
						var parameterValue=parameters[parameterName];
						var keyName='{'+parameterName+'}';
						while(PF.DOM.existInString(finalValue,keyName)){
							finalValue=finalValue.replace(keyName,parameterValue);	
						}
						
					}	
				}
			}
		}
		return finalValue;
	},
	createElement:function(config,parameters){
		var tagName=config.tag,
			styles=config.styles,
			cls=config.cls,
			id=config.id?PF.DOM.Builder.resolveParameters(config.id,parameters):config.id,
			name=config.name,
			children=config.children,
			text=config.text?PF.DOM.Builder.resolveParameters(config.text,parameters):config.text,
			listeners=config.listeners,
			attr=config.attr,
			elIdentifier=config.elIdentifier;
		var element=document.createElement(tagName);
		if(id){
			element.id=id;
		}
		if(cls){
			element.className=cls;
		}
		if(name){
			element.name=name;
		}
		if(styles){
			for(styleName in styles){
				element.style[styleName]=styles[styleName];
			}
			
		}
		if(children){
			for(var i=0;i<children.length;i++){
				var childConfig=children[i],
					childEl=PF.DOM.Builder.createElement(childConfig,parameters);
				if(childEl){
					element.appendChild(childEl);
				}
			}
		}else if(text){
			var textEl=document.createTextNode(text);
			element.appendChild(textEl);
		}
		if(attr){
			for(attrName in attr){
				var attrValue=attr[attrName];
				if(attrValue&&attrValue.trim().length>0){
					element.setAttribute(attrName,PF.DOM.Builder.resolveParameters(attrValue,parameters));	
				}
				
			}
		}
		if(listeners){
			PF.DOM.Builder.resolveListeners(element,listeners);
		}
		if(elIdentifier){
			PF.DOM.Builder.store[elIdentifier]=element;
		}
		return element;
	}
}
