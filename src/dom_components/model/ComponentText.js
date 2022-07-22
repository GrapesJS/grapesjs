import Component from './Component';

export default class ComponentText extends Component {
  get defaults() {
    return {
      ...super.defaults,
      type: 'text',
      droppable: false,
      editable: true,
    };
  }
}
