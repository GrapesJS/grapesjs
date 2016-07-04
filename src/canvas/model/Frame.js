define(['backbone'],
  function(Backbone){

    return Backbone.Model.extend({

      defaults :{
        wrapper: '',
        width: '',
        height: '',
        attributes: {},
      },

    });
  });
