const ParserHtml = require('./model/ParserHtml');
const ParserCss = require('./model/ParserCss');

describe('Parser', () => {
  ParserHtml.run();
  ParserCss.run();
});
