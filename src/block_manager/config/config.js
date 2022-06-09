export default {
  // Specify the element to use as a container, string (query) or HTMLElement
  // With the empty value, nothing will be rendered
  appendTo: '',

  // Append blocks to canvas on click.
  // With the `true` value, it will try to append the block to the selected component.
  // If there is no selected component, the block will be appened to the wrapper.
  // You can also pass a function to this option, use it as a catch-all for all block
  // clicks and implement a custom logic for each block.
  // appendOnClick: (block, editor) => {
  //   if (block.get('id') === 'some-id')
  //    editor.getSelected().append(block.get('content'))
  //   else
  //    editor.getWrapper().append(block.get('content'))
  // }
  appendOnClick: false,

  // Default blocks
  blocks: [],

  // Avoid rendering the default block manager.
  custom: false,
};
