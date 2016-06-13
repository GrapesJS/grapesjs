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
            obj.property = prop;

            //Decide type
            switch(prop){
              case 'float': case 'position':
                obj.type = 'radio';
                break;
              case 'display':
                obj.type = 'select';
                break;
              case 'top': case 'right': case 'bottom': case 'left':
                obj.type = 'integer';
                break;
            }

            //Default
            switch(prop){
              case 'float':
                obj.defaults = 'none';
                break;
              case 'display':
                obj.defaults = 'block';
                break;
              case 'position':
                obj.defaults = 'static';
                break;
              case 'top': case 'right': case 'bottom': case 'left':
                obj.defaults = '0';
                break;
            }

            //Units
            switch(prop){
              case 'top': case 'right': case 'bottom': case 'left':
                obj.units = ['px','%'];
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
              case 'display':
                obj.list = [
                    {value: 'block'},
                    {value: 'inline'},
                    {value: 'inline-block'},
                    {value: 'none'},
                  ];
                break;
              case 'position':
                obj.list = [
                  {value: 'static'},
                  {value: 'relative'},
                  {value: 'absolute'},
                  {value: 'fixed'},
                ];
                break;
            }

            objs.push(obj);
          }

          return objs;
        },

      };

    };
});