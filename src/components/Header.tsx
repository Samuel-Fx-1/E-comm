import React from 'react';
import { ChefHat, Info, CheckCircle2, RotateCw } from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  totalPantryCount: number;
  expiringPantryCount: number;
  readyRecipeCount: number;
  neededShoppingCount: number;
  onOpenPrototypeInfo: () => void;
  onOpenAcceptanceCheck: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  totalPantryCount,
  expiringPantryCount,
  readyRecipeCount,
  neededShoppingCount,
  onOpenPrototypeInfo,
  onOpenAcceptanceCheck,
  onResetData,
}) => {
  const getViewSummary = () => {
    switch (currentView) {
      case 'pantry':
        return (
          <span>
            {totalPantryCount} items {expiringPantryCount > 0 ? `· ${expiringPantryCount} expiring soon` : ''}
          </span>
        );
      case 'recipes':
        return (
          <span>
            {readyRecipeCount} ready to cook · matched from pantry
          </span>
        );
      case 'shopping':
        return (
          <span>
            {neededShoppingCount} items needed · shared list
          </span>
        );
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'pantry':
        return 'My Pantry';
      case 'recipes':
        return 'Recipe Match';
      case 'shopping':
        return 'Shopping List';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Active Context */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-rose-600 shadow-xs shrink-0">
            <ChefHat className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-stone-900 tracking-tight leading-tight">
                Pantry
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-amber-200/70 text-amber-900 rounded border border-amber-300/60">
                Sample Data
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500 truncate">
              <span className="font-medium text-stone-700">{getViewTitle()}</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="truncate">{getViewSummary()}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenAcceptanceCheck}
            title="Task Acceptance Check Audit"
            aria-label="Inspect acceptance criteria check"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 rounded-lg border border-rose-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Acceptance Check</span>
          </button>

          <button
            onClick={onOpenPrototypeInfo}
            aria-label="Prototype architecture and integrations"
            title="Prototype architecture & backend integrations"
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={onResetData}
            aria-label="Reset sample pantry data"
            title="Reset to default sample data"
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
