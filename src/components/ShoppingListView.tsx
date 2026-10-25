import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Check, Plus, Trash2, ArrowRight, Share2, 
  PackageCheck, HelpCircle, CheckCircle2, Copy, Sparkles 
} from 'lucide-react';
import { ShoppingItem, Category, Unit } from '../types';
import { formatQuantity } from '../utils/units';

interface ShoppingListViewProps {
  shoppingItems: ShoppingItem[];
  onToggleCheck: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddManualItem: (item: Omit<ShoppingItem, 'id' | 'checked' | 'addedAt'>) => void;
  onMoveCheckedToPantry: () => void;
  onClearChecked: () => void;
  onJumpToPantry: () => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  shoppingItems,
  onToggleCheck,
  onDeleteItem,
  onAddManualItem,
  onMoveCheckedToPantry,
  onClearChecked,
  onJumpToPantry,
}) => {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualQty, setManualQty] = useState('1');
  const [manualUnit, setManualUnit] = useState<Unit>('pcs');
  const [manualCategory, setManualCategory] = useState<Category>('Produce');

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const checkedCount = shoppingItems.filter((i) => i.checked).length;
  const neededCount = shoppingItems.filter((i) => !i.checked).length;

  // Group items by category (aisle)
  const groupedItems = useMemo(() => {
    const groups: Record<Category, ShoppingItem[]> = {} as any;
    shoppingItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [shoppingItems]);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    const qty = parseFloat(manualQty) || 1;

    onAddManualItem({
      name: manualName.trim(),
      quantity: qty,
      unit: manualUnit,
      category: manualCategory,
    });

    setManualName('');
    setManualQty('1');
    setIsAddFormOpen(false);
  };

  const getShareableText = () => {
    let text = `🛒 Pantry Shared Shopping List (${neededCount} needed):\n\n`;
    Object.entries(groupedItems).forEach(([category, items]) => {
      const neededInCat = items.filter((i) => !i.checked);
      if (neededInCat.length > 0) {
        text += `[${category}]\n`;
        neededInCat.forEach((i) => {
          text += `  • ${formatQuantity(i.quantity)} ${i.unit} ${i.name}${i.recipeSource ? ` (for ${i.recipeSource})` : ''}\n`;
        });
        text += `\n`;
      }
    });
    return text.trim();
  };

  const handleCopyList = () => {
    navigator.clipboard.writeText(getShareableText());
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="space-y-4 pb-28 md:pb-12">
      {/* "What happened & What can happen next" Context Card */}
      <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-200/90 text-amber-900 rounded-xl shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-amber-800" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-stone-900">
              Shared Shopping List · What Happened & What’s Next
            </h2>
            <p className="text-xs text-stone-700 mt-1 leading-relaxed">
              <strong>What happened:</strong> Missing ingredients from recipes were automatically added here with their exact required quantities.
            </p>
            <p className="text-xs text-stone-700 mt-0.5 leading-relaxed">
              <strong>What’s next:</strong> Check items off as you buy them at the grocery store. Tap <strong className="text-stone-900">“Move Checked to Pantry”</strong> to instantly replenish your inventory without retyping quantities!
            </p>
          </div>
        </div>

        {checkedCount > 0 && (
          <div className="mt-3 pt-3 border-t border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{checkedCount} item{checkedCount > 1 ? 's' : ''} purchased & ready to restock</span>
            </div>

            <button
              onClick={onMoveCheckedToPantry}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Move Checked to Pantry</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Header & Manual Addition */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-bold text-stone-700">
            <span>{shoppingItems.length} Total items</span>
            <span aria-hidden="true" className="mx-1 text-stone-300">·</span>
            <span className="text-rose-700">{neededCount} Needed</span>
            <span aria-hidden="true" className="mx-1 text-stone-300">·</span>
            <span className="text-emerald-700">{checkedCount} In cart</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsShareModalOpen(true)}
              disabled={shoppingItems.length === 0}
              title="Share or copy formatted shopping list"
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share List</span>
            </button>

            <button
              onClick={() => setIsAddFormOpen(!isAddFormOpen)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Collapsible Manual Item Form */}
        {isAddFormOpen && (
          <form
            onSubmit={handleManualAdd}
            className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-4 gap-2.5 animate-in fade-in duration-150"
          >
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="Item name (e.g. Olive Oil)"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="w-full px-3 py-1.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                autoFocus
              />
            </div>
            <div className="flex gap-1.5">
              <input
                type="number"
                min="0.1"
                step="any"
                value={manualQty}
                onChange={(e) => setManualQty(e.target.value)}
                className="w-16 px-2 py-1.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <select
                value={manualUnit}
                onChange={(e) => setManualUnit(e.target.value as Unit)}
                className="flex-1 px-2 py-1.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="pcs">pcs</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="L">L</option>
                <option value="cups">cups</option>
                <option value="tbsp">tbsp</option>
                <option value="cans">cans</option>
                <option value="cloves">cloves</option>
              </select>
            </div>
            <div className="flex gap-1.5">
              <select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value as Category)}
                className="flex-1 px-2 py-1.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Produce">Produce</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Pantry & Grains">Pantry</option>
                <option value="Proteins">Proteins</option>
                <option value="Spices & Oils">Spices & Oils</option>
              </select>
              <button
                type="submit"
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
              >
                Add
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Shopping List Items by Aisle */}
      {shoppingItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-800">Your shopping list is clear!</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            When you find a recipe with missing ingredients, tap "Add Missing to List" to automatically collect items here.
          </p>
          <button
            onClick={onJumpToPantry}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
          >
            Review pantry items
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedItems).map(([category, items]) => {
            if (items.length === 0) return null;

            return (
              <div
                key={category}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden"
              >
                {/* Category Header */}
                <div className="bg-stone-50/80 px-4 py-2 border-b border-stone-200/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    {category} Aisle ({items.length})
                  </span>
                </div>

                {/* Items in Category */}
                <div className="divide-y divide-stone-100">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                        item.checked ? 'bg-stone-50/40 text-stone-400' : 'hover:bg-amber-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox */}
                        <button
                          onClick={() => onToggleCheck(item.id)}
                          aria-label={`Mark ${item.name} as ${item.checked ? 'unpurchased' : 'purchased'}`}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                            item.checked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-stone-300 hover:border-stone-500 bg-white'
                          }`}
                        >
                          {item.checked && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>

                        {/* Name & Recipe Attribution */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-semibold tracking-tight ${
                                item.checked ? 'line-through text-stone-400' : 'text-stone-900'
                              }`}
                            >
                              {item.name}
                            </span>
                            <span
                              className={`text-xs font-bold px-1.5 py-0.2 rounded ${
                                item.checked
                                  ? 'bg-stone-200/60 text-stone-500'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {formatQuantity(item.quantity)} {item.unit}
                            </span>
                          </div>

                          {item.recipeSource && (
                            <span className="text-[11px] text-stone-500 block truncate mt-0.5">
                              Needed for: <strong className="font-medium text-stone-700">{item.recipeSource}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Bottom actions: Clear Checked */}
          {checkedCount > 0 && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={onClearChecked}
                className="text-xs font-semibold text-stone-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove {checkedCount} checked item{checkedCount > 1 ? 's' : ''}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Share List Modal */}
      {isShareModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-[#FAF7F2] text-stone-900 border border-stone-200 rounded-2xl max-w-md w-full p-5 shadow-2xl relative">
            <h3 className="text-base font-bold font-serif text-stone-900 mb-2">
              Share Shopping List
            </h3>
            <p className="text-xs text-stone-600 mb-3">
              Copy this formatted list to share with roommates or family members via message:
            </p>

            <textarea
              readOnly
              rows={8}
              value={getShareableText()}
              className="w-full p-3 font-mono text-xs bg-white rounded-xl border border-stone-300 text-stone-800 focus:outline-none"
            />

            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="text-xs text-emerald-700 font-medium">
                {copiedNotification ? '✓ Copied to clipboard!' : ''}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-3.5 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-200/50"
                >
                  Close
                </button>
                <button
                  onClick={handleCopyList}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy List</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
