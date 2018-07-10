<template>
  <div>
    <div id="basic-panel3"></div>
    <div id="gjs3">
      <h1>Hello World Component!</h1>
    </div>
    <div id="blocks3"></div>
  </div>
</template>

<script>
module.exports = {
  mounted() {
    // show addPanel with toggle-borders, export-code and custom alert show selected JSON + panel style
    const utils = require('./demos/utils.js');
    const editor3 = grapesjs.init(utils.gjsConfigPanels);
    editor3.Panels.addPanel({
      id: 'custom-panel',
      el: '#basic-panel3',
      buttons: [
        {
          id: 'visibility',
          // active by default
          active: true,
          className: 'btn-toggle-borders',
          label: '<u>B</u>',
          // Built-in command
          command: 'sw-visibility',
        }, {
          id: 'export',
          className: 'btn-open-export',
          label: 'Exp',
          command: 'export-template',
          // For grouping context of buttons in the same panel
          context: 'export-template',
        }
      ],
    });
    window.editor3 = editor3;
  }
}
</script>

<style>
  #gjs3 {
    border: 3px solid #444;
  }
  #basic-panel3 {
    width: 100%;
    display: flex;
    justify-content: center;
    position: initial;
  }
  .content pre {
    padding-top: 0;
    padding-bottom: 0;
    margin-top: 0;
    margin-bottom: 0;
  }
</style>
