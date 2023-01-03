PF.DOM={
	utf8Code:[
		{utfCode:'&aacute;',realValue:'%E1'},
		{utfCode:'&eacute;',realValue:'%E9'},
		{utfCode:'&iacute;',realValue:'%ED'},
		{utfCode:'&oacute;',realValue:'%F3'},
		{utfCode:'&uacute;',realValue:'%FA'},
		{utfCode:'&Aacute;',realValue:'%C1'},
		{utfCode:'&Eacute;',realValue:'%C9'},
		{utfCode:'&Iacute;',realValue:'%CD'},
		{utfCode:'&Oacute;',realValue:'%D3'},
		{utfCode:'&Uacute;',realValue:'%DA'}
    ],
	addEvent:function(element,eventName,fn){
		element.addEventListener(eventName,fn);
	},
	addClass:function(element,className){
		element.classList.add(className);
	},
	removeClass:function(element,className){
		element.classList.remove(className);
	},
	getAttr:function(element,attributeName){
		var attrValue=element.getAttribute(attributeName);
		return attrValue;
	},
	setAttr:function(element,attributeName,attributeValue){
		element.setAttribute(attributeName,attributeValue);
	},
	removeAttr:function(element,attributeName){
		element.removeAttribute(attributeName);
	},
	existInString:function(rawValue,find){
		if(rawValue.search(find)>=0){
			return true;
		}
		return false;
	},
	decodeUTF8:function(value){
		var finalValue=value;
		if (typeof value === 'string' || value instanceof String){
			var codes=PF.DOM.utf8Code;
			for (var i = 0; i<codes.length; i++) {
				var codeItem=codes[i];
				while(PF.DOM.existInString(finalValue,codeItem.utfCode)){
					finalValue=finalValue.replace(codeItem.utfCode,codeItem.realValue);
				}
			}
			
		}
		return unescape(finalValue);
	},
	isObject: function(val) {
	    return (typeof val === 'object')&&!Array.isArray(val);
	},
	mixJSON: function(source, overrides){
		var destination={};
		for (var attrName in source) {
			var sourceValue=source[attrName];
			var destValue=destination[attrName];
			if(PF.DOM.isObject(sourceValue)&&destValue){
				var finalDestValue=PF.DOM.mixJSON(destValue, sourceValue);
				destination[attrName] = finalDestValue;
			}else{
				destination[attrName] = sourceValue;	
			}
		}
		for (var attrName in overrides) {
			var sourceValue=overrides[attrName];
			var destValue=destination[attrName];
			if(PF.DOM.isObject(sourceValue)&&destValue){
				var finalDestValue=PF.DOM.mixJSON(destValue, sourceValue);
				destination[attrName] = finalDestValue;
			}else{
				destination[attrName] = sourceValue;	
			}
		}
		return destination;
	},
	each: function(array,callback){
		for(var i=0;i<array.length;i++){
			callback.call(this,i,array[i]);
		}
	},
	removeChildren: function(parentEl){
		while (parentEl.firstChild){
			parentEl.removeChild(parentEl.firstChild);
		}
	}
}
