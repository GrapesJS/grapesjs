import defaults from './config/config';
import parserCss from './model/ParserCss';
import parserHtml from './model/ParserHtml';

export default () => {
  let conf = {};
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
     * Get config object
     * @return {Object}
     */
    getConfig() {
      return conf;
    },

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
      conf.Parser = this;
      pHtml = new parserHtml(conf);
      pCss = new parserCss(conf);
      this.em = conf.em;
      this.parserCss = pCss;
      this.parserHtml = pHtml;
      return this;
    },

    /**
     * Parse HTML string and return valid model
     * @param  {string} str HTML string
     * @return {Object}
     */
    parseHtml(str) {
      const { em, compTypes } = this;
      pHtml.compTypes = em ? em.get('DomComponents').getTypes() : compTypes;
      return pHtml.parse(str, pCss);
    },

    /**
     * Parse CSS string and return valid model
     * @param  {string} str CSS string
     * @return {Array<Object>}
     */
    parseCss(str) {
      return pCss.parse(str);
    }
  };
};
