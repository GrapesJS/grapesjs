import DataSourceManager from '../../../src/data_sources';
import ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../src/data_sources/model/DataVariable';
import { DataSourceProps } from '../../../src/data_sources/types';
import { setupTestEditor } from '../../common';
import EditorModel from '../../../src/editor/model/Editor';
import htmlFormat from 'pretty';

async function getComments() {
  const url = 'https://jsonplaceholder.typicode.com/posts/1/comments';
  const response = await fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }

  return response.json();
}

// Comment https://github.com/GrapesJS/grapesjs/discussions/5956#discussioncomment-10559499
describe('JsonPlaceholder Usage', () => {
  let em: EditorModel;
  let dsm: DataSourceManager;
  let cmpRoot: ComponentWrapper;

  beforeEach(() => {
    ({ em, dsm, cmpRoot } = setupTestEditor());
  });

  afterEach(() => {
    em.destroy();
  });

  test('should render a list of comments from jsonplaceholder api', async () => {
    const comments = await getComments();
    const dataSource: DataSourceProps = {
      id: 'comments',
      records: comments,
    };
    dsm.add(dataSource);

    dsm
      .get('comments')
      .getRecords()
      .forEach((record) => {
        cmpRoot.append({
          tagName: 'div',
          components: [
            {
              tagName: 'h4',
              components: [
                {
                  type: DataVariableType,
                  defaultValue: 'default',
                  path: `comments.${record?.id}.name`,
                },
              ],
            },
            {
              tagName: 'p',
              components: [
                {
                  type: DataVariableType,
                  defaultValue: 'default',
                  path: `comments.${record?.id}.id`,
                },
              ],
            },
            {
              tagName: 'p',
              components: [
                {
                  type: DataVariableType,
                  defaultValue: 'default',
                  path: `comments.${record?.id}.body`,
                },
              ],
            },
          ],
        });
      });

    const html = cmpRoot.toHTML();
    expect(htmlFormat(html)).toMatchSnapshot();

    const components = cmpRoot.components();
    expect(components.length).toBe(comments.length);

    components.forEach((cmp, i) => {
      expect(cmp.get('components')?.length).toBe(3);
      const record = comments[i];
      const title = cmp.get('components')?.at(0);
      const id = cmp.get('components')?.at(1);
      const body = cmp.get('components')?.at(2);

      expect(title?.getInnerHTML()).toContain(record.name);
      expect(id?.getInnerHTML()).toContain(record.id.toString());
      expect(body?.getInnerHTML()).toContain(record.body);
    });
  });
});
