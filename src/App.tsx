import React, { useState, useEffect, useCallback } from 'react';
import { 
  PantryItem, Recipe, ShoppingItem, ViewMode, 
  RecipeMatchResult, RecipeIngredient, Unit 
} from './types';
import { INITIAL_PANTRY_ITEMS, SAMPLE_RECIPES, INITIAL_SHOPPING_ITEMS } from './data/sampleData';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { MyPantryView } from './components/MyPantryView';
import { RecipeMatchView } from './components/RecipeMatchView';
import { ShoppingListView } from './components/ShoppingListView';
import { ItemFormModal } from './components/ItemFormModal';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { PrototypeNoticeModal } from './components/PrototypeNoticeModal';
import { AcceptanceCheckModal } from './components/AcceptanceCheckModal';
import { UndoToast } from './components/UndoToast';
import { getExpiryStatus, evaluateIngredientMatch, convertUnitQuantity } from './utils/units';

export default function App() {
  // --- Persistent State ---
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
    try {
      const saved = localStorage.getItem('pantry_items_v1');
      return saved ? JSON.parse(saved) : INITIAL_PANTRY_ITEMS;
    } catch {
      return INITIAL_PANTRY_ITEMS;
    }
  });

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem('pantry_shopping_v1');
      return saved ? JSON.parse(saved) : INITIAL_SHOPPING_ITEMS;
    } catch {
      return INITIAL_SHOPPING_ITEMS;
    }
  });

  // Preserve in-progress ingredient form draft
  const [ingredientDraft, setIngredientDraft] = useState<Partial<Omit<PantryItem, 'id' | 'addedAt' | 'updatedAt'>>>(() => {
    try {
      const saved = localStorage.getItem('pantry_draft_ingredient');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pantry_items_v1', JSON.stringify(pantryItems));
    } catch (e) {
      console.warn('Failed to save pantry items to local storage', e);
    }
  }, [pantryItems]);

  useEffect(() => {
    try {
      localStorage.setItem('pantry_shopping_v1', JSON.stringify(shoppingItems));
    } catch (e) {
      console.warn('Failed to save shopping items to local storage', e);
    }
  }, [shoppingItems]);

  useEffect(() => {
    try {
      localStorage.setItem('pantry_draft_ingredient', JSON.stringify(ingredientDraft));
    } catch (e) {
      console.warn('Failed to save draft ingredient', e);
    }
  }, [ingredientDraft]);

  // --- Navigation & Modal State ---
  const [currentView, setCurrentView] = useState<ViewMode>('pantry');
  const [selectedRecipeMatch, setSelectedRecipeMatch] = useState<RecipeMatchResult | null>(null);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<PantryItem | null>(null);

  // Modals for Architecture Info & Acceptance Review
  const [isPrototypeInfoOpen, setIsPrototypeInfoOpen] = useState(false);
  const [isAcceptanceCheckOpen, setIsAcceptanceCheckOpen] = useState(false);
  const [filterExpiringRecipesOnly, setFilterExpiringRecipesOnly] = useState(false);

  // Undo state
  const [undoAction, setUndoAction] = useState<{
    message: string;
    action: () => void;
  } | null>(null);

  // Auto-dismiss undo after 7 seconds
  useEffect(() => {
    if (!undoAction) return;
    const timer = setTimeout(() => {
      setUndoAction(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [undoAction]);

  // --- Computed Summary Counts ---
  const totalPantryCount = pantryItems.length;
  const expiringPantryCount = pantryItems.filter((i) => {
    const exp = getExpiryStatus(i.expiryDate, i.isExpiryUnknown);
    return exp.status === 'expiring-soon';
  }).length;

  // Recipe Matches count
  const readyRecipeCount = SAMPLE_RECIPES.filter((recipe) => {
    const statuses = recipe.ingredients.map((ing) => evaluateIngredientMatch(ing, pantryItems));
    return statuses.every((s) => s.status === 'sufficient');
  }).length;

  const neededShoppingCount = shoppingItems.filter((i) => !i.checked).length;

  // --- Handlers: Pantry ---
  const handleSaveIngredient = (
    itemData: Omit<PantryItem, 'id' | 'addedAt' | 'updatedAt'>,
    editId?: string
  ) => {
    const nowIso = new Date().toISOString().split('T')[0];

    if (editId) {
      setPantryItems((prev) =>
        prev.map((item) =>
          item.id === editId
            ? { ...item, ...itemData, updatedAt: nowIso }
            : item
        )
      );
    } else {
      const newItem: PantryItem = {
        id: `pantry-${Date.now()}`,
        ...itemData,
        addedAt: nowIso,
        updatedAt: nowIso,
      };
      setPantryItems((prev) => [newItem, ...prev]);
    }
  };

  const handleDeletePantryItem = (id: string) => {
    const itemToDelete = pantryItems.find((i) => i.id === id);
    if (!itemToDelete) return;

    const previousItems = [...pantryItems];
    setPantryItems((prev) => prev.filter((i) => i.id !== id));

    setUndoAction({
      message: `Removed ${itemToDelete.name} from pantry`,
      action: () => setPantryItems(previousItems),
    });
  };

  const handleAdjustQuantity = (id: string, delta: number) => {
    setPantryItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newQty = Math.max(0, Math.round((item.quantity + delta) * 10) / 10);
        return {
          ...item,
          quantity: newQty,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  // --- Handlers: Shopping List ---
  const handleToggleShoppingCheck = (id: string) => {
    setShoppingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleDeleteShoppingItem = (id: string) => {
    const itemToDelete = shoppingItems.find((i) => i.id === id);
    if (!itemToDelete) return;

    const previousList = [...shoppingItems];
    setShoppingItems((prev) => prev.filter((i) => i.id !== id));

    setUndoAction({
      message: `Removed ${itemToDelete.name} from shopping list`,
      action: () => setShoppingItems(previousList),
    });
  };

  const handleAddManualShoppingItem = (
    item: Omit<ShoppingItem, 'id' | 'checked' | 'addedAt'>
  ) => {
    const newItem: ShoppingItem = {
      id: `shop-${Date.now()}`,
      ...item,
      checked: false,
      addedAt: new Date().toISOString().split('T')[0],
    };
    setShoppingItems((prev) => [newItem, ...prev]);
  };

  const handleAddMissingToShoppingList = (
    missing: { ingredient: RecipeIngredient; missingQty: number }[],
    recipeTitle: string
  ) => {
    const newItems: ShoppingItem[] = missing.map((m) => {
      // Guess general category based on unit or common names
      let cat: any = 'Pantry & Grains';
      const norm = m.ingredient.name.toLowerCase();
      if (norm.includes('cheese') || norm.includes('cream') || norm.includes('milk') || norm.includes('butter')) {
        cat = 'Dairy & Eggs';
      } else if (norm.includes('rosemary') || norm.includes('basil') || norm.includes('tomato') || norm.includes('garlic')) {
        cat = 'Produce';
      } else if (norm.includes('chicken') || norm.includes('beef') || norm.includes('egg')) {
        cat = 'Proteins';
      }

      return {
        id: `shop-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: m.ingredient.name,
        quantity: m.missingQty,
        unit: m.ingredient.unit,
        category: cat,
        checked: false,
        recipeSource: recipeTitle,
        addedAt: new Date().toISOString().split('T')[0],
      };
    });

    setShoppingItems((prev) => [...newItems, ...prev]);
  };

  const handleMoveCheckedToPantry = () => {
    const checkedItems = shoppingItems.filter((i) => i.checked);
    if (checkedItems.length === 0) return;

    const previousPantry = [...pantryItems];
    const previousShopping = [...shoppingItems];

    const todayIso = new Date().toISOString().split('T')[0];
    const defaultExpiryIso = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Restock pantry items: if item exists in pantry with compatible unit, add to quantity; otherwise create new item!
    const updatedPantry = [...pantryItems];

    checkedItems.forEach((shopItem) => {
      const existingIdx = updatedPantry.findIndex(
        (p) => p.name.toLowerCase() === shopItem.name.toLowerCase() && p.unit === shopItem.unit
      );

      if (existingIdx >= 0) {
        updatedPantry[existingIdx] = {
          ...updatedPantry[existingIdx],
          quantity: updatedPantry[existingIdx].quantity + shopItem.quantity,
          updatedAt: todayIso,
        };
      } else {
        updatedPantry.unshift({
          id: `pantry-bought-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: shopItem.name,
          quantity: shopItem.quantity,
          unit: shopItem.unit,
          category: shopItem.category,
          expiryDate: defaultExpiryIso,
          isExpiryUnknown: false,
          notes: `Restocked from shopping list (${shopItem.recipeSource || 'manual purchase'})`,
          storageLocation: shopItem.category === 'Produce' ? 'Pantry' : 'Fridge',
          addedAt: todayIso,
          updatedAt: todayIso,
        });
      }
    });

    setPantryItems(updatedPantry);
    // Remove checked from shopping list
    setShoppingItems((prev) => prev.filter((i) => !i.checked));

    setUndoAction({
      message: `Moved ${checkedItems.length} purchased item${checkedItems.length > 1 ? 's' : ''} to pantry`,
      action: () => {
        setPantryItems(previousPantry);
        setShoppingItems(previousShopping);
      },
    });
  };

  const handleClearCheckedShopping = () => {
    const previous = [...shoppingItems];
    setShoppingItems((prev) => prev.filter((i) => !i.checked));

    setUndoAction({
      message: 'Cleared checked shopping items',
      action: () => setShoppingItems(previous),
    });
  };

  // --- Handlers: Cook Recipe & Deduct Pantry ---
  const handleCookRecipe = (match: RecipeMatchResult) => {
    const previousPantry = [...pantryItems];
    const updatedPantry = [...pantryItems];
    const deductedNames: string[] = [];

    match.ingredientStatuses.forEach((status) => {
      if (status.status === 'sufficient' && status.matchedPantryItem) {
        const pIdx = updatedPantry.findIndex((p) => p.id === status.matchedPantryItem?.id);
        if (pIdx >= 0) {
          const pantryItem = updatedPantry[pIdx];
          // Convert recipe required quantity into pantry unit
          const convertedNeeded = convertUnitQuantity(
            status.recipeIngredient.quantity,
            status.recipeIngredient.unit,
            pantryItem.unit
          );

          if (convertedNeeded !== null) {
            const rem = Math.max(0, Math.round((pantryItem.quantity - convertedNeeded) * 10) / 10);
            updatedPantry[pIdx] = {
              ...pantryItem,
              quantity: rem,
              updatedAt: new Date().toISOString().split('T')[0],
            };
            deductedNames.push(pantryItem.name);
          }
        }
      }
    });

    setPantryItems(updatedPantry);
    setSelectedRecipeMatch(null);

    setUndoAction({
      message: `Cooked "${match.recipe.title}"! Pantry ingredients deducted.`,
      action: () => setPantryItems(previousPantry),
    });
  };

  // Reset sample data
  const handleResetData = () => {
    if (confirm('Reset all pantry items, recipes, and shopping lists back to the approved sample data?')) {
      setPantryItems(INITIAL_PANTRY_ITEMS);
      setShoppingItems(INITIAL_SHOPPING_ITEMS);
      setIngredientDraft({});
      localStorage.removeItem('pantry_items_v1');
      localStorage.removeItem('pantry_shopping_v1');
      localStorage.removeItem('pantry_draft_ingredient');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 font-sans flex flex-col selection:bg-amber-200">
      {/* Top App Header */}
      <Header
        currentView={currentView}
        totalPantryCount={totalPantryCount}
        expiringPantryCount={expiringPantryCount}
        readyRecipeCount={readyRecipeCount}
        neededShoppingCount={neededShoppingCount}
        onOpenPrototypeInfo={() => setIsPrototypeInfoOpen(true)}
        onOpenAcceptanceCheck={() => setIsAcceptanceCheckOpen(true)}
        onResetData={handleResetData}
      />

      {/* Primary Navigation Tabs */}
      <Navigation
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          setFilterExpiringRecipesOnly(false);
        }}
        pantryCount={totalPantryCount}
        expiringSoonCount={expiringPantryCount}
        readyRecipeCount={readyRecipeCount}
        shoppingNeededCount={neededShoppingCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        {currentView === 'pantry' && (
          <MyPantryView
            pantryItems={pantryItems}
            onAddItem={() => {
              setItemToEdit(null);
              setIsItemFormOpen(true);
            }}
            onEditItem={(item) => {
              setItemToEdit(item);
              setIsItemFormOpen(true);
            }}
            onDeleteItem={handleDeletePantryItem}
            onAdjustQuantity={handleAdjustQuantity}
            onFindRecipesForIngredient={(name) => {
              setCurrentView('recipes');
            }}
            onJumpToRecipeMatch={(filterExpiring) => {
              setFilterExpiringRecipesOnly(!!filterExpiring);
              setCurrentView('recipes');
            }}
          />
        )}

        {currentView === 'recipes' && (
          <RecipeMatchView
            recipes={SAMPLE_RECIPES}
            pantryItems={pantryItems}
            initialFilterExpiring={filterExpiringRecipesOnly}
            onSelectRecipe={(match) => setSelectedRecipeMatch(match)}
            onQuickAddMissing={(recipe, missingItems) => {
              handleAddMissingToShoppingList(missingItems, recipe.title);
              setUndoAction({
                message: `Added ${missingItems.length} missing items for ${recipe.title} to Shopping List`,
                action: () => {},
              });
            }}
          />
        )}

        {currentView === 'shopping' && (
          <ShoppingListView
            shoppingItems={shoppingItems}
            onToggleCheck={handleToggleShoppingCheck}
            onDeleteItem={handleDeleteShoppingItem}
            onAddManualItem={handleAddManualShoppingItem}
            onMoveCheckedToPantry={handleMoveCheckedToPantry}
            onClearChecked={handleClearCheckedShopping}
            onJumpToPantry={() => setCurrentView('pantry')}
          />
        )}
      </main>

      {/* Item Form Modal (Preserves in-progress draft) */}
      <ItemFormModal
        isOpen={isItemFormOpen}
        itemToEdit={itemToEdit}
        onSave={handleSaveIngredient}
        onClose={() => setIsItemFormOpen(false)}
        draftState={ingredientDraft}
        onUpdateDraft={setIngredientDraft}
        onClearDraft={() => setIngredientDraft({})}
      />

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        matchResult={selectedRecipeMatch}
        onClose={() => setSelectedRecipeMatch(null)}
        onAddMissingToShoppingList={(missing, recipeTitle) => {
          handleAddMissingToShoppingList(missing, recipeTitle);
        }}
        onCookRecipe={handleCookRecipe}
      />

      {/* Educational Prototype Notice Modal */}
      <PrototypeNoticeModal
        isOpen={isPrototypeInfoOpen}
        onClose={() => setIsPrototypeInfoOpen(false)}
      />

      {/* Acceptance Criteria Live Check Modal */}
      <AcceptanceCheckModal
        isOpen={isAcceptanceCheckOpen}
        onClose={() => setIsAcceptanceCheckOpen(false)}
        onNavigateTo={(view, itemId) => {
          setCurrentView(view);
          if (view === 'recipes' && itemId) {
            const targetRecipe = SAMPLE_RECIPES.find((r) => r.id === itemId);
            if (targetRecipe) {
              const statuses = targetRecipe.ingredients.map((ing) =>
                evaluateIngredientMatch(ing, pantryItems)
              );
              const availableCount = statuses.filter((s) => s.status === 'sufficient').length;
              const incompatibleCount = statuses.filter((s) => s.status === 'incompatible-units').length;
              const missingCount = statuses.filter(
                (s) => s.status === 'unavailable' || s.status === 'partial'
              ).length;
              const totalIngredients = targetRecipe.ingredients.length;
              const matchScore = Math.round((availableCount / totalIngredients) * 100);

              setSelectedRecipeMatch({
                recipe: targetRecipe,
                matchScore,
                totalIngredients,
                availableCount,
                missingCount,
                incompatibleCount,
                hasExpiringIngredients: false,
                ingredientStatuses: statuses,
              });
            }
          }
        }}
      />

      {/* Undo Toast for destructive action recovery */}
      {undoAction && (
        <UndoToast
          message={undoAction.message}
          onUndo={() => {
            undoAction.action();
            setUndoAction(null);
          }}
          onDismiss={() => setUndoAction(null)}
        />
      )}
    </div>
  );
}
