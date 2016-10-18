define(['backbone'],
  function(Backbone){

    return Backbone.Model.extend({

      defaults :{
        label: '',
        content: '',
        attributes: {},
      },

    });
  });
