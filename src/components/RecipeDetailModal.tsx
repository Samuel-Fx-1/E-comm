import React, { useState } from 'react';
import { 
  ArrowLeft, Clock, Users, Flame, CheckCircle2, AlertTriangle, 
  PackageX, Plus, ShoppingBag, Utensils, AlertCircle 
} from 'lucide-react';
import { RecipeMatchResult, RecipeIngredient } from '../types';
import { formatQuantity } from '../utils/units';

interface RecipeDetailModalProps {
  matchResult: RecipeMatchResult | null;
  onClose: () => void;
  onAddMissingToShoppingList: (ingredients: { ingredient: RecipeIngredient; missingQty: number }[], recipeTitle: string) => void;
  onCookRecipe: (matchResult: RecipeMatchResult) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  matchResult,
  onClose,
  onAddMissingToShoppingList,
  onCookRecipe,
}) => {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');
  const [isAddedToastVisible, setIsAddedToastVisible] = useState(false);

  if (!matchResult) return null;

  const { recipe, ingredientStatuses, missingCount, incompatibleCount, matchScore } = matchResult;

  // Collect missing or partial items to add to shopping list
  const missingItemsToAdd = ingredientStatuses
    .filter((s) => s.status === 'unavailable' || s.status === 'partial')
    .map((s) => ({
      ingredient: s.recipeIngredient,
      missingQty: s.missingQuantity,
    }));

  const handleAddMissing = () => {
    if (missingItemsToAdd.length === 0) return;
    onAddMissingToShoppingList(missingItemsToAdd, recipe.title);
    setIsAddedToastVisible(true);
    setTimeout(() => setIsAddedToastVisible(false), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-detail-title"
      className="fixed inset-0 z-50 bg-stone-950/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      <div className="bg-[#FAF7F2] text-stone-900 border border-stone-200 rounded-t-2xl sm:rounded-2xl max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl relative animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Sticky Header with Explicit Back Action */}
        <div className="sticky top-0 bg-[#FAF7F2]/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-stone-200 flex items-center justify-between z-10 shrink-0">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-950 px-2.5 py-1.5 rounded-lg hover:bg-stone-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Recipe Match</span>
          </button>

          {/* Context pill in header */}
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                matchScore === 100
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/60'
                  : 'bg-amber-100 text-amber-900 border border-amber-300/60'
              }`}
            >
              {matchScore}% Pantry Match
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Hero Image & Title */}
          <div className="space-y-3">
            <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden shadow-sm">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  {recipe.category}
                </span>
                <h2 id="recipe-detail-title" className="text-xl sm:text-2xl font-bold font-serif leading-tight mt-0.5">
                  {recipe.title}
                </h2>
              </div>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed">
              {recipe.subtitle}
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 pt-1 border-b border-stone-200/80 pb-3">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-4 h-4 text-stone-400" />
                {recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins ({recipe.prepTimeMinutes}m prep · {recipe.cookTimeMinutes}m cook)
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Users className="w-4 h-4 text-stone-400" />
                {recipe.servings} servings
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Flame className="w-4 h-4 text-stone-400" />
                {recipe.caloriesPerServing} kcal/serving
              </span>
            </div>
          </div>

          {/* Segmented Tab: Ingredients vs Instructions */}
          <div className="flex p-1 bg-stone-200/70 rounded-xl space-x-1">
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'ingredients'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Ingredients Breakdown ({ingredientStatuses.length})
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'instructions'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Step-by-Step Instructions ({recipe.instructions.length})
            </button>
          </div>

          {/* Tab 1: Ingredients Breakdown */}
          {activeTab === 'ingredients' && (
            <div className="space-y-4">
              {/* Acceptance Check / Boundary Alerts if any */}
              {incompatibleCount > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <strong className="font-bold">Unit Compatibility Notice:</strong> This recipe calls for ingredients in a different unit family than your pantry records. The app protects your pantry quantity from arbitrary conversion.
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {ingredientStatuses.map((item, idx) => {
                  const req = item.recipeIngredient;
                  const isSufficient = item.status === 'sufficient';
                  const isUnavailable = item.status === 'unavailable';
                  const isIncompatible = item.status === 'incompatible-units';
                  const isPartial = item.status === 'partial';

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs transition-colors ${
                        isSufficient
                          ? 'bg-white border-stone-200/90'
                          : isIncompatible
                          ? 'bg-amber-50/60 border-amber-200'
                          : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          {isSufficient ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : isIncompatible ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          ) : (
                            <PackageX className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          )}

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900 text-sm">
                                {req.name}
                              </span>
                              <span className="font-semibold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded text-[11px]">
                                {formatQuantity(req.quantity)} {req.unit}
                              </span>
                            </div>

                            {/* Status Explanation */}
                            <div className="mt-1 text-xs">
                              {isSufficient && item.matchedPantryItem && (
                                <span className="text-emerald-700 font-medium">
                                  In pantry: {formatQuantity(item.matchedPantryItem.quantity)} {item.matchedPantryItem.unit}
                                </span>
                              )}

                              {isPartial && item.matchedPantryItem && (
                                <span className="text-amber-800 font-medium">
                                  Have {formatQuantity(item.matchedPantryItem.quantity)} {item.matchedPantryItem.unit} · Need {formatQuantity(item.missingQuantity)} {item.missingUnit} more
                                </span>
                              )}

                              {isIncompatible && (
                                <span className="text-amber-800 font-medium leading-relaxed block">
                                  {item.warningNote}
                                </span>
                              )}

                              {isUnavailable && (
                                <span className="text-rose-700 font-medium">
                                  Unavailable in pantry (0 in stock). Required: {formatQuantity(req.quantity)} {req.unit}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Label */}
                        <div className="shrink-0 text-right">
                          {isSufficient && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Ready
                            </span>
                          )}
                          {isPartial && (
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                              Short by {formatQuantity(item.missingQuantity)} {item.missingUnit}
                            </span>
                          )}
                          {isIncompatible && (
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                              Unit Mismatch
                            </span>
                          )}
                          {isUnavailable && (
                            <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                              Missing
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Instructions */}
          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <ol className="space-y-3.5">
                {recipe.instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-stone-700 leading-relaxed bg-white p-3.5 rounded-xl border border-stone-200/80">
                    <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1">{step}</div>
                  </li>
                ))}
              </ol>

              {recipe.tips && (
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <strong className="font-bold">Chef’s Pantry Tip:</strong> {recipe.tips}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Feedback Toast */}
        {isAddedToastVisible && (
          <div className="mx-6 mb-2 p-2.5 bg-emerald-700 text-white text-xs font-semibold rounded-xl text-center shadow-lg animate-in fade-in duration-200">
            Added {missingItemsToAdd.length} missing item{missingItemsToAdd.length > 1 ? 's' : ''} to Shopping List!
          </div>
        )}

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 bg-[#FAF7F2]/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 z-10 shrink-0">
          <div className="text-xs text-stone-600 hidden sm:block">
            {missingCount === 0
              ? 'All ingredients in stock!'
              : `${missingCount} missing item${missingCount > 1 ? 's' : ''} can be added to shopping list`}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {missingItemsToAdd.length > 0 && (
              <button
                onClick={handleAddMissing}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
              >
                <ShoppingBag className="w-4 h-4 text-rose-600" />
                <span>Add {missingItemsToAdd.length} Missing to List</span>
              </button>
            )}

            <button
              onClick={() => onCookRecipe(matchResult)}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <Utensils className="w-4 h-4" />
              <span>Cook & Deduct Pantry</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
