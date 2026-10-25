import React from 'react';
import { Package, UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { ViewMode } from '../types';

interface NavigationProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  pantryCount: number;
  expiringSoonCount: number;
  readyRecipeCount: number;
  shoppingNeededCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onSelectView,
  pantryCount,
  expiringSoonCount,
  readyRecipeCount,
  shoppingNeededCount,
}) => {
  const tabs = [
    {
      id: 'pantry' as ViewMode,
      label: 'My Pantry',
      icon: Package,
      badge: expiringSoonCount > 0 ? `${expiringSoonCount} exp` : `${pantryCount}`,
      badgeColor: expiringSoonCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-stone-200/80 text-stone-700',
    },
    {
      id: 'recipes' as ViewMode,
      label: 'Recipe Match',
      icon: UtensilsCrossed,
      badge: readyRecipeCount > 0 ? `${readyRecipeCount} ready` : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'shopping' as ViewMode,
      label: 'Shopping List',
      icon: ShoppingBag,
      badge: shoppingNeededCount > 0 ? `${shoppingNeededCount}` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
  ];

  return (
    <>
      {/* Desktop / Tablet Top Tab Bar */}
      <nav
        aria-label="Primary views navigation"
        className="hidden md:block bg-stone-100/80 border-b border-stone-200 px-4 py-2"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="inline-flex p-1 bg-stone-200/70 rounded-xl space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectView(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                    isActive
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-600' : 'text-stone-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${tab.badgeColor}`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-stone-500 font-medium">
            Inputs & filter drafts auto-preserved across views
          </span>
        </div>
      </nav>

      {/* Mobile Fixed Bottom Bar (thumb-accessible with mobile safe areas) */}
      <nav
        aria-label="Mobile primary views navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-stone-200/90 pb-[env(safe-area-inset-bottom,0.75rem)] pt-1 px-3 shadow-lg"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectView(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center py-2 px-3 min-w-[76px] rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  isActive ? 'text-rose-700 font-bold' : 'text-stone-500 hover:text-stone-800 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  {tab.badge && (
                    <span
                      className={`absolute -top-1.5 -right-3 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-white ${tab.badgeColor}`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-1 tracking-tight leading-none whitespace-nowrap">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-6 h-0.5 bg-rose-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
