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

            // Property
            switch(prop){
              case 'border-radius-c':
                obj.property = 'border-radius';
                break;
            }

            // Type
            switch(prop){
              case 'float': case 'position':
              case 'text-align':
                obj.type = 'radio';
                break;
              case 'display': case 'font-family':
              case 'font-weight':
              case 'border-style':
              case 'box-shadow-type':
              case 'background-repeat': case 'background-position': case 'background-attachment': case 'background-size':
                obj.type = 'select';
                break;
              case 'top': case 'right': case 'bottom': case 'left':
              case 'margin-top': case 'margin-right': case 'margin-bottom': case 'margin-left':
              case 'padding-top': case 'padding-right': case 'padding-bottom': case 'padding-left':
              case 'min-height': case 'min-width': case 'max-height': case 'max-width':
              case 'width': case 'height':
              case 'font-size': case 'letter-spacing': case 'line-height':
              case 'text-shadow-h': case 'text-shadow-v': case 'text-shadow-blur':
              case 'border-radius-c':
              case 'border-top-left-radius': case 'border-top-right-radius': case 'border-bottom-left-radius':case 'border-bottom-right-radius':
              case 'border-width':
              case 'box-shadow-h': case 'box-shadow-v': case 'box-shadow-blur': case 'box-shadow-spread':
                obj.type = 'integer';
                break;
              case 'margin': case 'padding':
              case 'border-radius':
              case 'border':
                obj.type = 'composite';
                break;
              case 'color': case 'text-shadow-color':
              case 'background-color': case 'border-color': case 'box-shadow-color':
                obj.type = 'color';
                break;
              case 'text-shadow': case 'box-shadow': case 'background':
                obj.type = 'stack';
                break;
              case 'background-image':
                obj.type = 'file';
                break;
            }

            // Defaults
            switch(prop){
              case 'float': case 'background-color':
              case 'background-image':
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
              case 'border-radius-c':
              case 'border-top-left-radius': case 'border-top-right-radius': case 'border-bottom-left-radius':case 'border-bottom-right-radius':
              case 'box-shadow-h': case 'box-shadow-v': case 'box-shadow-spread':
                obj.defaults = 0;
                break;
              case 'box-shadow-blur':
                obj.defaults = 5;
                break;
              case 'min-height': case 'min-width': case 'max-height': case 'max-width':
              case 'width': case 'height':
              case 'background-size':
                obj.defaults = 'auto';
                break;
              case 'font-family':
                obj.defaults = 'Arial, Helvetica, sans-serif';
                break;
              case 'font-size': case 'border-width':
                obj.defaults = 'medium';
                break;
              case 'font-weight':
                obj.defaults = '400';
                break;
              case 'letter-spacing': case 'line-height':
                obj.defaults = 'normal';
                break;
              case 'color': case 'text-shadow-color':
              case 'border-color': case 'box-shadow-color':
                obj.defaults = 'black';
                break;
              case 'text-align':
                obj.defaults = 'left';
                break;
              case 'border-style':
                obj.defaults = 'solid';
                break;
              case 'box-shadow-type':
                obj.defaults = '';
                break;
              case 'background-repeat':
                obj.defaults = 'repeat';
                break;
              case 'background-position':
                obj.defaults = 'left top';
                break;
              case 'background-attachment':
                obj.defaults = 'scroll';
                break;
            }

            // Units
            switch(prop){
              case 'top': case 'right': case 'bottom': case 'left':
              case 'margin-top': case 'margin-right': case 'margin-bottom': case 'margin-left':
              case 'padding-top': case 'padding-right': case 'padding-bottom': case 'padding-left':
              case 'min-height': case 'min-width': case 'max-height': case 'max-width':
              case 'width': case 'height':
              case 'text-shadow-h': case 'text-shadow-v': case 'text-shadow-blur':
              case 'border-radius-c':
              case 'border-top-left-radius': case 'border-top-right-radius': case 'border-bottom-left-radius':case 'border-bottom-right-radius':
              case 'box-shadow-h': case 'box-shadow-v':
                obj.units = ['px','%'];
                break;
              case 'font-size': case 'letter-spacing': case 'line-height':
                obj.units = ['px','em', 'rem', '%'];
                break;
              case 'border-width':
                obj.units = ['px','em'];
                break;
              case 'box-shadow-blur': case 'box-shadow-spread':
                obj.units = ['px'];
                break;
            }

            // Min/Max
            switch(prop){
              case 'min-height': case 'min-width': case 'max-height': case 'max-width':
              case 'width': case 'height':
              case 'font-size':
              case 'text-shadow-blur':
              case 'border-radius-c':
              case 'border-top-left-radius': case 'border-top-right-radius': case 'border-bottom-left-radius':case 'border-bottom-right-radius':
              case 'border-width':
              case 'box-shadow-blur':
                obj.min = 0;
                break;
            }

            // Preview
            switch(prop){
              case 'text-shadow': case 'box-shadow': case 'background':
                obj.preview = true;
                break;
            }

            // Detached
            switch(prop){
              case 'background':
                obj.detached = true;
                break;
            }

            // Options
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
              case 'border-style':
                obj.list = [
                    { value : 'none'},
                    { value : 'solid'},
                    { value : 'dotted'},
                    { value : 'dashed'},
                    { value : 'double'},
                    { value : 'groove'},
                    { value : 'ridge'},
                    { value : 'inset'},
                    { value : 'outset'}
                  ];
                break;
              case 'box-shadow-type':
                obj.list = [
                    {value : '', name: 'Outside'},
                    {value : 'inset', name: 'Inside'}
                  ];
                break;
              case 'background-repeat':
                obj.list = [
                    { value : 'repeat'},
                    { value : 'repeat-x'},
                    { value : 'repeat-y'},
                    { value : 'no-repeat'}
                  ];
                break;
              case 'background-position':
                obj.list = [
                    { value : 'left top',},
                    { value : 'left center',},
                    { value : 'left bottom',},
                    { value : 'right top',},
                    { value : 'right center'},
                    { value : 'right bottom'},
                    { value : 'center top'},
                    { value : 'center center'},
                    { value : 'center bottom'}
                  ];
                break;
              case 'background-attachment':
                obj.list = [
                    { value : 'scroll'},
                    { value : 'fixed'},
                    { value : 'local'}
                  ];
                break;
              case 'background-size':
                obj.list = [
                    { value : 'auto'},
                    { value : 'cover'},
                    { value : 'contain'}
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
              case 'border':
                obj.properties = this.build(['border-width', 'border-style', 'border-color']);
                break;
              case 'border-radius':
                obj.properties = this.build(['border-top-left-radius', 'border-top-right-radius',
                  'border-bottom-left-radius', 'border-bottom-right-radius']);
                break;
              case 'box-shadow':
                obj.properties = this.build(['box-shadow-h', 'box-shadow-v', 'box-shadow-blur','box-shadow-spread',
                  'box-shadow-color', 'box-shadow-type']);
                break;
              case 'background':
                obj.properties = this.build(['background-image', 'background-repeat', 'background-position','background-attachment',
                  'background-size']);
                break;
            }

            objs.push(obj);
          }

          return objs;
        },

      };

    };
});