import Editor from '../../../src/editor/model/Editor';
import DataSourceManager from '../../../src/dataSources';
import { DataSourceProps, DataSourcesEvents } from '../../../src/dataSources/types';
import ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';

describe('DataSourceManager', () => {
  let em: Editor;
  let dsm: DataSourceManager;
  const dsTest: DataSourceProps = {
    id: 'ds1',
    records: [
      { id: 'id1', name: 'Name1' },
      { id: 'id2', name: 'Name2' },
      { id: 'id3', name: 'Name3' },
    ],
  };

  beforeEach(() => {
    em = new Editor({
      mediaCondition: 'max-width',
      avoidInlineStyle: true,
    });
    dsm = em.DataSources;
  });

  afterEach(() => {
    em.destroy();
  });

  test('DataSourceManager exists', () => {
    expect(dsm).toBeTruthy();
  });

  test('add DataSource with records', () => {
    const eventAdd = jest.fn();
    em.on(dsm.events.add, eventAdd);
    const ds = dsm.add(dsTest);
    expect(dsm.getAll().length).toBe(1);
    expect(eventAdd).toBeCalledTimes(1);
    expect(ds.records.length).toBe(3);
  });

  test('get added DataSource', () => {
    const ds = dsm.add(dsTest);
    expect(dsm.get(dsTest.id)).toBe(ds);
  });

  test('remove DataSource', () => {});
  test('update DataSource', () => {});
  test('update DataSource record', () => {});

  describe('DataSource with DataVariable component', () => {
    let fixtures: HTMLElement;
    let cmpRoot: ComponentWrapper;

    beforeEach(() => {
      document.body.innerHTML = '<div id="fixtures"></div>';
      const { Pages, Components } = em;
      Pages.onLoad();
      cmpRoot = Components.getWrapper()!;
      const View = Components.getType('wrapper')!.view;
      const wrapperEl = new View({
        model: cmpRoot,
        config: { ...cmpRoot.config, em },
      });
      wrapperEl.render();
      fixtures = document.body.querySelector('#fixtures')!;
      fixtures.appendChild(wrapperEl.el);
    });

    test('component is properly initiliazed with default value', () => {
      const cmpVar = cmpRoot.append({
        type: 'data-variable',
        value: 'default',
        path: 'ds1.id2.name',
      })[0];
      expect(cmpVar.getEl()?.innerHTML).toBe('default');
    });

    test('component is properly initiliazed with current value', () => {
      dsm.add(dsTest);
      const cmpVar = cmpRoot.append({
        type: 'data-variable',
        value: 'default',
        path: 'ds1.id2.name',
      })[0];
      expect(cmpVar.getEl()?.innerHTML).toBe('Name2');
    });

    test('component is properly updating on record add', () => {
      const ds = dsm.add(dsTest);
      const cmpVar = cmpRoot.append({
        type: 'data-variable',
        value: 'default',
        path: 'ds1[id4]name',
      })[0];
      const eventFn = jest.fn();
      em.on(`${DataSourcesEvents.path}:ds1.id4.name`, eventFn);
      const newRecord = ds.addRecord({ id: 'id4', name: 'Name4' });
      expect(cmpVar.getEl()?.innerHTML).toBe('Name4');
      newRecord.set({ name: 'up' });
      expect(cmpVar.getEl()?.innerHTML).toBe('up');
      expect(eventFn).toBeCalledTimes(1);
    });

    test('component is properly updating on data source add', () => {
      const cmpVar = cmpRoot.append({
        type: 'data-variable',
        value: 'default',
        path: 'ds1.id1.name',
      })[0];
      const ds = dsm.add(dsTest);
      expect(cmpVar.getEl()?.innerHTML).toBe('Name1');
    });

    test('component is properly updating on data source reset', () => {});

    test('component is properly updating on record change', () => {});

    test('component is properly updating on record remove', () => {});

    test('component is properly updating on record reset', () => {});

    test('component is properly updating on its prop changes', () => {});
  });
});
