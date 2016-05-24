define(function(require) {

  return function(config) {

    return {

      parse: function(str){
        return {parsed: 'CSS '+str};
      },

    };

  };

});