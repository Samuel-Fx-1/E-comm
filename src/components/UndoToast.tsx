import React from 'react';
import { RotateCcw, X } from 'lucide-react';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({ message, onUndo, onDismiss }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-stone-900 text-stone-100 px-4 py-3 rounded-xl shadow-xl border border-stone-700 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-center gap-2 text-sm font-medium truncate">
        <span>{message}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onUndo}
          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Undo</span>
        </button>
        <button
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="p-1 text-stone-400 hover:text-stone-200 active:text-stone-100 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
