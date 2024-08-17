import Editor from '../../../src/editor/model/Editor';
import DataSourceManager from '../../../src/data_sources';
import { DataSourceProps } from '../../../src/data_sources/types';
import ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../src/data_sources/model/DataVariable';

describe('DataSource Serialization', () => {
  let em: Editor;
  let dsm: DataSourceManager;
  let fixtures: HTMLElement;
  let cmpRoot: ComponentWrapper;
  const datasource: DataSourceProps = {
    id: 'component-serialization',
    records: [
      { id: 'id1', content: 'Hello World' },
      { id: 'id2', color: 'red' },
    ],
  };

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
    dsm.add(datasource);
  });

  afterEach(() => {
    em.destroy();
  });

  test('component .getHtml', () => {
    const cmp = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      components: [
        {
          type: DataVariableType,
          value: 'default',
          path: `${datasource.id}.id1.content`,
        },
      ],
    })[0];

    const el = cmp.getEl();
    expect(el?.innerHTML).toContain('Hello World');

    const html = em.getHtml();
    expect(html).toMatchInlineSnapshot('"<body><h1><div>Hello World</div></h1></body>"');
  });
});
