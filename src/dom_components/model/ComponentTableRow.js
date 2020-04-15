import Component from './Component';

export default Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      tagName: 'tr',
      draggable: ['thead', 'tbody', 'tfoot'],
      droppable: ['th', 'td']
    }
  },
  {
    isComponent: el => el.tagName == 'TR' && true
  }
);
