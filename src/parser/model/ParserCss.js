define(function(require) {

  return function(config) {

    return {

      /**
       * Parse selector string to array.
       * Only concatenated classes are valid as CSS rules inside editor.
       * It's ok with the last part of the string as state (:hover, :active)
       * @param  {string} str Selectors string
       * @return {Array<Array>}
       * @example
       * var res = ParserCss.parseSelector('.test1, .test1.test2, .test2.test3');
       * console.log(res);
       * // [['test1'], ['test1', 'test2'], ['test2', 'test3']]
       */
      parseSelector: function(str){
        var result = [];
        var sels = str.split(',');
        for (var i = 0, len = sels.length; i < len; i++) {
          var sel = sels[i].trim();
          // Will accept only concatenated classes and last
          // class might be with state (eg. :hover), nothing else.
          if (/^(\.{1}[\w\-]+)+(:{1,2}[\w\-()]+)?$/ig.test(sel)) {
            var cls = sel.split('.').filter(Boolean);
            result.push(cls);
          }
        }
        return result;
      },

      /**
       * Fetch data from node
       * @param  {StyleSheet|CSSMediaRule} el
       * @return {Array<Object>}
       */
      parseNode: function(el){
        var result = [];
        var nodes = el.cssRules;

        for (var i = 0, len = nodes.length; i < len; i++) {
          var node = nodes[i];
          var sels = node.selectorText;

          // It's a CSSMediaRule
          if(node.cssRules){
            var subRules = this.parseNode(node);
            var width = node.media.mediaText.match(/-width:(.*)\)/i)[1];
            for(var s = 0, lens = subRules.length; s < lens; s++){
              var subRule = subRules[s];
              subRule.maxWidth = width ? width.trim() : '';
            }
            result = result.concat(subRules);
          }

          if(!sels)
            continue;

          sels = this.parseSelector(sels);

          // Create style object from the big one
          var stl = node.style;
          var style = {};
          for(var j = 0, len2 = stl.length; j < len2; j++){
            style[stl[j]] = stl[stl[j]];
          }

          // For each group of selectors
          for (var k = 0, len3 = sels.length; k < len3; k++) {
            var selArr = sels[k];
            var model = {};

            //Isolate state from selector
            var stateArr = selArr[selArr.length - 1].split(/:(.+)/);
            if(stateArr[1]){
              selArr[selArr.length - 1] = stateArr[0];
              model.state = stateArr[1];
              stateArr.splice(stateArr.length - 1, 1);
            }

            model.selectors = selArr;
            model.style = style;
            result.push(model);
          }

        }

        return result;
      },

      /**
       * Parse CSS string to a desired model object
       * @param  {string} str HTML string
       * @return {Object|Array<Object>}
       */
      parse: function(str){
        var el = document.createElement('style');
        /*
        el.innerHTML = ".cssClass {border: 2px solid black; background-color: blue;} " +
        ".red, .red2 {color:red; padding:5px} .test1.red {color:black} .red:hover{color: blue} " +
        "@media screen and (min-width: 480px){ .red{color:white} }";
        */
        el.innerHTML = str;

        // There is no .sheet without adding it to the <head>
        document.head.appendChild(el);
        var sheet = el.sheet;
        document.head.removeChild(el);
        var result = this.parseNode(sheet);

        if(result.length == 1)
          result = result[0];

        return result;
      },

    };

  };

});
