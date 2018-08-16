<template>
  <div>
    <div class="gjs" id="gjs2">
      <h1>Hello World Component!</h1>
    </div>
    <div id="blocks2"></div>
  </div>
</template>

<script>
module.exports = {
  mounted() {
    const utils = require('./demos/utils.js');
    window.editor2 = grapesjs.init(utils.gjsConfigBlocks);
  }
}
</script>

<style>
  .gjs {
    border: 3px solid #444;
  }
  .gjs-block {
    width: auto;
    height: auto;
    min-height: auto;
  }
</style>
