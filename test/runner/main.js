require(['../src/config/require-config.js', 'config/config.js'], function() {

	require(['chai',
					 'sinon',
	         'specs/main.js',
	         'specs/asset_manager/main.js',
	         'specs/asset_manager/model/Asset.js',
	         'specs/asset_manager/model/AssetImage.js',
	         'specs/asset_manager/model/Assets.js',
	         'specs/asset_manager/view/AssetsView.js',
	     ], function(chai)
	     {
				var should 	= chai.should(),
						expect 	= chai.expect;

	     	mocha.run();
	     });
});