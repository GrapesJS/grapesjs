const utils = require('./utils');

let PropertyFactory = require('../src/style_manager/model/PropertyFactory')();

let sectors = [{
  name: 'Text',
  open: false,
  //buildProps: ['font-family', 'font-size', 'font-weight', 'font-style', 'font-size-adjust', 'color', 'text-transform', 'text-decoration', 'letter-spacing', 'word-spacing', 'line-height', 'text-align', 'vertical-align', 'direction', 'text-shadow-h', 'text-shadow-v', 'text-shadow-blur', 'text-shadow-color']
  buildProps: ['font-family', 'font-size', 'font-weight', 'font-style', 'font-size-adjust', 'color', 'text-transform', 'text-decoration', 'letter-spacing', 'word-spacing', 'line-height', 'text-align', 'vertical-align', 'direction']
},{
  name: 'Background',
  open: false,
  buildProps: ['background-color', 'background-image', 'background-repeat', 'background-position', 'background-attachment', 'opacity', 'background-size']
},{
  name: 'Dimensions',
  open: false,
  buildProps: ['width', 'height', 'top', 'right', 'bottom', 'left', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'box-shadow', 'max-width', 'min-width', 'min-height', 'max-height', 'box-shadow-h', 'box-shadow-v', 'box-shadow-blur', 'box-shadow-spread', 'box-shadow-color', 'box-shadow-type']
},{
  name: 'Border',
  open: false,
  buildProps: ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style', 'border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius']
},{
  name: 'Layout',
  open: false,
  buildProps: ['position', 'display', 'visibility', 'z-index', 'overflow-x', 'overflow-y', 'white-space', 'clip', 'float', 'clear', 'overflow']
},{
  name: 'Other',
  open: false,
  buildProps: ['cursor', 'list-style-image', 'list-style-position', 'list-style-type', 'marker-offset', 'transition-property', 'transition-duration', 'transition-timing-function', 'perspective', 'transform-rotate-x', 'transform-rotate-y', 'transform-rotate-z', 'transform-scale-x', 'transform-scale-y', 'transform-scale-z']
}];

sectors.forEach(sector => {
  sector.build = PropertyFactory.build(sector.buildProps);
  delete sector.buildProps;
});

utils.exportJsonToFile('build/dist/grapes-styles.js', sectors);
console.log('Styles exported successfully.');
