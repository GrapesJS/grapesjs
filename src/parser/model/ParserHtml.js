define(function(require) {

  return function(config) {

    return {

      /**
       * Parse style string to object
       * @param {string} str
       * @return {Object}
       * @example
       * var stl = ParserHtml.parseStyle('color:black; width:100px; test:value;');
       * console.log(stl);
       * // {color: 'black', width: '100px', test: 'value'}
       */
      parseStyle: function(str){
        var result = {};
        var decls = str.split(';');
        for (var i = 0, len = decls.length; i < len; i++) {
          var decl = decls[i].trim();
          if(!decl)
            continue;
          var prop = decl.split(':');
          result[prop[0].trim()] = prop[1].trim();
        }
        return result;
      },

      /**
       * Parse class string to array
       * @param {string} str
       * @return {Array<string>}
       * @example
       * var res = ParserHtml.parseClass('test1 test2 test3');
       * console.log(res);
       * // ['test1', 'test2', 'test3']
       */
      parseClass: function(str){
        var result = [];
        var cls = str.split(' ');
        for (var i = 0, len = cls.length; i < len; i++) {
          var cl = cls[i].trim();
          if(!cl)
            continue;
          result.push(cl);
        }
        return result;
      },

      /**
       * Parse HTML string to a desired model object
       * @param  {string} str HTML string
       * @return {Object}
       */
      parse: function(str){
        var el = document.createElement('div');
        el.innerHTML = str;
        var nodes = el.childNodes;
        var result = [];

        // Iterate all nodes
        for (var i = 0, len = nodes.length; i < len; i++) {
          var node = nodes[i];
          var model = {};
          var attrs = node.attributes;
          var attrsLen = attrs.length;
          model.tagName = node.tagName.toLowerCase();

          if(attrsLen)
            model.attributes = {};

          // Store attributes
          for (var j = 0; j < attrsLen; j++){
            var nodeName = attrs[j].nodeName;
            var nodeValue = attrs[j].nodeValue;

            //Isolate style and class attributes
            if(nodeName === 'style')
              model.style = this.parseStyle(nodeValue);
            else if(nodeName === 'class')
              model.classes = this.parseClass(nodeValue);
            else
              model.attributes[nodeName] = nodeValue;
          }

          result.push(model);
        }

        if(result.length == 1)
          result = result[0];

        return result;
      },

    };

  };

});