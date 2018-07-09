<template>
  <div>
    <div id="gjs2">
      <h1>Hello World Component!</h1>
    </div>
    <div id="blocks2"></div>
  </div>
</template>

<script>
module.exports = {
  mounted() {
    window.editor2 = grapesjs.init({
      container: '#gjs2',
      fromElement: true,
      height: '300px',
      storageManager: { type: null },
      panels: { defaults: [] },
      // ...
      blockManager: {
        appendTo: '#blocks2',
        blocks: [
          {
            id: 'text', // id is mandatory
            label: '<b>Text</b>',
            attributes: { class:'gjs-text-block' },
            content: '<div>Insert your text here</div>',
          }, {
            id: 'image',
            label: 'Image',
            content: { type: 'image' },
          }
        ]
      },
    });
  }
}
</script>

<style>
</style>
