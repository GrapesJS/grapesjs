module.exports = () => {
  let conf = {},
    defaults = require('./config/config'),
    parserCss = require('./model/ParserCss'),
    parserHtml = require('./model/ParserHtml');
  let pHtml, pCss;

  return {
    compTypes: '',

    parserCss: null,

    parserHtml: null,

    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'Parser',

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * @param {Object} config Configurations
     * @param {Array<Object>} [config.blocks=[]] Default blocks
     * @return {this}
     * @example
     * ...
     * {
     *     blocks: [
     *      {id:'h1-block' label: 'Heading', content:'<h1>...</h1>'},
     *      ...
     *    ],
     * }
     * ...
     */
    init(config = {}) {
      conf = { ...defaults, ...config };
      this.parserCss = conf.parserCss || null;
      this.parserHtml = conf.parserHtml || null;
      pHtml = new parserHtml(conf);
      pCss = new parserCss(conf);
      return this;
    },

    /**
     * Parse HTML string and return valid model
     * @param  {string} str HTML string
     * @return {Object}
     */
    parseHtml(str) {
      pHtml.compTypes = this.compTypes;
      return pHtml.parse(str, pCss);
    },

    parseCss(str) {
      return pCss.parse(str);
    }
  };
};
