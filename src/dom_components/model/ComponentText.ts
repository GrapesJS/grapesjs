import Component from './Component';

export default class ComponentText extends Component {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      type: 'text',
      droppable: false,
      editable: true,
    };
  }
}
