import Component from './Component';

export default class ComponentText extends Component {}

ComponentText.prototype.defaults = {
  ...Component.getDefaults(),
  type: 'text',
  droppable: false,
  editable: true,
};
