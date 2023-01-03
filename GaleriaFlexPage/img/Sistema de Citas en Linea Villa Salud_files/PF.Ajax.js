PF.Ajax={
	request: function(config){
		var url=config.url,
			data=config.data,
			headers=config.headers,
			type=config.type,
			method=config.method,
			callback=config.callback;
		
			var xhttp;
			if (window.XMLHttpRequest) {
				xhttp = new XMLHttpRequest();
			 } else {
				 xhttp = new ActiveXObject("Microsoft.XMLHTTP");
			}
			xhttp.onreadystatechange  = function() {
				if (this.readyState == 4 && this.status == 200) {
					if(type=='json'){
						var response= JSON.parse(PF.DOM.decodeUTF8(this.responseText));
						callback(response);
					}
				}
			};
			xhttp.open(method, url, true);
			if(headers){
				for(var headerName in headers){
					xhttp.setRequestHeader(headerName, headers[headerName]);
				}
			}
			if(type=='json'){
				xhttp.setRequestHeader('Content-Type', 'application/json');
			}
			var dataString=JSON.stringify(data);
			try{
				xhttp.send(dataString);
			}catch (e) {
				console.info({e:e});
				callback({
					success: false,
					messageCode : 'CONNECTION_ERROR',
					message: PF.Messages.getErrorMessage('connectionError')
				})
				
			}
	}
}
