require.config({
	
	baseUrl : "../src",
	
	paths : {
		chai 	: '../test/libs/chai',
		sinon 	: '../test/libs/sinon',
		mocha	: '../test/libs/mocha/mocha',
	},
	
	shim: {
		mocha: {
            init: function () {
                this.mocha.setup({
                	ignoreLeaks: true, 
                	ui:'bdd'
                });
                return this.mocha;
            }
        }
    },
    
    urlArgs : 'bust=' + (new Date()).getTime()
});