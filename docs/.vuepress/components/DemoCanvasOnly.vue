<template src="./demos/DemoCanvasOnly.html">
</template>

<script>
var utils = require('./demos/utils.js');

module.exports = {
  mounted() {
    const editor = grapesjs.init(utils.gjsConfig);
  }
}
</script>

<style src="./demos/DemoCanvasOnly.css">
</style>
