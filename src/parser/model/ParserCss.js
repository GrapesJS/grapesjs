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
    let add = [];
    let result = [];
    let sels = str.split(',');
    for (let i = 0, len = sels.length; i < len; i++) {
      let sel = sels[i].trim();
      // Will accept only concatenated classes and last
      // class might be with state (eg. :hover), nothing else.
      if (/^(\.{1}[\w\-]+)+(:{1,2}[\w\-()]+)?$/gi.test(sel)) {
        let cls = sel.split('.').filter(Boolean);
        result.push(cls);
      } else {
        add.push(sel);
      }
    }
    return {
      result,
      add
    };
  },

  /**
   * Fetch data from node
   * @param  {StyleSheet|CSSMediaRule} el
   * @return {Array<Object>}
   */
  parseNode(el) {
    let result = [];
    let nodes = el.cssRules;

    for (let i = 0, len = nodes.length; i < len; i++) {
      let node = nodes[i];
      let sels = node.selectorText;
      let selsAdd = [];

      // It's a CSSMediaRule
      if (node.cssRules) {
        let subRules = this.parseNode(node);
        let mediaText = node.media.mediaText;

        for (let s = 0, lens = subRules.length; s < lens; s++) {
          let subRule = subRules[s];
          subRule.mediaText = mediaText ? mediaText.trim() : '';
        }

        result = result.concat(subRules);
      }

      if (!sels) continue;

      let selsParsed = this.parseSelector(sels);
      sels = selsParsed.result;
      selsAdd = selsParsed.add;

      // Create style object from the big one
      let stl = node.style;
      let style = {};

      for (let j = 0, len2 = stl.length; j < len2; j++) {
        const propName = stl[j];
        const propValue = stl.getPropertyValue(propName);
        const important = stl.getPropertyPriority(propName);
        style[propName] = `${propValue}${important ? ` !${important}` : ''}`;
      }

      let lastRule = '';
      // For each group of selectors
      for (let k = 0, len3 = sels.length; k < len3; k++) {
        let selArr = sels[k];
        let model = {};

        //Isolate state from selector
        let stateArr = selArr[selArr.length - 1].split(/:(.+)/);
        if (stateArr[1]) {
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
        let selsAddStr = selsAdd.join(', ');
        if (lastRule) {
          lastRule.selectorsAdd = selsAddStr;
        } else {
          result.push({
            selectors: [],
            selectorsAdd: selsAddStr,
            style
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
    let el = document.createElement('style');
    /*
    el.innerHTML = ".cssClass {border: 2px solid black; background-color: blue;} " +
    ".red, .red2 {color:red; padding:5px} .test1.red {color:black} .red:hover{color: blue} " +
    "@media screen and (min-width: 480px){ .red{color:white} }";
    */
    el.innerHTML = str;

    // There is no .sheet without adding it to the <head>
    document.head.appendChild(el);
    let sheet = el.sheet;
    document.head.removeChild(el);
    let result = this.parseNode(sheet);

    if (result.length == 1) result = result[0];

    return result;
  }
});
