requirejs.onError = function (err) {
  console.log(err);
  throw err;
};
require.config({

	baseUrl : "../src",

	paths : {
		chai 	: '../node_modules/chai/chai',
		sinon : '../node_modules/sinon/lib/sinon',
		mocha	: '../node_modules/mocha/mocha',
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
