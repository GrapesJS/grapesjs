import Component from 'dom_components/model/Component';
import ComponentImage from 'dom_components/model/ComponentImage';

describe('ComponentImage', () => {
  let componentImage;

  beforeEach(() => {
    componentImage = new ComponentImage();
  });

  describe('.getAttrToHTML', () => {
    let getSrcResultSpy;
    const fakeAttributes = {};

    beforeEach(() => {
      spyOn(Component.prototype, 'getAttrToHTML').and.returnValue(
        fakeAttributes
      );
      getSrcResultSpy = spyOn(componentImage, 'getSrcResult');
    });

    test('it should fill the `src` property with the result of `getSrcResult` if defined', () => {
      let attributes = componentImage.getAttrToHTML();
      expect(getSrcResultSpy).toHaveBeenCalled();
      expect(attributes).toEqual(fakeAttributes);

      let fakeSrcResult = 'fakeSrcResult';
      getSrcResultSpy.and.returnValue(fakeSrcResult);
      attributes = componentImage.getAttrToHTML();
      expect(getSrcResultSpy).toHaveBeenCalledTimes(2);
      expect(attributes).toEqual({ src: fakeSrcResult });
    });
  });
});
