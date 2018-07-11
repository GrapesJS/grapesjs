<template>
  <div>
    <div class="basic-panel" id="basic-panel3"></div>
    <div class="gjs" id="gjs3">
      <h1>Hello World Component!</h1>
    </div>
    <div id="blocks3"></div>
  </div>
</template>

<script>
module.exports = {
  mounted() {
    const utils = require('./demos/utils.js');
    const editor3 = grapesjs.init(utils.gjsConfigPanels);
    editor3.Panels.addPanel(Object.assign({}, utils.customPanel, {
      el: '#basic-panel3'
    }));
    window.editor3 = editor3;
  }
}
</script>

<style>
  .basic-panel {
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
