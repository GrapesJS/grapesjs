define(['backbone'],
  function(Backbone) {

    return function() {

      return {
        /**
         * Build props object by their name
         * @param  {Array<string>} props Array of properties name
         * @return {Array<Object>}
         */
        build: function(props){
          var objs = [];
          for (var i = 0, len = props.length; i < len; i++) {
            var obj = {};
            var prop = props[i];
            obj.property = prop;
            //obj.name = prop.charAt(0).toUpperCase() + prop.slice(1);

            //Decide type
            switch(prop){
              case 'float':
                obj.type = 'radio';
                break;
            }

            //Default
            switch(prop){
              case 'float':
                obj.defaults = 'none';
                break;
            }

            //Options
            switch(prop){
              case 'float':
                obj.list = [
                    {value: 'none'},
                    {value: 'left'},
                    {value: 'right'},
                  ];
                break;
            }

            console.log(obj);
            objs.push(obj);
          }

          return objs;
        },

      };

    };
});