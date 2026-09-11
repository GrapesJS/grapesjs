import Editor from '../../../src/editor';
import type {
  ProjectUpdateAddOperation,
  ProjectUpdateChangeOperation,
  ProjectUpdateRemoveOperation,
  ProjectUpdateResetOperation,
  ProjectUpdateTransaction
} from '../../../src/undo_manager/ProjectUpdates';

const waitForProjectUpdate = (editor: Editor) =>
  new Promise<ProjectUpdateTransaction>((resolve) => editor.once('project:update', resolve));

const waitForTask = () => new Promise((resolve) => setTimeout(resolve));

describe('Project updates', () => {
  let editor: Editor;

  beforeEach(async () => {
    editor = new Editor();
    editor.getModel().loadOnStart();
    await waitForTask();
  });

  afterEach(() => {
    editor.destroy();
  });

  test('emits one change operation for a component property update', async () => {
    const component = editor.getWrapper()!.append({ type: 'text', content: 'Before' })[0]!;
    await waitForTask();

    const nextTransaction = waitForProjectUpdate(editor);
    component.set('tagName', 'section');
    const transaction = await nextTransaction;

    expect(transaction.id).toMatch(/^project-update-/);
    expect(transaction.operations).toHaveLength(1);
    const operation = transaction.operations[0] as ProjectUpdateChangeOperation;
    expect(operation).toMatchObject({
      type: 'change',
      target: 'component',
      changed: { tagName: 'section' },
      previous: { tagName: 'div' }
    });
    expect(operation.model).toBe(component);
    expect(operation.collection).toBe(component.collection);
  });

  test('retains raw add remove and reset data', async () => {
    const wrapper = editor.getWrapper()!;
    const addOptions = { at: 0 };
    const nextAdd = waitForProjectUpdate(editor);
    const component = wrapper.append({ type: 'text', content: 'Added' }, addOptions)[0]!;
    const addTransaction = await nextAdd;
    const addOperation = addTransaction.operations[0] as ProjectUpdateAddOperation;

    expect(addOperation).toMatchObject({
      type: 'add',
      target: 'component',
      options: addOptions
    });
    expect(addOperation.model).toBe(component);
    expect(addOperation.collection).toBe(wrapper.components());

    const removeOptions = { temporary: true };
    const nextRemove = waitForProjectUpdate(editor);
    component.remove(removeOptions);
    const removeTransaction = await nextRemove;
    const removeOperation = removeTransaction.operations[0] as ProjectUpdateRemoveOperation;

    expect(removeOperation).toMatchObject({
      type: 'remove',
      target: 'component',
      options: removeOptions
    });
    expect(removeOperation.model).toBe(component);
    expect(removeOperation.collection).toBe(wrapper.components());

    const resetOptions = { silent: false };
    const nextReset = waitForProjectUpdate(editor);
    wrapper.components().reset([], resetOptions);
    const resetTransaction = await nextReset;
    const resetOperation = resetTransaction.operations[0] as ProjectUpdateResetOperation;

    expect(resetOperation).toMatchObject({
      type: 'reset',
      target: 'component',
      options: resetOptions,
      models: []
    });
    expect(resetOperation.collection).toBe(wrapper.components());
  });

  test('groups a page move temporary remove and add in order', async () => {
    const page = editor.Pages.add({ id: 'page-2' });
    await waitForTask();

    const nextTransaction = waitForProjectUpdate(editor);
    editor.Pages.move(page!, { at: 0 });
    const transaction = await nextTransaction;

    const removeIndex = transaction.operations.findIndex(operation => operation.type === 'remove');
    const addIndex = transaction.operations.findIndex(operation => operation.type === 'add');
    const removeOperation = transaction.operations[removeIndex] as ProjectUpdateRemoveOperation;
    const addOperation = transaction.operations[addIndex] as ProjectUpdateAddOperation;

    expect(removeOperation).toMatchObject({ type: 'remove', target: 'page', options: { temporary: true } });
    expect(removeOperation.model).toBe(page);
    expect(addOperation).toMatchObject({ type: 'add', target: 'page', options: { at: 0 } });
    expect(addOperation.model).toBe(page);
    expect(removeIndex).toBeLessThan(addIndex);
  });

  test('tracks nested component, class, frame, and CSS collections', async () => {
    const wrapper = editor.getWrapper()!;
    const component = wrapper.append({ type: 'default' })[0]!;
    await waitForTask();

    const nextComponent = waitForProjectUpdate(editor);
    const child = component.append({ type: 'text', content: 'Child' })[0]!;
    const componentTransaction = await nextComponent;
    const componentOperation = componentTransaction.operations.find(
      (operation): operation is ProjectUpdateAddOperation => operation.type === 'add' && operation.model === child
    )!;
    expect(componentOperation).toMatchObject({ type: 'add', target: 'component' });
    expect(componentOperation.collection).toBe(component.components());

    const nextClass = waitForProjectUpdate(editor);
    component.setClass('button');
    const classTransaction = await nextClass;
    expect(classTransaction.operations).toEqual(expect.arrayContaining([expect.objectContaining({ target: 'selector' })]));

    const frame = editor.Canvas.addFrame({ id: 'frame-2' });
    await waitForTask();
    const nextFrame = waitForProjectUpdate(editor);
    frame.set('width', '480px');
    const frameTransaction = await nextFrame;
    const frameOperation = frameTransaction.operations.find(
      (operation): operation is ProjectUpdateChangeOperation => operation.type === 'change' && operation.model === frame
    )!;
    expect(frameOperation).toMatchObject({ type: 'change', target: 'frame' });

    const nextRule = waitForProjectUpdate(editor);
    const rule = editor.Css.addRules('.button { color: red; }')[0]!;
    const ruleTransaction = await nextRule;
    const ruleOperation = ruleTransaction.operations.find(
      (operation): operation is ProjectUpdateAddOperation => operation.type === 'add' && operation.model === rule
    )!;
    expect(ruleOperation).toMatchObject({ type: 'add', target: 'cssRule' });
  });
});
