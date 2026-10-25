import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Filter, AlertTriangle, HelpCircle, 
  Trash2, Edit3, UtensilsCrossed, ArrowUpDown, ChevronDown, Check
} from 'lucide-react';
import { PantryItem, Category } from '../types';
import { getExpiryStatus, formatQuantity } from '../utils/units';

interface MyPantryViewProps {
  pantryItems: PantryItem[];
  onAddItem: () => void;
  onEditItem: (item: PantryItem) => void;
  onDeleteItem: (id: string) => void;
  onAdjustQuantity: (id: string, delta: number) => void;
  onFindRecipesForIngredient: (ingredientName: string) => void;
  onJumpToRecipeMatch: (filterExpiring?: boolean) => void;
}

const CATEGORIES: ('All' | Category)[] = [
  'All',
  'Produce',
  'Dairy & Eggs',
  'Pantry & Grains',
  'Proteins',
  'Canned & Jars',
  'Spices & Oils',
];

export const MyPantryView: React.FC<MyPantryViewProps> = ({
  pantryItems,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onAdjustQuantity,
  onFindRecipesForIngredient,
  onJumpToRecipeMatch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | Category>('All');
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'expiring-soon' | 'unknown' | 'fresh'>('all');
  const [sortBy, setSortBy] = useState<'expiry' | 'name' | 'quantity'>('expiry');

  // Calculate expiring items
  const expiringItems = useMemo(() => {
    return pantryItems.filter((item) => {
      const exp = getExpiryStatus(item.expiryDate, item.isExpiryUnknown);
      return exp.status === 'expiring-soon';
    });
  }, [pantryItems]);

  const unknownExpiryItems = useMemo(() => {
    return pantryItems.filter((item) => {
      const exp = getExpiryStatus(item.expiryDate, item.isExpiryUnknown);
      return exp.status === 'unknown';
    });
  }, [pantryItems]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return pantryItems
      .filter((item) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchNotes = item.notes?.toLowerCase().includes(q);
          if (!matchName && !matchNotes) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }

        // Expiry filter
        if (expiryFilter !== 'all') {
          const exp = getExpiryStatus(item.expiryDate, item.isExpiryUnknown);
          if (expiryFilter === 'expiring-soon' && exp.status !== 'expiring-soon') return false;
          if (expiryFilter === 'unknown' && exp.status !== 'unknown') return false;
          if (expiryFilter === 'fresh' && exp.status !== 'fresh') return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'quantity') {
          return b.quantity - a.quantity;
        }
        // Expiry sorting: Expiring soonest first, then fresh, then unknown at the end
        const expA = getExpiryStatus(a.expiryDate, a.isExpiryUnknown);
        const expB = getExpiryStatus(b.expiryDate, b.isExpiryUnknown);

        if (expA.daysRemaining === null && expB.daysRemaining === null) return 0;
        if (expA.daysRemaining === null) return 1;
        if (expB.daysRemaining === null) return -1;
        return expA.daysRemaining - expB.daysRemaining;
      });
  }, [pantryItems, searchQuery, selectedCategory, expiryFilter, sortBy]);

  return (
    <div className="space-y-4 pb-24 md:pb-12">
      {/* Expiring Soon Alert Banner */}
      {expiringItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-200/80 text-amber-900 rounded-xl shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                {expiringItems.length} ingredient{expiringItems.length > 1 ? 's' : ''} expiring soon!
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                {expiringItems.map((i) => i.name).slice(0, 3).join(', ')}
                {expiringItems.length > 3 ? ` and ${expiringItems.length - 3} more` : ''}.
                Rescue them before they spoil.
              </p>
            </div>
          </div>
          <button
            onClick={() => onJumpToRecipeMatch(true)}
            className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Find Meals with Expiring Items</span>
          </button>
        </div>
      )}

      {/* Controls & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pantry by ingredient or note..."
              className="w-full pl-9 pr-4 py-2 bg-stone-50 rounded-xl border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'expiry' | 'name' | 'quantity')}
                className="appearance-none pl-8 pr-8 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                aria-label="Sort pantry items"
              >
                <option value="expiry">Sort: Expiry Date (Soonest)</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="quantity">Sort: Quantity (Highest)</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3 h-3 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={onAddItem}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <Plus className="w-4 h-4" />
              <span>Add Ingredient</span>
            </button>
          </div>
        </div>

        {/* Filter Segment Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span className="text-stone-400 text-[11px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>

          <div className="inline-flex p-0.5 bg-stone-100 rounded-lg shrink-0">
            <button
              onClick={() => setExpiryFilter('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                expiryFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Items ({pantryItems.length})
            </button>
            <button
              onClick={() => setExpiryFilter('expiring-soon')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                expiryFilter === 'expiring-soon'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-amber-800 hover:text-amber-950'
              }`}
            >
              Expiring ({expiringItems.length})
            </button>
            <button
              onClick={() => setExpiryFilter('unknown')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                expiryFilter === 'unknown' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Unknown Expiry ({unknownExpiryItems.length})
            </button>
          </div>

          <div className="h-4 w-[1px] bg-stone-200 shrink-0" />

          {/* Categories */}
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pantry Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-800">No matching ingredients</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'All' || expiryFilter !== 'all'
              ? 'Try clearing your filters or search term to see all pantry staples.'
              : 'Your pantry is currently empty. Add your first ingredient to start matching recipes!'}
          </p>
          {(searchQuery || selectedCategory !== 'All' || expiryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setExpiryFilter('all');
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredItems.map((item) => {
            const exp = getExpiryStatus(item.expiryDate, item.isExpiryUnknown);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between gap-3 group"
              >
                {/* Header: Name, Category & Location */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-stone-900 tracking-tight leading-snug">
                        {item.name}
                      </h3>
                      {/* Anti-slop zero pill metadata */}
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                        <span>{item.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.storageLocation}</span>
                      </div>
                    </div>

                    {/* Expiry Status Badge */}
                    <div className="shrink-0 text-right">
                      {exp.status === 'expiring-soon' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                          <span>{exp.label}</span>
                        </span>
                      ) : exp.status === 'unknown' ? (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md"
                          title="Expiry date unknown: preserved as shelf-stable without forced expiration"
                        >
                          <HelpCircle className="w-3 h-3 text-stone-400" />
                          <span>Unknown expiry</span>
                        </span>
                      ) : exp.status === 'expired' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded-md">
                          <span>{exp.label}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-500 font-medium">
                          {exp.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-stone-600 mt-2 bg-stone-50 p-2 rounded-lg border border-stone-100">
                      {item.notes}
                    </p>
                  )}
                </div>

                {/* Footer: Quantity Controls & Action Buttons */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
                    <button
                      onClick={() => onAdjustQuantity(item.id, -1)}
                      title="Decrease quantity by 1"
                      aria-label={`Decrease ${item.name} quantity`}
                      className="w-7 h-7 flex items-center justify-center text-stone-700 hover:text-stone-900 hover:bg-stone-200/80 active:bg-stone-300 rounded-lg text-sm font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="min-w-[54px] text-center text-xs font-bold text-stone-900">
                      {formatQuantity(item.quantity)} {item.unit}
                    </span>
                    <button
                      onClick={() => onAdjustQuantity(item.id, 1)}
                      title="Increase quantity by 1"
                      aria-label={`Increase ${item.name} quantity`}
                      className="w-7 h-7 flex items-center justify-center text-stone-700 hover:text-stone-900 hover:bg-stone-200/80 active:bg-stone-300 rounded-lg text-sm font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onFindRecipesForIngredient(item.name)}
                      title={`Find recipes using ${item.name}`}
                      aria-label={`Find recipes using ${item.name}`}
                      className="p-1.5 text-stone-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onEditItem(item)}
                      title={`Edit ${item.name}`}
                      aria-label={`Edit ${item.name}`}
                      className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteItem(item.id)}
                      title={`Remove ${item.name} from pantry`}
                      aria-label={`Remove ${item.name} from pantry`}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
