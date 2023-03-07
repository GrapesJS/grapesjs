import ezygrapes from 'ezygrapes';

export default ezygrapes.plugins.add('gjs-blocks-basic', (editor, opts = {}) => {
  const config = {
    blocks: [
      'column1',
      'column2',
      'column3',
      'column3-7',
      'text',
      'link',
      'image',
      'video',
      'map'
    ],
    flexGrid: 0,
    stylePrefix: 'gjs-',
    addBasicStyle: true,
    category: 'Basic',
    labelColumn1: '1 Column',
    labelColumn2: '2 Columns',
    labelColumn3: '3 Columns',
    labelColumn37: '2 Columns 3/7',
    labelText: 'Text',
    labelLink: 'Link',
    labelImage: 'Image',
    labelVideo: 'Video',
    labelMap: 'Map',
    rowHeight: 75,
    ...opts
  };

  // Add blocks
  const loadBlocks = require('./blocks');
  loadBlocks.default(editor, config);
});
