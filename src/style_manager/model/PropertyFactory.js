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

            // Type
            switch(prop){
              case 'float': case 'position':
                obj.type = 'radio';
                break;
              case 'display':
                obj.type = 'select';
                break;
              case 'top': case 'right': case 'bottom': case 'left':
              case 'margin-top': case 'margin-right': case 'margin-bottom': case 'margin-left':
              case 'padding-top': case 'padding-right': case 'padding-bottom': case 'padding-left':
              case 'min-height': case 'min-width': case 'max-height': case 'max-width':
              case 'width': case 'height':
                obj.type = 'integer';
                break;
              case 'margin': case 'padding':
                obj.type = 'composite';
                break;
            }

            // Default
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
              case 'margin-top': case 'margin-right': case 'margin-bottom': case 'margin-left':
              case 'padding-top': case 'padding-right': case 'padding-bottom': case 'padding-left':
                obj.defaults = 0;
                break;
              case 'min-height': case 'min-width': case 'max-height': case 'max-width':
              case 'width': case 'height':
                obj.defaults = 'auto';
                break;
            }

            //Units
            switch(prop){
              case 'top': case 'right': case 'bottom': case 'left':
              case 'margin-top': case 'margin-right': case 'margin-bottom': case 'margin-left':
              case 'padding-top': case 'padding-right': case 'padding-bottom': case 'padding-left':
              case 'min-height': case 'min-width': case 'max-height': case 'max-width':
              case 'width': case 'height':
                obj.units = ['px','%'];
                break;
            }

            // Min/Max
            switch(prop){
              case 'min-height': case 'min-width': case 'max-height': case 'max-width':
              case 'width': case 'height':
                obj.min = 0;
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

            // Properties
            switch(prop){
              case 'margin':
                obj.properties = this.build(['margin-top', 'margin-right', 'margin-bottom', 'margin-left']);
                break;
              case 'padding':
                obj.properties = this.build(['padding-top', 'padding-right', 'padding-bottom', 'padding-left']);
                break;
            }

            objs.push(obj);
          }

          return objs;
        },

      };

    };
});