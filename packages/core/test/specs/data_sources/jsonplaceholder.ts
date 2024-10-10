import DataSourceManager from '../../../src/data_sources';
import ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../src/data_sources/model/DataVariable';
import { DataSourceProps } from '../../../src/data_sources/types';
import { setupTestEditor } from '../../common';
import EditorModel from '../../../src/editor/model/Editor';
import htmlFormat from 'pretty';

function getComments() {
  const json = [
    {
      postId: 1,
      id: 1,
      name: 'id labore ex et quam laborum',
      email: 'Eliseo@gardner.biz',
      body: 'laudantium enim quasi est quidem magnam voluptate ipsam eos\ntempora quo necessitatibus\ndolor quam autem quasi\nreiciendis et nam sapiente accusantium',
    },
    {
      postId: 1,
      id: 2,
      name: 'quo vero reiciendis velit similique earum',
      email: 'Jayne_Kuhic@sydney.com',
      body: 'est natus enim nihil est dolore omnis voluptatem numquam\net omnis occaecati quod ullam at\nvoluptatem error expedita pariatur\nnihil sint nostrum voluptatem reiciendis et',
    },
    {
      postId: 1,
      id: 3,
      name: 'odio adipisci rerum aut animi',
      email: 'Nikita@garfield.biz',
      body: 'quia molestiae reprehenderit quasi aspernatur\naut expedita occaecati aliquam eveniet laudantium\nomnis quibusdam delectus saepe quia accusamus maiores nam est\ncum et ducimus et vero voluptates excepturi deleniti ratione',
    },
    {
      postId: 1,
      id: 4,
      name: 'alias odio sit',
      email: 'Lew@alysha.tv',
      body: 'non et atque\noccaecati deserunt quas accusantium unde odit nobis qui voluptatem\nquia voluptas consequuntur itaque dolor\net qui rerum deleniti ut occaecati',
    },
    {
      postId: 1,
      id: 5,
      name: 'vero eaque aliquid doloribus et culpa',
      email: 'Hayden@althea.biz',
      body: 'harum non quasi et ratione\ntempore iure ex voluptates in ratione\nharum architecto fugit inventore cupiditate\nvoluptates magni quo et',
    },
  ];

  return json;
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
    const comments = getComments();
    const dataSource: DataSourceProps = {
      id: 'comments',
      records: comments as any,
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
