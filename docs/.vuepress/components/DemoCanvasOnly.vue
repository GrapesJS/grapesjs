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

    var editor = grapesjs.init({
      container: '#gjs',
      fromElement: true,
      height: '300px',
    });
  }
}
</script>
