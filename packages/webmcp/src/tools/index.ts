import type { WebMcpTool, WebMcpToolsContext } from '../types';
import assetTools from './assets';
import blockTools from './blocks';
import componentTools from './components';
import cssTools from './css';
import deviceTools from './devices';
import editorTools from './editor';
import guideTool from './guide';
import pageTools from './pages';
import traitTools from './traits';
import undoManagerTools from './undo_manager';

/**
 * Create the default tool catalog, bound to the editor.
 * Tool names are returned without the prefix (`toolPrefix` is only used to reference tools in descriptions).
 */
export const createDefaultTools = (
  opts: Pick<WebMcpToolsContext, 'editor'> & Partial<WebMcpToolsContext>,
): WebMcpTool[] => {
  const ctx: WebMcpToolsContext = { defaultLimit: 50, toolPrefix: '', ...opts };

  return [
    ...(ctx.instructions ? [guideTool(ctx)] : []),
    ...editorTools(ctx),
    ...componentTools(ctx),
    ...cssTools(ctx),
    ...blockTools(ctx),
    ...traitTools(ctx),
    ...pageTools(ctx),
    ...deviceTools(ctx),
    ...assetTools(ctx),
    ...undoManagerTools(ctx),
  ];
};
