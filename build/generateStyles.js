const utils = require('./utils');

let PropertyFactory = require('../src/style_manager/model/PropertyFactory')();
let sectors = [{
  name: 'General',
  open: false,
  buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom']
},{
  name: 'Dimension',
  open: false,
  buildProps: ['width', 'height', 'max-width', 'min-height', 'max-height', 'min-width', 'margin', 'padding'],
},{
  name: 'Typography',
  open: false,
  buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-shadow', 'text-align'],
},{
  name: 'Decorations',
  open: false,
  buildProps: ['border-radius-c', 'background-color', 'border-radius', 'border', 'box-shadow', 'background'],
},{
  name: 'Extra',
  open: false,
  buildProps: ['transition', 'perspective', 'transform', 'overflow', 'cursor'],
}];

sectors.forEach(sector => {
  sector.build = PropertyFactory.build(sector.buildProps);
  delete sector.buildProps;
});

utils.exportJsonToFile('build/dist/grapes-styles.js', sectors);
console.log('Styles exported successfully.');
