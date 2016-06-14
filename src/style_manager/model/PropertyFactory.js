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
              case 'text-align':
                obj.type = 'radio';
                break;
              case 'display': case 'font-family':
              case 'font-weight':
                obj.type = 'select';
                break;
              case 'top': case 'right': case 'bottom': case 'left':
              case 'margin-top': case 'margin-right': case 'margin-bottom': case 'margin-left':
              case 'padding-top': case 'padding-right': case 'padding-bottom': case 'padding-left':
              case 'min-height': case 'min-width': case 'max-height': case 'max-width':
              case 'width': case 'height':
              case 'font-size': case 'letter-spacing': case 'line-height':
              case 'text-shadow-h': case 'text-shadow-v': case 'text-shadow-blur':
                obj.type = 'integer';
                break;
              case 'margin': case 'padding':
                obj.type = 'composite';
                break;
              case 'color': case 'text-shadow-color':
                obj.type = 'color';
                break;
              case 'text-shadow':
                obj.type = 'stack';
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
              case 'text-shadow-h': case 'text-shadow-v': case 'text-shadow-blur':
                obj.defaults = 0;
                break;
              case 'min-height': case 'min-width': case 'max-height': case 'max-width':
              case 'width': case 'height':
                obj.defaults = 'auto';
                break;
              case 'font-family':
                obj.defaults = 'Arial, Helvetica, sans-serif';
                break;
              case 'font-size':
                obj.defaults = 'medium';
                break;
              case 'font-weight':
                obj.defaults = '400';
                break;
              case 'letter-spacing': case 'line-height':
                obj.defaults = 'normal';
                break;
              case 'color': case 'text-shadow-color':
                obj.defaults = 'black';
                break;
              case 'text-align':
                obj.defaults = 'left';
                break;
            }

            //Units
            switch(prop){
              case 'top': case 'right': case 'bottom': case 'left':
              case 'margin-top': case 'margin-right': case 'margin-bottom': case 'margin-left':
              case 'padding-top': case 'padding-right': case 'padding-bottom': case 'padding-left':
              case 'min-height': case 'min-width': case 'max-height': case 'max-width':
              case 'width': case 'height':
              case 'text-shadow-h': case 'text-shadow-v': case 'text-shadow-blur':
                obj.units = ['px','%'];
                break;
              case 'font-size': case 'letter-spacing': case 'line-height':
                obj.units = ['px','em', 'rem', '%'];
                break;
            }

            // Min/Max
            switch(prop){
              case 'min-height': case 'min-width': case 'max-height': case 'max-width':
              case 'width': case 'height':
              case 'font-size':
              case 'text-shadow-blur':
                obj.min = 0;
                break;
            }

            // Preview
            switch(prop){
              case 'text-shadow':
                obj.preview = true;
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
              case 'font-family':
                var ss = ', sans-serif';
                var s = ', serif';
                var fonts = ['Arial, Helvetica' + ss, 'Arial Black, Gadget' + ss, 'Brush Script MT' + ss,
                  'Comic Sans MS, cursive' + ss, 'Courier New, Courier, monospace', 'Georgia, serif', 'Helvetica, serif',
                  'Impact, Charcoal' + ss, 'Lucida Sans Unicode, Lucida Grande' + ss, 'Tahoma, Geneva' + ss,
                  'Times New Roman, Times, serif', 'Trebuchet MS, Helvetica' + ss, 'Verdana, Geneva' + ss];
                obj.list = [];
                for(var j = 0, l = fonts.length; j < l; j++){
                  var font = {};
                  font.value = fonts[j];
                  font.name = fonts[j].split(',')[0];
                  font.style = 'font-family: ' + fonts[j] + '; font-size:15px';
                  obj.list.push(font);
                }
                break;
              case 'font-weight':
                obj.list = [
                   { value : '100', name : 'Thin', },
                   { value : '200', name : 'Extra-Light', },
                   { value : '300', name : 'Light', },
                   { value : '400', name : 'Normal', },
                   { value : '500', name : 'Medium',},
                   { value : '600', name : 'Semi-Bold',},
                   { value : '700', name : 'Bold', },
                   { value : '800', name : 'Extra-Bold',},
                   { value : '900', name : 'Ultra-Bold', }
                ];
                break;
              case 'text-align':
                obj.list = [
                    { value : 'left'},
                    { value : 'center'},
                    { value : 'right'},
                    { value : 'justify'}
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
              case 'text-shadow':
                obj.properties = this.build(['text-shadow-h', 'text-shadow-v', 'text-shadow-blur', 'text-shadow-color']);
                break;
            }

            objs.push(obj);
          }

          return objs;
        },

      };

    };
});