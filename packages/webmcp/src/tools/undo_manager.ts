import * as z from 'zod/mini';
import type { WebMcpToolsContext } from '../types';
import { ToolNames } from './names';
import { createTool } from '../utils';

export default ({ editor }: WebMcpToolsContext) => [
  createTool({
    name: ToolNames.undo,
    title: 'Undo',
    description: 'Undo the last change(s).',
    input: z.strictObject({
      steps: z.optional(z.int().check(z.minimum(1), z.maximum(100), z.describe('Number of steps (default 1)'))),
    }),
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
  createTool({
    name: ToolNames.redo,
    title: 'Redo',
    description: 'Redo the last undone change(s).',
    input: z.strictObject({
      steps: z.optional(z.int().check(z.minimum(1), z.maximum(100), z.describe('Number of steps (default 1)'))),
    }),
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
