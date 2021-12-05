import loadTraits from './traits';
import loadBlocks from './blocks';
import loadComponents from './components';

export default (editor, opts = {}) => {

  const config = {
    blocks: ['form', 'input', 'textarea', 'select', 'button', 'label', 'checkbox', 'radio'],
    ...opts
  };

  loadComponents(editor, config);
  loadTraits(editor, config);
  loadBlocks(editor, config);
};
