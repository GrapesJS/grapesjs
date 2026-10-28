import type { WebMcpToolsContext } from '../types';
import { ToolNames } from './names';
import { createTool } from '../utils';

/**
 * WebMCP has no page-level instructions (the agent only sees tools),
 * so project instructions are exposed through a read-only tool.
 */
export default ({ instructions }: WebMcpToolsContext) =>
  createTool({
    name: ToolNames.getEditorGuide,
    title: 'Get editor guide',
    description:
      'Get the project-specific instructions to follow when editing this page. Call it before making changes.',
    annotations: { readOnlyHint: true },
    execute: () => ({ instructions }),
  });
