define(['backbone'],
  function(Backbone) {

    return Backbone.Model.extend({

      defaults: {
	       command: '',
         attributes: {},
      },


    });
  });
