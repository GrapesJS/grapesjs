require(['../src/config/require-config.js', 'config/config.js'], function() {

	require(['chai',
	         'specs/main.js',
	         'specs/asset_manager/main.js',
	         'specs/asset_manager/model/Asset.js',
	     ], function(chai)
	     {
				var should 	= chai.should(),
						expect 	= chai.expect;

	     	mocha.run();
	     });
});