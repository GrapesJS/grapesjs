const path = require('path');
const gjs = require('./packages/core/dist/grapes.min.js');
// const gjs = require(path.resolve(__dirname, 'packages/core/dist/grapes.min.js'));
const editor = gjs.init({ headless: true, patches: { enable: true } });
const em = editor.getModel();
let got = null;
editor.on('patch:update', (e)=> { got = e.patch; });
const wrapper = editor.getWrapper();
const cmp = wrapper.append({ type: 'text', content: 'Hello' })[0];
// change attributes
cmp.addAttributes({ title: 'Hi' });
// change style
cmp.setStyle({ color: 'red' });
setTimeout(()=>{
  console.log('HAS_PATCH', !!got, 'OPS', got && got.changes.length);
  console.log('SAMPLE', got && got.changes.slice(0,2));
}, 0);
