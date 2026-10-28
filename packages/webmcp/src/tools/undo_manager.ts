import type { WebMcpToolsContext } from '../types';
import { ToolNames } from './names';
import { createTool } from '../utils';

export default ({ editor }: WebMcpToolsContext) => [
  createTool<{ steps?: number }>({
    name: ToolNames.undo,
    title: 'Undo',
    description: 'Undo the last change(s).',
    inputSchema: {
      type: 'object',
      properties: {
        steps: { type: 'integer', minimum: 1, maximum: 100, description: 'Number of steps (default 1)' },
      },
      additionalProperties: false,
    },
    execute: ({ steps = 1 }) => {
      const um = editor.UndoManager;
      let done = 0;
      while (done < steps && um.hasUndo()) {
        um.undo();
        done++;
      }
      return { undone: done, hasUndo: um.hasUndo(), hasRedo: um.hasRedo() };
    },
  }),
  createTool<{ steps?: number }>({
    name: ToolNames.redo,
    title: 'Redo',
    description: 'Redo the last undone change(s).',
    inputSchema: {
      type: 'object',
      properties: {
        steps: { type: 'integer', minimum: 1, maximum: 100, description: 'Number of steps (default 1)' },
      },
      additionalProperties: false,
    },
    execute: ({ steps = 1 }) => {
      const um = editor.UndoManager;
      let done = 0;
      while (done < steps && um.hasRedo()) {
        um.redo();
        done++;
      }
      return { redone: done, hasUndo: um.hasUndo(), hasRedo: um.hasRedo() };
    },
  }),
];
