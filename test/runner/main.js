require(['../src/config/require-config.js', 'config/config.js'], function() {

	require(['chai',
					 'sinon',
	         'specs/main.js',
	         'specs/asset_manager/main.js',
	         'specs/dom_components/main.js',
	         'specs/modal/main.js',
	         'specs/selector_manager/main.js',
	         'specs/css_composer/main.js',
	         'specs/code_manager/main.js',
	         'specs/device_manager/main.js',
	         'specs/panels/main.js',
	         'specs/commands/main.js',
	         'specs/style_manager/main.js',
	         'specs/storage_manager/main.js',
	         'specs/plugin_manager/main.js',
	         'specs/block_manager/main.js',
					 'specs/trait_manager/main.js',
	         'specs/parser/main.js',
	         'specs/grapesjs/main.js',
	         'specs/utils/main.js'
	     ], function(chai, sinon)
	     {
				window.sinon = sinon;
				var should 	= chai.should(),
						expect 	= chai.expect;

	     	mocha.run();
	     });
});
