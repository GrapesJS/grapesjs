<template>
  <div class="gjs__themed">
    <div class="panel__top" id="panel__top8">
        <div class="panel__basic-actions" id="panel__basic-actions8"></div>
        <div class="panel__devices" id="panel__devices8"></div>
        <div class="panel__switcher" id="panel__switcher8"></div>
    </div>

    <div class="editor-row">
      <div class="editor-canvas">
        <div class="gjs" id="gjs8">
          <h1>Hello World Component!</h1>
        </div>
      </div>
      <div class="panel__right" id="panel__right8">
        <div class="layers-container" id="layers-container8"></div>
        <div class="styles-container" id="styles-container8"></div>
        <div class="traits-container" id="traits-container8"></div>
      </div>
    </div>

    <div id="blocks8"></div>
  </div>
</template>

<script>
import utils from './demos/utils.js';

export default {
  mounted() {
    const editor8 = grapesjs.init(utils.gjsConfigTheme);
    editor8.Panels.addPanel(Object.assign({}, utils.panelTop, {
      el: '#panel__top8'
    }));
    editor8.Panels.addPanel(Object.assign({}, utils.panelBasicActionsIcons, {
      el: '#panel__basic-actions8'
    }));
    editor8.Panels.addPanel(Object.assign({}, utils.panelSidebar, {
      el: '#panel__right8'
    }));
    editor8.Panels.addPanel(Object.assign({}, utils.panelSwitcherTraitsIcons, {
      el: '#panel__switcher8'
    }));
    editor8.Panels.addPanel(Object.assign({}, utils.panelDevicesIcons, {
      el: '#panel__devices8'
    }));
    window.editor8 = editor8;
  }
}
</script>

<style lang="stylus">
.gjs__themed {
  /* Primary color for the background */
  .gjs-one-bg {
    background-color: #78366a;
  }

  /* Secondary color for the text color */
  .gjs-two-color {
    color: rgba(255, 255, 255, 0.7);
  }

  /* Tertiary color for the background */
  .gjs-three-bg {
    background-color: #ec5896;
    color: white;
  }

  /* Quaternary color for the text color */
  .gjs-four-color,
  .gjs-four-color-h:hover {
    color: #ec5896;
  }

  .gjs {
    border: none;
  }
}
</style>
