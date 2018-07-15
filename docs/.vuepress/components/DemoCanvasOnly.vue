<template src="./demos/DemoCanvasOnly.html">
</template>

<script>
module.exports = {
  mounted() {
    const utils = require('./demos/utils.js');
    const editor = grapesjs.init(utils.gjsConfigStart);
  }
}
</script>

<style src="./demos/DemoCanvasOnly.css">
</style>
