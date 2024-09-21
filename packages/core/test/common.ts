import Editor from '../src/editor';

// DocEl + Head + Wrapper
export const DEFAULT_CMPS = 3;

export function setupTestEditor() {
  const editor = new Editor({
    mediaCondition: 'max-width',
    avoidInlineStyle: true,
  });
  const em = editor.getModel();
  const dsm = em.DataSources;
  document.body.innerHTML = '<div id="fixtures"></div>';
  const { Pages, Components } = em;
  Pages.onLoad();
  const cmpRoot = Components.getWrapper()!;
  const View = Components.getType('wrapper')!.view;
  const wrapperEl = new View({
    model: cmpRoot,
    config: { ...cmpRoot.config, em },
  });
  wrapperEl.render();
  const fixtures = document.body.querySelector('#fixtures')!;
  fixtures.appendChild(wrapperEl.el);
  return { editor, em, dsm, cmpRoot, fixtures: fixtures as HTMLElement };
}

export function flattenHTML(html: string) {
  return html.replace(/>\s+|\s+</g, (m) => m.trim());
}

// Filter out the unique ids and selectors replaced with 'data-variable-id'
// Makes the snapshot more stable
export function filterObjectForSnapshot(obj: any, parentKey: string = ''): any {
  const result: any = {};

  for (const key in obj) {
    if (key === 'id') {
      result[key] = 'data-variable-id';
      continue;
    }

    if (key === 'selectors') {
      result[key] = obj[key].map(() => 'data-variable-id');
      continue;
    }

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (Array.isArray(obj[key])) {
        result[key] = obj[key].map((item: any) =>
          typeof item === 'object' ? filterObjectForSnapshot(item, key) : item,
        );
      } else {
        result[key] = filterObjectForSnapshot(obj[key], key);
      }
    } else {
      result[key] = obj[key];
    }
  }

  return result;
}
