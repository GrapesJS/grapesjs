define(function(require) {

  return function(config) {

    var TEXT_NODE = 'span';
    var c = config;

    return {

      compTypes: '',

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
       * Fetch data from node
       * @param  {HTMLElement} el DOM
       * @return {Array<Object>}
       */
      parseNode: function(el){
        var result = [];
        var nodes = el.childNodes;

        for (var i = 0, len = nodes.length; i < len; i++) {
          var node = nodes[i];
          var model = {};
          var attrs = node.attributes || [];
          var attrsLen = attrs.length;
          var prevI = result.length - 1;
          var prevSib = result[prevI];
          model.tagName = node.tagName ? node.tagName.toLowerCase() : '';

          var ct = this.compTypes;
          if(ct){
            var obj = '';
            for (var cType in ct) {
              var component = ct[cType].model;
              obj = component.isComponent(node);
              if(obj)
                break;
            }
            model = obj;
          }

          if(attrsLen)
            model.attributes = {};

          // Store attributes
          for (var j = 0; j < attrsLen; j++){
            var nodeName = attrs[j].nodeName;
            var nodeValue = attrs[j].nodeValue;

            //Isolate style, class and src attributes
            if(nodeName == 'style')
              model.style = this.parseStyle(nodeValue);
            else if(nodeName == 'class')
              model.classes = this.parseClass(nodeValue);
            else if(nodeName == 'src' && model.tagName == 'img'){
              model.type = 'image';
              model.src = nodeValue;
            }else
              model.attributes[nodeName] = nodeValue;
          }

          // Check for nested elements
          var nodeChild = node.childNodes.length;
          if(nodeChild){
            // Avoid infinite text nodes nesting
            var firstChild = node.childNodes[0];
            if(nodeChild === 1 && firstChild.nodeType === 3){
              model.type = 'text';
              model.content = firstChild.nodeValue;
            }else{
              var parsed = this.parseNode(node);
              // From: <div> <span>TEST</span> </div> <-- span is text type
              // TO: <div> TEST </div> <-- div become text type
              // With 'nodeChild > 1' I know that nodes were merged
              if(parsed.length == 1 && parsed[0].type == 'text' &&
                nodeChild > 1 && parsed[0].tagName == TEXT_NODE){
                model.type = 'text';
                model.content = parsed[0].content;
              }else
                model.components = parsed;
            }
          }

          var prevIsText = prevSib && prevSib.type == 'text' && prevSib.tagName == TEXT_NODE;
          // Find text nodes
          if(!model.tagName && node.nodeType === 3){
            // Pass content to the previous model if it's a text node
            if(prevIsText){
              prevSib.content += node.nodeValue;
              continue;
            }
            // Make it text node only the content is not empty
            if(node.nodeValue.trim()){
              model.type = 'text';
              model.tagName = TEXT_NODE;
              model.content = node.nodeValue;
            }
          }

          // Check if it's a text node and if it could be moved to the prevous model
          if(c.textTags.indexOf(model.tagName) >= 0){
            if(prevIsText){
              prevSib.content += node.outerHTML;
              continue;
            }else{
              model = {
                type: 'text',
                tagName: TEXT_NODE,
                content: node.outerHTML,
              };
            }
          }

          // If tagName is still empty do not push it
          if(!model.tagName)
            continue;

          result.push(model);
        }

        return result;
      },

      /**
       * Parse HTML string to a desired model object
       * @param  {string} str HTML string
       * @param  {ParserCss} parserCss In case there is style tags inside HTML
       * @return {Object}
       */
      parse: function(str, parserCss){
        var res = { html: '', css: ''};
        var el = document.createElement('div');
        el.innerHTML = str;
        var scripts = el.querySelectorAll('script');
        var i = scripts.length;

        // Remove all scripts
        while (i--)
          scripts[i].parentNode.removeChild(scripts[i]);

        // Detach style tags and parse them
        if(parserCss){
          var styleStr = '';
          var styles = el.querySelectorAll('style');
          var j = styles.length;

          while (j--){
            styleStr = styles[j].innerHTML + styleStr;
            styles[j].parentNode.removeChild(styles[j]);
          }

          if(styleStr)
            res.css = parserCss.parse(styleStr);
        }

        var result = this.parseNode(el);

        if(result.length == 1)
          result = result[0];

        res.html = result;

        return res;

      },

    };

  };

});
