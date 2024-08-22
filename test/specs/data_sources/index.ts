import Editor from '../../../src/editor/model/Editor';
import DataSourceManager from '../../../src/data_sources';
import ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';
import { DataSourceProps } from '../../../src/data_sources/model/DataSource';

describe('DataSourceManager', () => {
  let em: Editor;
  let dsm: DataSourceManager;
  let fixtures: HTMLElement;
  let cmpRoot: ComponentWrapper;
  const dsTest: DataSourceProps = {
    id: 'ds1',
    records: [
      { id: 'id1', name: 'Name1' },
      { id: 'id2', name: 'Name2' },
      { id: 'id3', name: 'Name3' },
    ],
  };

  const addDataSource = () => dsm.add(dsTest);

  beforeEach(() => {
    em = new Editor({
      mediaCondition: 'max-width',
      avoidInlineStyle: true,
    });
    dsm = em.DataSources;
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

  afterEach(() => {
    em.destroy();
  });

  test('DataSourceManager exists', () => {
    expect(dsm).toBeTruthy();
  });

  test('add DataSource with records', () => {
    const eventAdd = jest.fn();
    em.on(dsm.events.add, eventAdd);
    const ds = addDataSource();
    expect(dsm.getAll().length).toBe(1);
    expect(eventAdd).toBeCalledTimes(1);
    expect(ds.getRecords().length).toBe(3);
  });

  test('get added DataSource', () => {
    const ds = addDataSource();
    expect(dsm.get(dsTest.id)).toBe(ds);
  });

  test('remove DataSource', () => {
    const event = jest.fn();
    em.on(dsm.events.remove, event);
    const ds = addDataSource();
    dsm.remove('ds1');
    expect(dsm.getAll().length).toBe(0);
    expect(event).toBeCalledTimes(1);
    expect(event).toBeCalledWith(ds, expect.any(Object));
  });
});
