require.config({

	baseUrl : "../src",

	paths : {
		chai 	: '../vendor/chai/chai',
		sinon : '../vendor/sinon/sinon',
		mocha	: '../vendor/mocha/mocha',
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