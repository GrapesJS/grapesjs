<template>
  <div>
    <div class="panel__top" id="panel__top5">
        <div class="panel__basic-actions" id="panel__basic-actions5"></div>
        <div class="panel__switcher" id="panel__switcher5"></div>
    </div>

    <div class="editor-row">
      <div class="editor-canvas">
        <div class="gjs" id="gjs5">
          <h1>Hello World Component!</h1>
        </div>
      </div>
      <div class="panel__right" id="panel__right5">
        <div class="layers-container" id="layers-container5"></div>
        <div class="styles-container" id="styles-container5"></div>
      </div>
    </div>

    <div id="blocks5"></div>
  </div>
</template>

<script>
import utils from './demos/utils.js';

export default {
  mounted() {
    const editor5 = grapesjs.init(utils.gjsConfigStyle);
    editor5.Panels.addPanel(Object.assign({}, utils.panelTop, {
      el: '#panel__top5'
    }));
    editor5.Panels.addPanel(Object.assign({}, utils.panelBasicActions, {
      el: '#panel__basic-actions5'
    }));
    editor5.Panels.addPanel(Object.assign({}, utils.panelSidebar, {
      el: '#panel__right5'
    }));
    editor5.Panels.addPanel(Object.assign({}, utils.panelSwitcher, {
      el: '#panel__switcher5'
    }));
    window.editor5 = editor5;
  }
}
</script>

<style>
.panel__switcher {
  position: initial;
}
</style>
