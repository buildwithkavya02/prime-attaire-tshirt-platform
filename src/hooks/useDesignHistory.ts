import { useCallback, useRef, useState } from "react";
import type { DesignLayer } from "../types";

export interface EditorState {
  color: string;
  layers: DesignLayer[];
}

const MAX_HISTORY = 50;

export function useDesignHistory(initial: EditorState) {
  const [state, setState] = useState<EditorState>(initial);
  const past = useRef<EditorState[]>([]);
  const future = useRef<EditorState[]>([]);
  const [, forceRender] = useState(0);

  const commit = useCallback(
    (updater: (prev: EditorState) => EditorState, recordHistory = true) => {
      setState((prev) => {
        const next = updater(prev);
        if (recordHistory) {
          past.current = [...past.current, prev].slice(-MAX_HISTORY);
          future.current = [];
        }
        return next;
      });
      forceRender((n) => n + 1);
    },
    []
  );

  const undo = useCallback(() => {
    if (past.current.length === 0) return;
    setState((current) => {
      const prev = past.current[past.current.length - 1];
      past.current = past.current.slice(0, -1);
      future.current = [current, ...future.current];
      return prev;
    });
    forceRender((n) => n + 1);
  }, []);

  const redo = useCallback(() => {
    if (future.current.length === 0) return;
    setState((current) => {
      const next = future.current[0];
      future.current = future.current.slice(1);
      past.current = [...past.current, current];
      return next;
    });
    forceRender((n) => n + 1);
  }, []);

  const reset = useCallback((next: EditorState) => {
    past.current = [];
    future.current = [];
    setState(next);
    forceRender((n) => n + 1);
  }, []);

  const checkpoint = useCallback(() => {
    setState((current) => {
      past.current = [...past.current, current].slice(-MAX_HISTORY);
      future.current = [];
      return current;
    });
    forceRender((n) => n + 1);
  }, []);

  return {
    state,
    commit,
    undo,
    redo,
    reset,
    checkpoint,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}
