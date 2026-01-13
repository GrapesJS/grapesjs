import { DataRecord, DataSourceManager } from '../../../../src';
import { DataCollectionStateType } from '../../../../src/data_sources/model/data_collection/types';
import { DataVariableProps, DataVariableType } from '../../../../src/data_sources/model/DataVariable';
import { DataCollectionKeys, DataComponentTypes } from '../../../../src/data_sources/types';
import Component from '../../../../src/dom_components/model/Component';
import ComponentHead from '../../../../src/dom_components/model/ComponentHead';
import ComponentWrapper from '../../../../src/dom_components/model/ComponentWrapper';
import Editor from '../../../../src/editor';
import EditorModel from '../../../../src/editor/model/Editor';
import { setupTestEditor } from '../../../common';

describe('ComponentWrapper', () => {
  const keyRootData = DataCollectionKeys.rootData;
  let em: Editor;

  beforeEach(() => {
    em = new Editor({ avoidDefaults: true });
    em.Pages.onLoad();
  });

  describe('.clone', () => {
    test('clones the component and returns a new instance for head and document element', () => {
      const originalComponent = em.Pages.getSelected()?.getMainComponent();
      const clonedComponent = originalComponent?.clone();
      em.Pages.add(
        {
          id: 'PAGE_ID',
          clonedComponent,
        },
        {
          select: true,
        },
      );
      const newPageComponent = em.Pages.get('PAGE_ID')?.getMainComponent();

      expect(clonedComponent?.head).toBeInstanceOf(ComponentHead);
      expect(clonedComponent?.head.cid).not.toEqual(originalComponent?.head.cid);

      expect(clonedComponent?.docEl).toBeInstanceOf(Component);
      expect(clonedComponent?.docEl.cid).not.toEqual(originalComponent?.docEl.cid);
      expect(newPageComponent?.head.cid).not.toEqual(originalComponent?.head.cid);
    });
  });

  describe('ComponentWrapper with DataResolver', () => {
    let em: EditorModel;
    let dsm: DataSourceManager;
    let wrapper: ComponentWrapper;
    let firstRecord: DataRecord;

    const contentDataSourceId = 'contentDataSource';
    const blogDataSourceId = 'blogs';
    const firstBlog = { id: 'blog1', title: 'How to Test Components' };
    const blogsData = [
      firstBlog,
      { id: 'blog2', title: 'Refactoring for Clarity' },
      { id: 'blog3', title: 'Async Patterns in TS' },
    ];

    const productsById = {
      product1: { title: 'Laptop' },
      product2: { title: 'Smartphone' },
    };

    beforeEach(() => {
      ({ em, dsm } = setupTestEditor({ withCanvas: true }));
      wrapper = em.getWrapper() as ComponentWrapper;

      dsm.add({
        id: contentDataSourceId,
        records: [
          {
            id: 'blogs',
            data: blogsData,
          },
          {
            id: 'productsById',
            data: productsById,
          },
        ],
      });

      dsm.add({
        id: blogDataSourceId,
        records: blogsData,
      });

      firstRecord = em.DataSources.get(contentDataSourceId).getRecord('blogs')!;
    });

    afterEach(() => {
      em.destroy();
    });

    const createDataResolver = (path: string): DataVariableProps => ({
      type: DataVariableType,
      path,
    });

    const appendChildWithTitle = (path: string = 'title') =>
      wrapper.append({
        type: 'default',
        title: {
          type: DataComponentTypes.variable,
          variableType: DataCollectionStateType.currentItem,
          collectionId: keyRootData,
          path,
        },
        components: {
          tagName: 'span',
          type: DataComponentTypes.variable,
          dataResolver: { collectionId: keyRootData, variableType: DataCollectionStateType.currentItem, path },
        },
      })[0];

    test('children reflect resolved value from dataResolver', () => {
      wrapper.setDataResolver(createDataResolver('contentDataSource.blogs.data'));
      wrapper.setResolverCurrentItem(0);
      const child = appendChildWithTitle();

      expect(child.get('title')).toBe(blogsData[0].title);

      firstRecord.set('data', [{ id: 'blog1', title: 'New Blog Title' }]);
      expect(child.get('title')).toBe('New Blog Title');
    });

    test('children update collectionStateMap on wrapper.setDataResolver', () => {
      const child = appendChildWithTitle();
      wrapper.setDataResolver(createDataResolver('contentDataSource.blogs.data'));
      wrapper.setResolverCurrentItem(0);

      expect(child.get('title')).toBe(blogsData[0].title);

      firstRecord.set('data', [{ id: 'blog1', title: 'Updated Title' }]);
      expect(child.get('title')).toBe('Updated Title');
    });

    test('wrapper should handle objects as collection state', () => {
      wrapper.setDataResolver(createDataResolver('contentDataSource.productsById.data'));
      wrapper.setResolverCurrentItem('product2');
      const child = appendChildWithTitle('title');

      expect(child.get('title')).toBe(productsById.product2.title);
    });

    test('wrapper should handle default data source records', () => {
      wrapper.setDataResolver(createDataResolver(blogDataSourceId));

      const child = appendChildWithTitle('title');
      expect(child.get('title')).toBe(blogsData[0].title);
      expect(child.getInnerHTML()).toBe(`<span>${blogsData[0].title}</span>`);

      const eventUpdate = jest.fn();
      em.on(em.events.updateBefore, eventUpdate);

      wrapper.setResolverCurrentItem(1);
      expect(child.get('title')).toBe(blogsData[1].title);
      expect(child.getInnerHTML()).toBe(`<span>${blogsData[1].title}</span>`);

      wrapper.setResolverCurrentItem(blogsData[2].id);
      expect(child.get('title')).toBe(blogsData[2].title);
      expect(child.getInnerHTML()).toBe(`<span>${blogsData[2].title}</span>`);

      // No update events are expected
      expect(eventUpdate).toHaveBeenCalledTimes(0);
    });
  });
});
