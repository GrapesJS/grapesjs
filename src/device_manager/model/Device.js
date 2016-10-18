define(['backbone'],
  function(Backbone){

    return Backbone.Model.extend({

      idAttribute: 'name',

      defaults :{
        name: '',
        width: '',
      },

    });
  });
