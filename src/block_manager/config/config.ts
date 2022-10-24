import EditorModule from '../../editor';
import Block, { BlockProperties } from '../model/Block';

export interface BlockManagerConfig {
  /**
   * Specify the element to use as a container, string (query) or HTMLElement.
   * With the empty value, nothing will be rendered.
   * @default ''
   */
  appendTo?: HTMLElement | string;
  /**
   * Default blocks.
   * @default []
   */
  blocks?: BlockProperties[];
  /**
   * Append blocks to canvas on click.
   * With the `true` value, it will try to append the block to the selected component
   * If there is no selected component, the block will be appened to the wrapper.
   * You can also pass a function to this option, use it as a catch-all for all block
   * clicks and implement a custom logic for each block.
   * @default false
   * @example
   * // Example with a function
   * appendOnClick: (block, editor) => {
   *  if (block.get('id') === 'some-id')
   *    editor.getSelected().append(block.get('content'))
   *  else
   *    editor.getWrapper().append(block.get('content'))
   * }
   */
  appendOnClick?: boolean | ((block: Block, editor: EditorModule, opts: { event: Event }) => void);
  /**
   * Avoid rendering the default block manager UI.
   * More about it here: https://grapesjs.com/docs/modules/Blocks.html#customization
   * @default false
   */
  custom?: boolean;
}

const config: BlockManagerConfig = {
  appendTo: '',
  blocks: [],
  appendOnClick: false,
  custom: false,
};

export default config;
