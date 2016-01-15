require(['bundle/config/require-config.js'], function() {
	
	require(['editor/main'],function (Grapes){
		var grapes	= new Grapes({
			storageType: 'local',
			remoteStorage: {
				urlStore	: 'http://test.localhost/wte/index.php',
				urlLoad		: 'http://test.localhost/wte/read.php',
				paramsStore	: {	type:'homeTemplate',},
				paramsLoad	: {	type:'homeTemplate',},
			},
			assetManager: {
				storageType			: '',
				storeOnChange		: true,
				storeAfterUpload	: true,
				assets				: [
					      				   { type: 'image', src : 'http://placehold.it/350x250/78c5d6/fff/image1.jpg', date: '2015-01-01',height:350, width:250},
					      				   { type: 'image', src : 'http://placehold.it/350x250/459ba8/fff/image2.jpg', date: '2015-02-01',height:350, width:250},
					      				   { type: 'image', src : 'http://placehold.it/350x250/79c267/fff/image3.jpg', date: '2015-02-01',height:350, width:250},
					      				   { type: 'image', src : 'http://placehold.it/350x250/c5d647/fff/image4.jpg', date: '2015-02-01',height:350, width:250},
					      				   { type: 'image', src : 'http://placehold.it/350x250/f28c33/fff/image5.jpg', date: '2015-02-01',height:350, width:250},
					      				   { type: 'image', src : 'http://placehold.it/350x250/e868a2/fff/image6.jpg', date: '2015-02-01',height:350, width:250},
					      				   { type: 'image', src : 'http://placehold.it/350x250/cc4360/fff/image7.jpg', date: '2015-02-01',height:350, width:250},
				      				   ]
			},
			styleManager : {},
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
			                    ],
		});
		
		grapes.render();
		
	});
});

