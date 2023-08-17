import Component from '../../../../src/dom_components/model/Component';
import ComponentImage from '../../../../src/dom_components/model/ComponentImage';
import Editor from '../../../../src/editor/model/Editor';
import { buildBase64UrlFromSvg } from '../../../../src/utils/mixins';

describe('ComponentImage', () => {
  let componentImage: ComponentImage;
  let dcomp: Editor['Components'];
  let compOpts: any;
  let em: Editor;

  beforeEach(() => {
    em = new Editor({ avoidDefaults: true });
    dcomp = em.Components;
    em.get('PageManager').onLoad();
    compOpts = {
      em,
      componentTypes: dcomp.componentTypes,
      domc: dcomp,
    };
    componentImage = new ComponentImage({}, compOpts);
  });

  describe('.initialize', () => {
    test('when a base 64 default image is provided, it uses the default image', () => {
      let imageUrl = buildBase64UrlFromSvg(ComponentImage.prototype.defaults.src);
      let componentImage = new ComponentImage({ attributes: { src: imageUrl } }, { ...compOpts });
      expect(componentImage.get('src')).toEqual(ComponentImage.prototype.defaults.src);
      expect(componentImage.isDefaultSrc()).toBeTruthy();
    });

    test('when a image url is provided, it uses the image url', () => {
      let imageUrl = 'https://mock.com/image.png';
      let componentImage = new ComponentImage({ attributes: { src: imageUrl } }, { ...compOpts });
      expect(componentImage.get('src')).toEqual(imageUrl);
      expect(componentImage.isDefaultSrc()).toBeFalsy();
    });
  });

  test('`src` property is defined after initializing', () => {
    expect(componentImage.get('src')).toBeDefined();
  });

  describe('.getAttrToHTML', () => {
    let getSrcResultSpy: ReturnType<typeof spyOn>;
    const fakeAttributes = {};

    beforeEach(() => {
      spyOn(Component.prototype, 'getAttrToHTML').and.returnValue(fakeAttributes);
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
