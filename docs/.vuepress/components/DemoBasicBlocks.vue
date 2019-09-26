<template>
  <div>
    <div class="gjs" id="gjs2">
      <h1>Hello World Component!</h1>
    </div>
    <div id="blocks2"></div>
  </div>
</template>

<script>
import utils from './demos/utils.js';

export default {
  mounted() {
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
