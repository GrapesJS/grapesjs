<template src="./demos/DemoCanvasOnly.html">
</template>

<script>
module.exports = {
  mounted() {
    /*
    import('./demos/DemoCanvasOnly.js').then(res => {
      console.log('import res', res);
    });
    */
    const editor = grapesjs.init({
      // Indicate where to init the editor. It's also possible to pass an HTMLElement
      container: '#gjs',
      // Get the content for the canvas direectly from the element
      // As an alternative we could use: `components: '<h1>Hello World Component!</h1>'`,
      fromElement: true,
      // Height of the editor
      height: '300px',
      // Disable the storage manager for the moment
      storageManager: { type: null },
      // Avoid any default panel
      panels: { defaults: [] },
    });
  }
}
</script>

<style src="./demos/DemoCanvasOnly.css">
</style>
