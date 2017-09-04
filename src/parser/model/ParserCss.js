module.exports = config => ({
  /**
   * Parse selector string to array.
   * Only classe based are valid as CSS rules inside editor, not valid
   * selectors will be dropped as additional
   * It's ok with the last part of the string as state (:hover, :active)
   * @param  {string} str Selectors string
   * @return {Object}
   * @example
   * var res = ParserCss.parseSelector('.test1, .test1.test2, .test2 .test3');
   * console.log(res);
   * // {
   * //result: [['test1'], ['test1', 'test2']],
   * //add: ['.test2 .test3']
   * //}
   */
  parseSelector(str) {
    var add = [];
    var result = [];
    var sels = str.split(',');
    for (var i = 0, len = sels.length; i < len; i++) {
      var sel = sels[i].trim();
      // Will accept only concatenated classes and last
      // class might be with state (eg. :hover), nothing else.
      if (/^(\.{1}[\w\-]+)+(:{1,2}[\w\-()]+)?$/ig.test(sel)) {
        var cls = sel.split('.').filter(Boolean);
        result.push(cls);
      } else {
        add.push(sel);
      }
    }
    return {
      result,
      add,
    };
  },

  /**
   * Fetch data from node
   * @param  {StyleSheet|CSSMediaRule} el
   * @return {Array<Object>}
   */
  parseNode(el) {
    var result = [];
    var nodes = el.cssRules;

    for (var i = 0, len = nodes.length; i < len; i++) {
      var node = nodes[i];
      var sels = node.selectorText;
      var selsAdd = [];

      // It's a CSSMediaRule
      if(node.cssRules) {
        var subRules = this.parseNode(node);
        var mediaText = node.media.mediaText;

        for( var s = 0, lens = subRules.length; s < lens; s++) {
          var subRule = subRules[s];
          subRule.mediaText = mediaText ? mediaText.trim() : '';
        }

        result = result.concat(subRules);
      }

      if(!sels)
        continue;

      var selsParsed = this.parseSelector(sels);
      sels = selsParsed.result;
      selsAdd = selsParsed.add;

      // Create style object from the big one
      var stl = node.style;
      var style = {};

      for (var j = 0, len2 = stl.length; j < len2; j++) {
        const propName = stl[j];
        const propValue = stl.getPropertyValue(propName);
        const important = stl.getPropertyPriority(propName);
        style[propName] = `${propValue}${important ? ` !${important}` : ''}`
      }

      var lastRule = '';
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
        lastRule = model;
        result.push(model);
      }

      // Need to push somewhere not class-based selectors, if some rule was
      // created will push them there, otherwise will create a new rule
      if (selsAdd.length) {
        var selsAddStr = selsAdd.join(', ');
        if (lastRule) {
          lastRule.selectorsAdd = selsAddStr;
        } else {
          result.push({
            selectors: [],
            selectorsAdd: selsAddStr,
            style,
          });
        }
      }

    }

    return result;
  },

  /**
   * Parse CSS string to a desired model object
   * @param  {string} str HTML string
   * @return {Object|Array<Object>}
   */
  parse(str) {
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
  }
});
