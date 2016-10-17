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

          for (var i = 0; i < props.length; i++) {
            var obj = {};
            var prop = props[i];
            obj.name = prop;

            // Define type
            switch (prop) {
              case 'target':
                obj.type = 'select';
                break;
            }

            // Define options
            switch (prop) {
              case 'target':
                obj.options = [
                  {value: '_self', name: 'This window'},
                  {value: '_blank', name: 'New window'}
                ];
                break;
            }

            objs.push(obj);
          }

          return objs;
        },

      };

    }();
});
