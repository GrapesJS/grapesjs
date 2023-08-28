import EditorModel from '../../../src/editor/model/Editor';

describe('Canvas', () => {
  let em: EditorModel;
  let canvas: EditorModel['Canvas'];

  beforeEach(() => {
    em = new EditorModel({});
    canvas = em.Canvas;
  });

  afterEach(() => {
    em.destroy();
  });

  test('Canvas module exists', () => {
    expect(canvas).toBeTruthy();
  });
});
