<template>
  <div>
    <div class="panel__top" id="panel__top4">
        <div class="panel__basic-actions" id="panel__basic-actions4"></div>
    </div>

    <div class="editor-row">
      <div class="editor-canvas">
        <div class="gjs" id="gjs4">
          <h1>Hello World Component!</h1>
        </div>
      </div>
      <div class="panel__right" id="panel__right4">
        <div id="layers-container"></div>
      </div>
    </div>

    <div id="blocks4"></div>
  </div>
</template>

<script>
import utils from './demos/utils.js';

export default {
  mounted() {
    const editor4 = grapesjs.init(utils.gjsConfigLayers);
    editor4.Panels.addPanel(Object.assign({}, utils.panelTop, {
      el: '#panel__top4'
    }));
    editor4.Panels.addPanel(Object.assign({}, utils.panelBasicActions, {
      el: '#panel__basic-actions4'
    }));
    window.editor4 = editor4;
  }
}
</script>

<style src="./demos/DemoLayers.css">
</style>
