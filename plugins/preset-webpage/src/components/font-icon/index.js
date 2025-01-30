import ezygrapes from 'ezygrapes';
import loadBlocks from './blocks';

export default ezygrapes.plugins.add('gjs-component-font-icon', (editor, opts = {}) => {
  let config = {
    blocks: ['font-icon'],
    defaultStyle: true,
    cssClass: 'fa-solid fa-star',
    ...opts,
  };

  loadBlocks(editor, config);
});
