import Backbone from 'backbone';
import ComponentView from './ComponentImageView';

export default ComponentView.extend({
  tagName: 'script',

  events: {},

  render() {
    var model = this.model;
    var src = model.get('src');
    var em = this.em;
    var scriptCount = em && em.get('scriptCount') ? em.get('scriptCount') : 0;
    var content = '';

    // If it's an external script
    if (src) {
      var onload = model.get('onload');
      var svar = 'script' + scriptCount;
      var svarNext = 'script' + (scriptCount + 1);
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
    this.postRender();
    return this;
  }
});
