/**
 * File made for IE/Edge support
 * https://github.com/artf/grapesjs/issues/214
 */

export default () => {
  /**
   * Check if IE/Edge
   * @return {Boolean}
   */
  const isIE = () => {
    let match;
    const agent = window.navigator.userAgent;
    const rules = [
      ['edge', /Edge\/([0-9\._]+)/],
      ['ie', /MSIE\s(7\.0)/],
      ['ie', /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/],
      ['ie', /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/]
    ];

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      match = rule[1].exec(agent);
      if (match) break;
    }

    return !!match;
  };

  if (isIE()) {
    const originalCreateHTMLDocument =
      DOMImplementation.prototype.createHTMLDocument;
    DOMImplementation.prototype.createHTMLDocument = title => {
      if (!title) title = '';
      return originalCreateHTMLDocument.apply(document.implementation, [title]);
    };
  }
};
