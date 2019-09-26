<template>
  <div>
    <div class="panel__top" id="panel__top7">
        <div class="panel__basic-actions" id="panel__basic-actions7"></div>
        <div class="panel__devices" id="panel__devices7"></div>
        <div class="panel__switcher" id="panel__switcher7"></div>
    </div>

    <div class="editor-row">
      <div class="editor-canvas">
        <div class="gjs" id="gjs7">
          <h1>Hello World Component!</h1>
        </div>
      </div>
      <div class="panel__right" id="panel__right7">
        <div class="layers-container" id="layers-container7"></div>
        <div class="styles-container" id="styles-container7"></div>
        <div class="traits-container" id="traits-container7"></div>
      </div>
    </div>

    <div id="blocks7"></div>
  </div>
</template>

<script>
import utils from './demos/utils.js';

export default {
  mounted() {
    const editor7 = grapesjs.init(utils.gjsConfigDevices);
    editor7.Panels.addPanel(Object.assign({}, utils.panelTop, {
      el: '#panel__top7'
    }));
    editor7.Panels.addPanel(Object.assign({}, utils.panelBasicActions, {
      el: '#panel__basic-actions7'
    }));
    editor7.Panels.addPanel(Object.assign({}, utils.panelSidebar, {
      el: '#panel__right7'
    }));
    editor7.Panels.addPanel(Object.assign({}, utils.panelSwitcherTraits, {
      el: '#panel__switcher7'
    }));
    editor7.Panels.addPanel(Object.assign({}, utils.panelDevices, {
      el: '#panel__devices7'
    }));
    window.editor7 = editor7;
  }
}
</script>

<style>
.panel__devices {
  position: initial;
}
</style>
