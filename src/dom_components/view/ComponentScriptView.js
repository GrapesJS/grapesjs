let Backbone = require('backbone');
let ComponentView = require('./ComponentImageView');

module.exports = ComponentView.extend({
  tagName: 'script',

  events: {},

  render() {
    let model = this.model;
    let src = model.get('src');
    let em = this.em;
    let scriptCount = em && em.get('scriptCount') ? em.get('scriptCount') : 0;
    let content = '';

    // If it's an external script
    if (src) {
      let onload = model.get('onload');
      let svar = 'script' + scriptCount;
      let svarNext = 'script' + (scriptCount + 1);
      content =
        'var ' +
        svar +
        " = document.createElement('script');\n" +
        svar +
        '.onload = function(){\n' +
        (onload ? onload + '();\n' : '') +
        'typeof ' +
        svarNext +
        "Start == 'function' && " +
        svarNext +
        'Start();\n' +
        '};\n' +
        svar +
        ".src = '" +
        src +
        "';\n" +
        'function ' +
        svar +
        'Start() { document.body.appendChild(' +
        svar +
        '); };\n' +
        (!scriptCount ? svar + 'Start();' : '');
      if (em) {
        em.set('scriptCount', scriptCount + 1);
      }
    } else {
      content = model.get('content');
    }

    this.el.innerHTML = content;
    return this;
  }
});
