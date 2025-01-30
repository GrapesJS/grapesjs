import ezygrapes from 'ezygrapes';
import loadBlocks from './blocks';

export default ezygrapes.plugins.add('gjs-blocks-basic', (editor, opts = {}) => {
  const config = {
    blocks: [
      'column1',
      'column2',
      'column3',
      'column4',
      'column4-8',
      'text',
      'link',
      'image',
      'video',
      'embed',
      'map'
    ],
    category: 'basic',
    ...opts,
  };

  // Add blocks
  loadBlocks(editor, config);
});
