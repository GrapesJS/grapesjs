import { setupTestEditor } from '../../../common';
import { YT_REFERRER_POLICY } from '../../../../src/dom_components/model/ComponentVideo';

describe('ComponentVideoView', () => {
  const videoId = 'jNQXAC9IVRw';
  let testEditor: ReturnType<typeof setupTestEditor>;

  beforeEach(() => {
    testEditor = setupTestEditor();
  });

  const appendVideo = (provider: 'yt' | 'ytnc') =>
    testEditor.editor.getWrapper()!.append({
      type: 'video',
      provider,
      videoId,
    })[0];

  afterEach(() => {
    testEditor.editor.destroy();
  });

  describe('YouTube', () => {
    test.each([
      ['yt', 'https://www.youtube.com/embed/'],
      ['ytnc', 'https://www.youtube-nocookie.com/embed/'],
    ] as const)('renders %s with the required referrer policy', (provider, srcPrefix) => {
      const component = appendVideo(provider);
      const iframe = component.getEl()?.querySelector('iframe');

      expect(component.getAttributes().referrerpolicy).toEqual(YT_REFERRER_POLICY);
      expect(component.toHTML()).toContain(`referrerpolicy="${YT_REFERRER_POLICY}"`);
      expect(iframe?.getAttribute('referrerpolicy')).toEqual(YT_REFERRER_POLICY);
      expect(iframe?.getAttribute('src')).toContain(srcPrefix);
    });

    test('removes the default referrer policy when switching away from YouTube', () => {
      const component = appendVideo('yt');

      component.set('provider', 'vi');

      expect(component.getAttributes().referrerpolicy).toBeUndefined();
    });
  });
});
