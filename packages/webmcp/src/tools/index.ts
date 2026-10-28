import type { WebMcpTool, WebMcpToolsContext } from '../types';
import componentTools from './components';
import contentTools from './content';
import projectTools from './project';
import styleTools from './styles';

/**
 * Create the default tool catalog, bound to the editor.
 * Tool names are returned without the prefix.
 */
export const createDefaultTools = (
  opts: Omit<WebMcpToolsContext, 'defaultLimit'> & { defaultLimit?: number },
): WebMcpTool[] => {
  const ctx: WebMcpToolsContext = { defaultLimit: 50, ...opts };

  return [...componentTools(ctx), ...styleTools(ctx), ...contentTools(ctx), ...projectTools(ctx)];
};
