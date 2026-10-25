export type Category = 
  | 'Produce'
  | 'Dairy & Eggs'
  | 'Pantry & Grains'
  | 'Proteins'
  | 'Canned & Jars'
  | 'Spices & Oils'
  | 'Bakery'
  | 'Other';

export type Unit = 
  | 'g'
  | 'kg'
  | 'ml'
  | 'L'
  | 'cups'
  | 'tbsp'
  | 'tsp'
  | 'pcs'
  | 'cans'
  | 'cloves'
  | 'slices'
  | 'oz';

export type ExpiryStatus = 'fresh' | 'expiring-soon' | 'expired' | 'unknown';

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  category: Category;
  expiryDate?: string; // ISO string 'YYYY-MM-DD' or undefined for unknown
  isExpiryUnknown?: boolean;
  notes?: string;
  storageLocation: 'Fridge' | 'Pantry' | 'Freezer';
  addedAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: Unit;
  optional?: boolean;
  notes?: string;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  imageUrl: string;
  caloriesPerServing: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  tips?: string;
  tags: string[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  category: Category;
  checked: boolean;
  recipeSource?: string; // title of recipe that requested this item
  addedAt: string;
  estimatedPrice?: string;
}

export type ViewMode = 'pantry' | 'recipes' | 'shopping';

export interface UnitCompatibilityResult {
  isCompatible: boolean;
  reason?: string;
  pantryQuantity?: number;
  pantryUnit?: Unit;
  recipeQuantity?: number;
  recipeUnit?: Unit;
}

export interface RecipeMatchIngredientStatus {
  recipeIngredient: RecipeIngredient;
  matchedPantryItem?: PantryItem;
  status: 'sufficient' | 'partial' | 'incompatible-units' | 'unavailable';
  availableQuantity?: number;
  availableUnit?: Unit;
  missingQuantity: number;
  missingUnit: Unit;
  warningNote?: string;
}

export interface RecipeMatchResult {
  recipe: Recipe;
  matchScore: number; // 0 to 100%
  totalIngredients: number;
  availableCount: number;
  missingCount: number;
  incompatibleCount: number;
  hasExpiringIngredients: boolean;
  ingredientStatuses: RecipeMatchIngredientStatus[];
}
