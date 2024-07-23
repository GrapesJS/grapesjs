import { CommandObject } from './CommandAbstract';
const GRAPESJS_COMPONENT_FORMAT = 'application/x-grapesjs-component';

export default {
  async run(ed) {
    const selectedModels = [...ed.getSelectedAll()].map(md => md.delegate?.copy?.(md) || md).filter(Boolean);

    if (selectedModels.length) {
      const clipboardData = selectedModels.map(model => {
        return model.toJSON();
      });

      const clipboardDataString = JSON.stringify({
        format: GRAPESJS_COMPONENT_FORMAT,
        data: clipboardData,
      });

      try {
        const file = new File([clipboardDataString], 'item.json', { type: 'application/json' });
        const data = [new ClipboardItem({ 'web application/json': file })];

        await navigator.clipboard.write(data);
      } catch (err) {
        console.error('Failed to write to clipboard:', err);
      }
    }
  },
} as CommandObject;
