PF={
	baseURL: null,
	context: 'VPOS2',
	starterScriptEl:null,
	locale:{},
	currentLocale: '',
	requires:[
         'Cipher',
         'Messages',
         'Ajax',
	     'DOM',
	     'DOM.Builder',
         'Validator.Cards',
         'Cards',
         'GA',
         'Effect',
         'UI',
         'Init',
         'Pay',
         'PlanQuota'// arojas [se agrega planes y cuotas ] - 29/09/2018 
	],
	currentVersion :'1.0.0',
	/*arojas [se agrega planes y cuotas ] - 29/09/2018 - inicio*/
	log: function(message){
		console.info(message);
	},
	/*arojas [se agrega planes y cuotas ] - 29/09/2018 - fin*/
	loadScript:function(alias){
		var scriptURL=PF.baseURL+PF.context+'/js/PF/PF.'+alias+'.js',
			pfScript = document.createElement('script');
		pfScript.type = 'text/javascript';
		pfScript.src = scriptURL;
		pfScript.async = false;
		var pathValidator=alias.split('.');
			currentParent=PF;
		for (var j = 0; j < pathValidator.length; j++) {
			var pathName=pathValidator[j];
			if(!currentParent[pathName]){
				currentParent[pathName]={}
				currentParent=currentParent[pathName];
			}
		}
		document.head.appendChild(pfScript);
	},
	load: function(){
		if(PF.starterScriptEl==null){
			var d= document,
				requires= PF.requires,
				starterScriptEl= d.getElementById('PaymeFormScriptStarter'),
				src= starterScriptEl.src,
				link = d.createElement('a');
			link.setAttribute('href',src);
			var host= link.host,
				protocol= link.protocol,
				baseURL= protocol+'//'+host+'/';
			PF.baseURL= baseURL;
			PF.starterScriptEl=starterScriptEl;
			for(var i=0;i<requires.length;i++){
				var requireScript=requires[i];
				PF.loadScript(requireScript);
			}
		}
		
	}
}
PF.load();