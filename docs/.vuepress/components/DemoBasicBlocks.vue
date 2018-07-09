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
      width: 'auto',
      storageManager: { type: null },
      panels: { defaults: [] },
      // ...
      blockManager: {
        appendTo: '#blocks2',
        blocks: [
          {
            id: 'section', // id is mandatory
            label: '<b>Section</b>',
            attributes: { class:'gjs-block-section' },
            content: `<section>
              <h1>This is a simple title</h1>
              <div>This is just a Lorem text: Lorem ipsum dolor sit amet, consectetur adipiscing elit</div>
            </section>`,
          }, {
            id: 'text',
            label: 'Text',
            content: '<div data-gjs-type="text">Insert your text here</div>',
          }, {
            id: 'image',
            label: 'Image',
            // Select the component once dropped in canavas
            select: true,
            // You can pass components as a JSON instead of a simple HTML string,
            // in this case we also use a defined component type `image`
            content: { type: 'image' },
            // This triggers `active` on dropped components
            activate: true,
          }
        ]
      },
    });
  }
}
</script>

<style>
  #gjs2 {
    border: 3px solid #444;
  }
  .gjs-block {
    width: auto;
    height: auto;
    min-height: auto;
  }
</style>
