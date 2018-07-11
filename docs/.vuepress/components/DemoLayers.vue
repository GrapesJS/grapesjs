<template>
  <div>
    <div class="basic-panel" id="basic-panel4"></div>

    <div class="editor-row">
      <div class="editor-canvas">
        <div class="gjs" id="gjs4">
          <h1>Hello World Component!</h1>
        </div>
      </div>
      <div class="editor-sidebar" id="editor-sidebar">
        <div id="layers-container"></div>
      </div>
    </div>

    <div id="blocks4"></div>
  </div>
</template>

<script>
module.exports = {
  mounted() {
    const utils = require('./demos/utils.js');
    const editor4 = grapesjs.init(utils.gjsConfigLayers);
    editor4.Panels.addPanel(Object.assign({}, utils.customPanel, {
      el: '#basic-panel4'
    }));
    window.editor4 = editor4;
  }
}
</script>

<style>
.editor-row {
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  flex-wrap: nowrap;
}
.editor-canvas {
  flex-grow: 1;
}
.editor-sidebar {
  flex-basis: 230px;
  position: relative;
}
</style>
