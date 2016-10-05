define(['backbone'],
  function(Backbone) {

    return function() {

      return {
        /**
         * Build props object by their name
         * @param  {Array<string>|string} props Array of properties name
         * @return {Array<Object>}
         */
        build: function(props){
          var objs = [];

          if(typeof props === 'string')
            props = [props];

          for (var i = 0, len = props.length; i < len; i++) {
            var obj = {};
            var prop = props[i];
            obj.name = prop;

            objs.push(obj);
          }

          return objs;
        },

      };

    }();
});
