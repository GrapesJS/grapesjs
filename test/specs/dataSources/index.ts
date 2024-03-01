import Editor from '../../../src/editor/model/Editor';
import DataSourceManager from '../../../src/dataSources';
import { DataSourceProps, DataSourcesEvents } from '../../../src/dataSources/types';
import ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';
import ComponentDataVariable from '../../../src/dom_components/model/ComponentDataVariable';

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
    expect(ds.getRecords().length).toBe(3);
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

    const addDataVariable = (path = 'ds1.id1.name') =>
      cmpRoot.append<ComponentDataVariable>({
        type: 'data-variable',
        value: 'default',
        path,
      })[0];

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
      const cmpVar = addDataVariable();
      expect(cmpVar.getEl()?.innerHTML).toBe('default');
    });

    test('component is properly initiliazed with current value', () => {
      dsm.add(dsTest);
      const cmpVar = addDataVariable();
      expect(cmpVar.getEl()?.innerHTML).toBe('Name1');
    });

    test.todo('component is properly updating on its property changes');

    describe('DataSource changes', () => {
      test('component is properly updating on data source add', () => {
        const eventFn = jest.fn();
        em.on(DataSourcesEvents.add, eventFn);
        const cmpVar = addDataVariable();
        const ds = dsm.add(dsTest);
        expect(eventFn).toBeCalledTimes(1);
        expect(eventFn).toBeCalledWith(ds, expect.any(Object));
        expect(cmpVar.getEl()?.innerHTML).toBe('Name1');
      });

      test('component is properly updating on data source reset', () => {
        dsm.add(dsTest);
        const cmpVar = addDataVariable();
        const el = cmpVar.getEl()!;
        expect(el.innerHTML).toBe('Name1');
        dsm.all.reset();
        expect(el.innerHTML).toBe('default');
      });

      test('component is properly updating on data source remove', () => {
        const eventFn = jest.fn();
        em.on(DataSourcesEvents.remove, eventFn);
        const ds = dsm.add(dsTest);
        const cmpVar = addDataVariable();
        const el = cmpVar.getEl()!;
        dsm.remove('ds1');
        expect(eventFn).toBeCalledTimes(1);
        expect(eventFn).toBeCalledWith(ds, expect.any(Object));
        expect(el.innerHTML).toBe('default');
      });
    });

    describe('DataRecord changes', () => {
      test('component is properly updating on record add', () => {
        const ds = dsm.add(dsTest);
        const cmpVar = addDataVariable('ds1[id4]name');
        const eventFn = jest.fn();
        em.on(`${DataSourcesEvents.path}:ds1.id4.name`, eventFn);
        const newRecord = ds.addRecord({ id: 'id4', name: 'Name4' });
        expect(cmpVar.getEl()?.innerHTML).toBe('Name4');
        newRecord.set({ name: 'up' });
        expect(cmpVar.getEl()?.innerHTML).toBe('up');
        expect(eventFn).toBeCalledTimes(1);
      });

      test('component is properly updating on record change', () => {
        const ds = dsm.add(dsTest);
        const cmpVar = addDataVariable();
        const el = cmpVar.getEl()!;
        ds.getRecord('id1')?.set({ name: 'Name1-UP' });
        expect(el.innerHTML).toBe('Name1-UP');
      });

      test('component is properly updating on record remove', () => {
        const ds = dsm.add(dsTest);
        const cmpVar = addDataVariable();
        const el = cmpVar.getEl()!;
        ds.removeRecord('id1');
        expect(el.innerHTML).toBe('default');
      });

      test('component is properly updating on record reset', () => {
        const ds = dsm.add(dsTest);
        const cmpVar = addDataVariable();
        const el = cmpVar.getEl()!;
        ds.records.reset();
        expect(el.innerHTML).toBe('default');
      });
    });
  });
});
