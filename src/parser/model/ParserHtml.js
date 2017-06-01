module.exports = config => {

  var TEXT_NODE = 'span';
  var c = config;
  var modelAttrStart = 'data-gjs-';

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
    parseStyle(str) {
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
    parseClass(str) {
      var result = [];
      var cls = str.split(' ');
      for (var i = 0, len = cls.length; i < len; i++) {
        var cl = cls[i].trim();
        var reg = new RegExp('^' + c.pStylePrefix);
        if(!cl || reg.test(cl))
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
    parseNode(el) {
      var result = [];
      var nodes = el.childNodes;

      for (var i = 0, len = nodes.length; i < len; i++) {
        var node = nodes[i];
        var model = {};
        var attrs = node.attributes || [];
        var attrsLen = attrs.length;
        var prevI = result.length - 1;
        var prevSib = result[prevI];
        var ct = this.compTypes;

        if(ct){
          var obj = '';
          /*
          for (var cType in ct) {
            var component = ct[cType].model;
            obj = component.isComponent(node);
            if(obj)
              break;
          }*/
          for (var it = 0; it < ct.length; it++) {
            var component = ct[it].model;
            obj = component.isComponent(node);
            if(obj)
              break;
          }

          model = obj;
        }

        if(!model.tagName)
          model.tagName = node.tagName ? node.tagName.toLowerCase() : '';

        if(attrsLen)
          model.attributes = {};

        // Store attributes
        for (var j = 0; j < attrsLen; j++){
          var nodeName = attrs[j].nodeName;
          var nodeValue = attrs[j].nodeValue;

          //Isolate few attributes
          if(nodeName == 'style')
            model.style = this.parseStyle(nodeValue);
          else if(nodeName == 'class')
            model.classes = this.parseClass(nodeValue);
          else if (nodeName == 'contenteditable')
            continue;
          else if(nodeName.indexOf(modelAttrStart) === 0){
            var modelAttr = nodeName.replace(modelAttrStart, '');
            nodeValue = nodeValue === 'true' ? true : nodeValue;
            nodeValue = nodeValue === 'false' ? false : nodeValue;
            model[modelAttr] = nodeValue;
          }else
            model.attributes[nodeName] = nodeValue;
        }


        var nodeChild = node.childNodes.length;

        // Check for nested elements and avoid them if an array
        // was already given
        if(nodeChild && !model.components){
          // Avoid infinite text nodes nesting
          var firstChild = node.childNodes[0];
          if(nodeChild === 1 && firstChild.nodeType === 3){
            if(!model.type){
              model.type = 'text';
            }
            model.content = firstChild.nodeValue;
          }else{
            var parsed = this.parseNode(node);
            // From: <div> <span>TEST</span> </div> <-- span is text type
            // TO: <div> TEST </div> <-- div become text type
            if(parsed.length == 1 && parsed[0].type == 'text' &&
              parsed[0].tagName == TEXT_NODE){
              model.type = 'text';
              model.content = parsed[0].content;
            }else
              model.components = parsed;
          }
        }

        // Check if it's a text node and if could be moved to the prevous model
        if(model.type == 'textnode'){
          var prevIsText = prevSib && prevSib.type == 'textnode';
          if(prevIsText){
            prevSib.content += model.content;
            continue;
          }
          // Throw away empty nodes (keep spaces)
          var content = node.nodeValue;
          if(content != ' ' && !content.trim()){
            continue;
          }
        }

        // If all children are texts and there is some textnode the parent should
        // be text too otherwise I'm unable to edit texnodes
        var comps = model.components;
        if(!model.type && comps){
          var allTxt = 1;
          var foundTextNode = 0;
          for(var ci = 0; ci < comps.length; ci++){
            var comp = comps[ci];
            if(comp.type != 'text' &&
              comp.type != 'textnode' &&
              c.textTags.indexOf(comp.tagName) < 0 ){
              allTxt = 0;
              break;
            }
            if(comp.type == 'textnode')
              foundTextNode = 1;
          }
          if(allTxt && foundTextNode)
            model.type = 'text';
        }

        // If tagName is still empty and is not a textnode, do not push it
        if(!model.tagName && model.type != 'textnode')
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
    parse(str, parserCss) {
      var config = (c.em && c.em.get('Config')) || {};
      var res = { html: '', css: ''};
      var el = document.createElement('div');
      el.innerHTML = str;
      var scripts = el.querySelectorAll('script');
      var i = scripts.length;

      // Remove all scripts
      if(!config.allowScripts){
        while (i--)
          scripts[i].parentNode.removeChild(scripts[i]);
      }

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
