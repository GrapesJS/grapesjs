
require(['bundle/config/require-config.js'], function() {
	
	require(['editor/main'],function (Grapes){
		return Grapes;
	});
	
	/*
	require(['startup/main'], function (Grapes){
		/*
		Grapes.run({
			storageType: 'local',
			remoteStorage: {
				urlStore	: 'http://test.localhost/wte/index.php',
				urlLoad		: 'http://test.localhost/wte/read.php',
				paramsStore	: {	type:'homeTemplate',},
				paramsLoad	: {	type:'homeTemplate',},
			},
			assetManager: {
				storageType			: 'local',
				storeOnChange		: true,
				storeAfterUpload	: true,
			},
			styleManager : {}, //sectors: [{ name: 'MainConfig', properties:[] }]
			defaultComponents: [	{ style: {'width':'500px', 'height': '35px', 'margin':'0 auto',}, },
			                    	{ style: {'width':'500px', 'height': '35px', 'margin':'0 auto',}, },
			                    	{ style: {'width':'500px', 'height': '35px', 'margin':'0 auto',}, },
			                    	{   style: {'width':'400px', 'height': '300px', 'margin':'0 auto', 'padding':'5px'}, 
			                    		components: [{ style: {'width':'130px','height': '30px','float':'left'}}, 
										             { style: {'width':'50px','height': '50px','float':'left'},},
										             { style: {'width':'80px','height': '80px','float':'left'},},
										             { style: {'width':'50px','height': '50px','float':'left'},},
										             { style: {'width':'80px','height': '70px','float':'left'},},
										             { style: {'width':'50px','height': '80px','float':'left'},},
										             { style: {'width':'80px','height': '50px','float':'left'},},
										             { style: {'width':'80px','height': '50px','float':'left'},},
										             { style: {'width':'50px','height': '50px','float':'left'},},
										             { style: {'width':'80px','height': '50px','float':'left'},},
										             { style: {'width':'80px','height': '50px','float':'left'},},
										             { style: {'width':'50px','height': '50px','float':'left'},},
										             { style: {'width':'80px','height': '50px','float':'left'},},
										             { style: {'width':'75px','height': '50px','clear':'both'}}]
			                    	},
			                    	{ 	style: {'width':'700px', 'height': '250px', 'margin':'0 auto'}, 
										components: [{ style: {'width':'100px','height': '30px','float':'left'}}, 
										             { style: {'width':'200px','height': '50px','float':'left'},},
										             { style: {'width':'150px','height': '150px','float':'left'},}]
			                    	
			                    	},
			                    	{ style: {'width':'500px', 'height': '150px', 'margin':'0 auto'}, }
			                    	/*
			                    	{	
			                    		css:{'width':'100%', 'background-color':'#372828'},
			                    		components:[{
			                    		            	css:{'width':'90%','max-width':'980px', 'min-height':'70px', 'margin':'0 auto'},
							                    		components: [ 
					     		            		             	{
					     		            		             		css:{'width':'50%','float':'left'},
					     		            		             		components: [
					     		            		             		             { editable: true, contents: 'myLogo', css:{ 'color':'#fff','font-size':'30px','padding-top':'20px','font-family':'Helvetica','font-weight':'100'} }
					     		            		             		             ],
					     		            		             	},
					     		            		             	{
					     		            		             		css:{'width':'50%','min-height':'70px','float':'left','font-family':'Helvetica','color':'#fff',},
					     		            		             		components: [{ contents: '{{ TOPMENU }}', css:{ 'padding-top':'35px','font-weight':'100','text-align':'right'} },],
					     		            		             	},
					     		            		             	{css:{'clear':'both'}},
					     		            		            ],
			                    					},],
			                    	},
			                    	{
			                    		css:{'width':'100%', 'background-color':'#e54b4b', 'font-family':'Helvetica'},
			                    		components:[
			                    		            	{ 
			                    		            		css:{'width':'90%','max-width':'980px','height':'500px', 'margin':'0 auto','text-align':'center',},//,'padding-top':'75px'
			                    		            		components: [
			                    		            		             	{	contents:'YOUR HOSTING SOLUTION',editable:true,
			                    		            		             		css:{ 'color':'#ffffff','font-size':'40px','font-weight':'700','text-align':'center','padding-top':'75px'}
			                    		            		             	},
			                    		            		             	{	contents:'Powerful hardware for you business right now',editable:true,
			                    		            		             		css:{ 'color':'#ffffff','font-size':'20px','font-weight':'100','text-align':'center','margin-top':'10px'}
			                    		            		             	},
			                    		            		             	 { attributes: {src:'./images/media/red-server-icon.png'}, tagName: 'img', css:{ 'display':'inline', 'margin':'70px auto','margin-left':'auto','margin-right':'auto'},}
			                    		            		             	//{css:{'width':'50%','min-height':'50px','float':'left'}},
			                    		            		             	//{css:{'width':'50%','min-height':'50px','float':'left'}},
			                    		            		            ],
			                    		            	},
			                    		            ],
			                    	},
			                    	{	
			                    		css:{'width':'100%','background-color':'#ffffff'},
			                    		components:[
		                    		            	{ 
		                    		            		css:{'width':'90%','max-width':'980px','height':'350px', 'margin':'0 auto','color':'#352828'},//,'padding-top':'75px'
		                    		            		components: [
		                    		            		             	{ 
		                    		            		             		css:{ 'margin-left':'1%','margin-right':'1%','width':'31.333%', 'float':'left','height':'100%','padding-left':'20px','padding-right':'20px'},
		                    		            		             		components: [ 
		                    		            		             		              {	
		                    		            		             		            	  css:{ 'width':'100px','height':'100px','margin':'0 auto', 'background-color':'#352828','border-radius':'50px','margin-top':'75px','text-align':'center'},
		                    		            		             		            	  components: [
		                    		            		             		            	               		{ attributes: {src:'./images/media/cloud-logo.png'}, tagName: 'img', css:{'padding-top':'15px'},}
		                    		            		             		            	               	],
		                    		            		             		              },
		                    		            		             		              {	editable:true, contents:'Cloud servers', css:{ 'font-size':'20px','text-align':'center','margin-top':'25px'}},
		                    		            		             		              {	editable:true, 
		                    		            		             		            	  contents:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.', 
		                    		            		             		            	  css:{ 'text-align':'center','margin-top':'20px'}},
		                    		            		             		            ],
		                    		            		             	},
		                    		            		             	{ 
		                    		            		             		css:{ 'margin-left':'1%','margin-right':'1%','width':'31.333%', 'float':'left','height':'100%','padding-left':'20px','padding-right':'20px'},
		                    		            		             		components: [ 
		                    		            		             		              {	
		                    		            		             		            	  css:{ 'width':'100px','height':'100px','margin':'0 auto', 'background-color':'#352828','border-radius':'50px','margin-top':'75px','text-align':'center'},
		                    		            		             		            	  components: [
		                    		            		             		            	               		{ attributes: {src:'./images/media/network-icon.png'}, tagName: 'img', css:{'width':'59px','padding-top':'21px'},}
		                    		            		             		            	               	],
		                    		            		             		              },
		                    		            		             		              {	editable:true, contents:'Big networks', css:{ 'font-size':'20px','text-align':'center','margin-top':'25px'}},
		                    		            		             		              {	editable:true, 
		                    		            		             		            	  contents:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.', 
		                    		            		             		            	  css:{ 'text-align':'center','margin-top':'20px'}},
		                    		            		             		            ],
		                    		            		             	},
		                    		            		             	{ 
		                    		            		             		css:{ 'margin-left':'1%','margin-right':'1%','width':'31.333%', 'float':'left','height':'100%','padding-left':'20px','padding-right':'20px'},
		                    		            		             		components: [ 
		                    		            		             		              {	
		                    		            		             		            	  css:{ 'width':'100px','height':'100px','margin':'0 auto', 'background-color':'#352828','border-radius':'50px','margin-top':'75px','text-align':'center'},
		                    		            		             		            	  components: [
		                    		            		             		            	               		{ attributes: {src:'./images/media/settings-icon.png'}, tagName: 'img', css:{'width':'59px','padding-top':'21px'},}
		                    		            		             		            	               	],
		                    		            		             		              },
		                    		            		             		              {	editable:true, contents:'High scalability', css:{ 'font-size':'20px','text-align':'center','margin-top':'25px'}},
		                    		            		             		              {	editable:true, 
		                    		            		             		            	  contents:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.', 
		                    		            		             		            	  css:{ 'text-align':'center','margin-top':'20px'}},
		                    		            		             		            ],
		                    		            		             	},
		                    		            		            ],
		                    		            	},
		                    		            ],
			                    	},**
			                    ],
		});//Initialize the application
		*
		$(window).unload(function() {
			console.log('unload test (save data before exit)');
		});
		window.onbeforeunload = function(e) {
			console.log('onbeforeunload test');
		   //return 'Please press the Logout button to logout.';
		};
	});
	*/
});