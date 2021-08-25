import ComponentView from './ComponentImageView';

export default ComponentView.extend({
  tagName: 'script',

  events: {},

  render() {
    const { model, em } = this;
    const src = model.get('src');
    const scrCnt = em && em.get('scriptCount');
    const scriptCount = scrCnt ? scrCnt : 0;
    let content = '';

    // If it's an external script
    if (src) {
      const onload = model.get('onload');
      const svar = `script${scriptCount}`;
      const svarNext = `script${scriptCount + 1}`;
      const svarFn = `${svar}Start`;
      const svarNextFn = `${svarNext}Start`;
      // Load multiple external scripts in the correct order
      content = `
        var ${svar} = document.createElement('script');
        ${svar}.onload = function() {
          ${onload ? `${onload}();\n` : ''}
          typeof ${svarNextFn} == 'function' && ${svarNextFn}();
        };
        ${svar}.src = '${src}';
        function ${svarFn}() { document.body.appendChild(${svar}); };
        ${!scriptCount ? `${svarFn}();` : ''}
      `;
      em && em.set('scriptCount', scriptCount + 1);
    } else {
      content = model.__innerHTML();
    }

    this.el.innerHTML = content;
    this.postRender();
    return this;
  }
});
