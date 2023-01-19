import Component from './Component';
import { toLowerCase } from '../../utils/mixins';

const type = 'tbody';

export default class ComponentTableBody extends Component {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      type,
      tagName: type,
      draggable: ['table'],
      droppable: ['tr'],
      columns: 1,
      rows: 1,
    };
  }

  initialize(props: any, opts: any) {
    super.initialize(props, opts);
    const components = this.get('components')!;
    let columns = this.get('columns');
    let rows = this.get('rows');

    // Init components if empty
    if (!components.length) {
      const rowsToAdd = [];

      while (rows--) {
        const columnsToAdd = [];
        let clm = columns;

        while (clm--) {
          columnsToAdd.push({
            type: 'cell',
            classes: ['cell'],
          });
        }

        rowsToAdd.push({
          type: 'row',
          classes: ['row'],
          components: columnsToAdd,
        });
      }

      components.add(rowsToAdd);
    }
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === type;
  }
}
