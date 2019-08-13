<template>
  <div>
    <div class="panel__top" id="panel__top6">
        <div class="panel__basic-actions" id="panel__basic-actions6"></div>
        <div class="panel__switcher" id="panel__switcher6"></div>
    </div>

    <div class="editor-row">
      <div class="editor-canvas">
        <div class="gjs" id="gjs6">
          <h1>Hello World Component!</h1>
        </div>
      </div>
      <div class="panel__right" id="panel__right6">
        <div class="layers-container" id="layers-container6"></div>
        <div class="styles-container" id="styles-container6"></div>
        <div class="traits-container" id="traits-container6"></div>
      </div>
    </div>

    <div id="blocks6"></div>
  </div>
</template>

<script>
import utils from './demos/utils.js';

export default {
  mounted() {
    const editor6 = grapesjs.init(utils.gjsConfigTraits);
    editor6.Panels.addPanel(Object.assign({}, utils.panelTop, {
      el: '#panel__top6'
    }));
    editor6.Panels.addPanel(Object.assign({}, utils.panelBasicActions, {
      el: '#panel__basic-actions6'
    }));
    editor6.Panels.addPanel(Object.assign({}, utils.panelSidebar, {
      el: '#panel__right6'
    }));
    editor6.Panels.addPanel(Object.assign({}, utils.panelSwitcherTraits, {
      el: '#panel__switcher6'
    }));
    window.editor6 = editor6;
  }
}
</script>

<style>
.panel__switcher {
  position: initial;
}
</style>
