import { Undo2, Redo2, Trash2, Eraser, Download } from "lucide-react";

interface Props {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onDeleteSelected: () => void;
  hasSelection: boolean;
  onDeleteAll: () => void;
  onDownload: () => void;
}

export default function Toolbar({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onDeleteSelected,
  hasSelection,
  
  onDeleteAll,
  onDownload,
}: Props) {
  const btn =
    "flex flex-1 items-center justify-center gap-2 rounded-full border border-line py-3 text-xs font-semibold text-ink transition-all duration-300 hover:border-brown-dark/50 disabled:opacity-30 disabled:hover:border-line";

  return (
    <div className="space-y-2.5">
      <div className="flex gap-2.5">
        <button onClick={onUndo} disabled={!canUndo} className={btn}>
          <Undo2 size={14} /> Undo
        </button>
        <button onClick={onRedo} disabled={!canRedo} className={btn}>
          <Redo2 size={14} /> Redo
        </button>
      </div>
      <div className="flex gap-2.5">
        <button onClick={onDeleteSelected} disabled={!hasSelection} className={btn}>
          <Trash2 size={14} /> Delete Selected
        </button>
        <button onClick={onDeleteAll} className={btn}>
          <Eraser size={14} /> Delete All
        </button>
      </div>
      <button
        onClick={onDownload}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-brown-dark py-3.5 text-sm font-semibold text-gold transition-transform duration-300 hover:scale-[1.01]"
      >
        <Download size={15} /> Download Preview as PNG
      </button>
    </div>
  );
}
