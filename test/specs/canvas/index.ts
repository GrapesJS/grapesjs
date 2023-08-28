import { CanvasSpotBuiltInTypes } from '../../../src/canvas/model/CanvasSpot';
import EditorModel from '../../../src/editor/model/Editor';

const { Select, Target } = CanvasSpotBuiltInTypes;

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

  describe('Canvas Spots', () => {
    describe('addSpot()', () => {
      test('Add single spot', () => {
        canvas.addSpot({ type: Select });
        const spots = canvas.getSpots();
        expect(spots.length).toBe(1);
        expect(spots[0].type).toBe(Select);
      });

      test('Add multiple spots with the same schema', () => {
        const spot1 = canvas.addSpot({ type: Select });
        // The id of this spot is the same as the one above
        const spot2 = canvas.addSpot({ type: Select });
        const spots = canvas.getSpots();
        expect(spots.length).toBe(1);
        expect(spots[0].type).toBe(Select);
        expect(spot1).toBe(spot2);
      });

      test('Adding multiple spots with the same id, will update the spot', () => {
        const spot1 = canvas.addSpot({ id: 'spot1', type: Select });
        const spot2 = canvas.addSpot({ id: 'spot1', type: Target });
        const spots = canvas.getSpots();
        expect(spots.length).toBe(1);
        expect(spots[0].type).toBe(Target);
        expect(spot1).toBe(spot2);
      });
    });

    describe('Spot Events', () => {
      test('addSpot() triggers proper events', done => {
        const eventAdd = jest.fn();
        const eventAll = jest.fn();
        em.on(canvas.events.spotAdd, eventAdd);
        em.on(canvas.events.spot, eventAll);
        const spot = canvas.addSpot({ type: Select });
        expect(eventAdd).toBeCalledTimes(1);
        expect(eventAdd).toBeCalledWith({ spot });
        setTimeout(() => {
          expect(eventAll).toBeCalledTimes(1);
          done();
        });
      });
    });
  });
});
