<template src="./demos/DemoCanvasOnly.html">
</template>

<script>
import utils from './demos/utils.js';

export default {
  mounted() {
    const editor = grapesjs.init(utils.gjsConfigStart);
  }
}
</script>

<style src="./demos/DemoCanvasOnly.css">
</style>
