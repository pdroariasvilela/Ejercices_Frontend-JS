PF.Messages={
	getMessage:function(key){
		var locale=PF.locale[PF.currentLocale],
			messages=locale?locale.messages:null,
			messageValue=messages?messages[key]:null,
			message=messageValue?(PF.DOM.decodeUTF8(messageValue)):('{'+PF.currentLocale+'.'+key+'}');
		return message;
	},
	getErrorMessage:function(key){
		var locale=PF.locale[PF.currentLocale],
			messages=locale?locale.errorMessages:null,
			messageValue=messages?messages[key]:null,
			message=messageValue?(PF.DOM.decodeUTF8(messageValue)):('{'+PF.currentLocale+'.'+key+'}');
		return message;
	}
}