import type { WebMcpTool, WebMcpToolsContext } from '../types';
import componentTools from './components';
import contentTools from './content';
import guideTool from './guide';
import projectTools from './project';
import styleTools from './styles';

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
    ...componentTools(ctx),
    ...styleTools(ctx),
    ...contentTools(ctx),
    ...projectTools(ctx),
  ];
};
