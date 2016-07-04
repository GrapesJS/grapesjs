define(['backbone', './Frame'],
	function(Backbone, Frame){

		return Backbone.Model.extend({

			defaults :{
        frame: '',
				wrapper: '',
				rulers: false,
			},

      initialize: function(config) {
        var conf = this.conf || {};
        this.set('frame', new Frame(conf.frame));
      },

		});
	});
