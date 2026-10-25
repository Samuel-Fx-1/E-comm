import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, UtensilsCrossed, AlertTriangle, 
  CheckCircle2, Clock, Users, ArrowRight, ShoppingBag, Sparkles
} from 'lucide-react';
import { Recipe, PantryItem, RecipeMatchResult, RecipeIngredient } from '../types';
import { evaluateIngredientMatch, getExpiryStatus } from '../utils/units';

interface RecipeMatchViewProps {
  recipes: Recipe[];
  pantryItems: PantryItem[];
  onSelectRecipe: (match: RecipeMatchResult) => void;
  onQuickAddMissing: (recipe: Recipe, missingItems: { ingredient: RecipeIngredient; missingQty: number }[]) => void;
  initialFilterExpiring?: boolean;
}

export const RecipeMatchView: React.FC<RecipeMatchViewProps> = ({
  recipes,
  pantryItems,
  onSelectRecipe,
  onQuickAddMissing,
  initialFilterExpiring = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'ready' | 'missing-few' | 'expiring'>(
    initialFilterExpiring ? 'expiring' : 'all'
  );

  // Compute match evaluation for every recipe
  const recipeMatches: RecipeMatchResult[] = useMemo(() => {
    return recipes.map((recipe) => {
      const statuses = recipe.ingredients.map((ing) =>
        evaluateIngredientMatch(ing, pantryItems)
      );

      const availableCount = statuses.filter((s) => s.status === 'sufficient').length;
      const incompatibleCount = statuses.filter((s) => s.status === 'incompatible-units').length;
      const missingCount = statuses.filter(
        (s) => s.status === 'unavailable' || s.status === 'partial'
      ).length;

      const totalIngredients = recipe.ingredients.length;
      const matchScore = Math.round((availableCount / totalIngredients) * 100);

      // Check if recipe uses any expiring pantry items
      const hasExpiringIngredients = statuses.some((s) => {
        if (!s.matchedPantryItem) return false;
        const exp = getExpiryStatus(s.matchedPantryItem.expiryDate, s.matchedPantryItem.isExpiryUnknown);
        return exp.status === 'expiring-soon';
      });

      return {
        recipe,
        matchScore,
        totalIngredients,
        availableCount,
        missingCount,
        incompatibleCount,
        hasExpiringIngredients,
        ingredientStatuses: statuses,
      };
    });
  }, [recipes, pantryItems]);

  // Filtered and sorted matches
  const filteredMatches = useMemo(() => {
    return recipeMatches
      .filter((m) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = m.recipe.title.toLowerCase().includes(q);
          const matchSub = m.recipe.subtitle.toLowerCase().includes(q);
          const matchIng = m.recipe.ingredients.some((i) => i.name.toLowerCase().includes(q));
          if (!matchTitle && !matchSub && !matchIng) return false;
        }

        // Filter Type
        if (filterType === 'ready') {
          return m.missingCount === 0 && m.incompatibleCount === 0;
        }
        if (filterType === 'missing-few') {
          return m.missingCount > 0 && m.missingCount <= 2;
        }
        if (filterType === 'expiring') {
          return m.hasExpiringIngredients;
        }

        return true;
      })
      .sort((a, b) => {
        // High match score first, then expiring first
        if (a.hasExpiringIngredients !== b.hasExpiringIngredients) {
          return a.hasExpiringIngredients ? -1 : 1;
        }
        return b.matchScore - a.matchScore;
      });
  }, [recipeMatches, searchQuery, filterType]);

  const readyCount = recipeMatches.filter((m) => m.missingCount === 0 && m.incompatibleCount === 0).length;
  const expiringMatchCount = recipeMatches.filter((m) => m.hasExpiringIngredients).length;

  return (
    <div className="space-y-4 pb-24 md:pb-12">
      {/* Header controls & filters */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes by name or ingredient..."
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

        {/* Filter Segmented Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
              filterType === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All Recipes ({recipes.length})
          </button>

          <button
            onClick={() => setFilterType('ready')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${
              filterType === 'ready'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Ready ({readyCount})</span>
          </button>

          <button
            onClick={() => setFilterType('expiring')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${
              filterType === 'expiring'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Uses Expiring ({expiringMatchCount})</span>
          </button>

          <button
            onClick={() => setFilterType('missing-few')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
              filterType === 'missing-few'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Missing 1-2 Items
          </button>
        </div>
      </div>

      {/* Recipe Cards List */}
      {filteredMatches.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-800">No matching recipes found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search query or selecting "All Recipes" to see meals you can prepare.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
          >
            Show all recipes
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match) => {
            const { recipe, matchScore, availableCount, missingCount, incompatibleCount, hasExpiringIngredients } = match;
            const isFullyReady = missingCount === 0 && incompatibleCount === 0;

            const missingItemsToAdd = match.ingredientStatuses
              .filter((s) => s.status === 'unavailable' || s.status === 'partial')
              .map((s) => ({
                ingredient: s.recipeIngredient,
                missingQty: s.missingQuantity,
              }));

            return (
              <div
                key={recipe.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-amber-300 transition-all overflow-hidden flex flex-col sm:flex-row group"
              >
                {/* Culinary Image Thumbnail */}
                <div className="relative sm:w-56 h-44 sm:h-auto shrink-0 overflow-hidden bg-stone-100">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {hasExpiringIngredients && (
                    <div className="absolute top-2.5 left-2.5 bg-amber-400/95 text-stone-950 font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Rescues Expiring Food</span>
                    </div>
                  )}
                </div>

                {/* Content Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    {/* Header: Title & Match badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 group-hover:text-rose-700 transition-colors">
                          {recipe.title}
                        </h3>
                        <p className="text-xs text-stone-600 line-clamp-2 mt-0.5">
                          {recipe.subtitle}
                        </p>
                      </div>

                      {/* Match Badge */}
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                          isFullyReady
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/60'
                            : 'bg-amber-100 text-amber-900 border border-amber-300/60'
                        }`}
                      >
                        {isFullyReady ? '100% Ready' : `${matchScore}% Match`}
                      </span>
                    </div>

                    {/* Metadata indicators */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-2">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {recipe.prepTimeMinutes + recipe.cookTimeMinutes}m
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        {recipe.servings} servings
                      </span>
                      <span>{recipe.difficulty}</span>
                    </div>

                    {/* Ingredient Pantry Availability Status */}
                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {availableCount} in pantry
                      </span>

                      {missingCount > 0 && (
                        <span className="font-semibold text-rose-700 flex items-center gap-1">
                          · {missingCount} missing
                        </span>
                      )}

                      {incompatibleCount > 0 && (
                        <span className="font-semibold text-amber-800 flex items-center gap-1">
                          · <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Unit check
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Primary & Secondary Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                    <button
                      onClick={() => onSelectRecipe(match)}
                      className="flex-1 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-600"
                    >
                      <span>View Recipe & Cook</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {missingItemsToAdd.length > 0 && (
                      <button
                        onClick={() => onQuickAddMissing(recipe, missingItemsToAdd)}
                        title="Add only missing ingredients directly to shopping list"
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Add Missing</span>
                        <span>({missingItemsToAdd.length})</span>
                      </button>
                    )}
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
