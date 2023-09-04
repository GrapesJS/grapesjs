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

    describe('getSpots()', () => {
      test('Get all spots', () => {
        canvas.addSpot({ type: Select });
        canvas.addSpot({ type: Target });
        const spots = canvas.getSpots();
        expect(spots.length).toBe(2);
        expect(spots[0].type).toBe(Select);
        expect(spots[1].type).toBe(Target);
      });

      test('Get spots by props', () => {
        canvas.addSpot({ type: Select });
        canvas.addSpot({ type: Target });
        canvas.addSpot({ id: 'target2', type: Target });
        const spotsSelect = canvas.getSpots({ type: Select });
        const spotsTarget = canvas.getSpots({ type: Target });
        expect(spotsSelect.length).toBe(1);
        expect(spotsTarget.length).toBe(2);
      });

      test('Get spot by id', () => {
        canvas.addSpot({ type: Select });
        canvas.addSpot({ type: Target });
        const spotT2 = canvas.addSpot({ id: 'target2', type: Target });

        const spotsTarget = canvas.getSpots({ id: 'target2', type: Select });
        expect(spotsTarget.length).toBe(1);
        expect(spotsTarget[0]).toBe(spotT2);
      });
    });

    describe('removeSpots()', () => {
      test('Remove all spots', () => {
        canvas.addSpot({ type: Select });
        canvas.addSpot({ type: Target });
        canvas.removeSpots();
        const spots = canvas.getSpots();
        expect(spots.length).toBe(0);
      });

      test('Remove spots by props', () => {
        canvas.addSpot({ type: Select });
        canvas.addSpot({ type: Target });
        canvas.addSpot({ id: 'target2', type: Target });
        canvas.removeSpots({ type: Target });
        const spots = canvas.getSpots();
        expect(spots.length).toBe(1);
      });

      test('Remove spots by id', () => {
        canvas.addSpot({ type: Select });
        canvas.addSpot({ type: Target });
        canvas.addSpot({ id: 'target2', type: Target });
        canvas.removeSpots({ id: 'target2' });
        const spots = canvas.getSpots();
        expect(spots.length).toBe(2);
      });

      test('Remove spots by array of spots', () => {
        const spotSelect = canvas.addSpot({ type: Select });
        const spotTarget1 = canvas.addSpot({ type: Target });
        const spotTarget2 = canvas.addSpot({ id: 'target2', type: Target });
        canvas.removeSpots([spotTarget1, spotTarget2]);
        const spots = canvas.getSpots();
        expect(spots.length).toBe(1);
        expect(spots[0]).toBe(spotSelect);
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

      test('Update of spots triggers proper events', done => {
        const eventUpdate = jest.fn();
        const eventAll = jest.fn();
        em.on(canvas.events.spotUpdate, eventUpdate);
        em.on(canvas.events.spot, eventAll);
        const spot = canvas.addSpot({ id: 'spot1', type: Select });
        canvas.addSpot({ id: 'spot1', type: Target });

        expect(eventUpdate).toBeCalledTimes(1);
        expect(eventUpdate).toBeCalledWith({ spot });
        setTimeout(() => {
          expect(eventAll).toBeCalledTimes(1);
          done();
        });
      });

      test('removeSpot() triggers proper events', done => {
        const eventRemove = jest.fn();
        const eventAll = jest.fn();
        em.on(canvas.events.spotRemove, eventRemove);
        em.on(canvas.events.spot, eventAll);
        const spot = canvas.addSpot({ type: Select });
        canvas.removeSpots();
        expect(eventRemove).toBeCalledTimes(1);
        expect(eventRemove).toBeCalledWith({ spot });
        setTimeout(() => {
          expect(eventAll).toBeCalledTimes(1);
          done();
        });
      });
    });
  });
});
