import Editor from '../../../../src/editor/model/Editor';
import Sector from '../../../../src/style_manager/model/Sector';

describe('Sectors', () => {
  describe('Sector visibility', () => {
    let em: Editor;
    let sm: Editor['Styles'];
    let domc: Editor['Components'];
    let s1: Sector;
    let s2: Sector;

    beforeEach(() => {
      em = new Editor({
        mediaCondition: 'max-width',
        avoidInlineStyle: true,
        styleManager: {
          sectors: [
            {
              id: 'sector-1',
              name: 'First sector',
              properties: ['width', 'min-width', 'height', 'min-height'],
            },
            {
              id: 'sector-2',
              name: 'Second sector',
              properties: ['color', 'font-size'],
            },
          ],
        },
      });
      domc = em.Components;
      sm = em.Styles;
      em.Pages.onLoad();
      sm.onLoad();
      s1 = sm.getSector('sector-1');
      s2 = sm.getSector('sector-2');
    });

    afterEach(() => {
      em.destroy();
    });

    test('All sectors should exist', () => {
      [s1, s2].forEach((sector) => expect(sector).toBeTruthy());
    });

    test('All sectors and properties are visible by default', () => {
      [s1, s2].forEach((sector) => {
        expect(sector.isVisible()).toBe(true);
        sector.getProperties().forEach((prop) => {
          expect(prop.isVisible()).toBe(true);
        });
      });
    });

    test('Sectors are properly enabled with stylable component', () => {
      const stylable = ['width', 'height'];
      const cmp = domc.addComponent({ stylable });
      em.setSelected(cmp);
      sm.__upSel();

      expect(s1.isVisible()).toBe(true);
      expect(s2.isVisible()).toBe(false);
      s1.getProperties().forEach((prop) => {
        const isVisible = stylable.indexOf(prop.getName()) >= 0;
        expect(prop.isVisible()).toBe(isVisible);
      });
      s2.getProperties().forEach((prop) => {
        expect(prop.isVisible()).toBe(false);
      });
    });

    test('Sectors are properly enabled with unstylable component', () => {
      const unstylable = ['color'];
      const cmp = domc.addComponent({ unstylable });
      em.setSelected(cmp);
      sm.__upSel();

      expect(s1.isVisible()).toBe(true);
      expect(s2.isVisible()).toBe(true);
      s1.getProperties().forEach((prop) => {
        expect(prop.isVisible()).toBe(true);
      });
      s2.getProperties().forEach((prop) => {
        const isVisible = unstylable.indexOf(prop.getName()) < 0;
        expect(prop.isVisible()).toBe(isVisible);
      });
    });
  });
});
