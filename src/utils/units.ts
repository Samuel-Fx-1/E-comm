import { Unit, ExpiryStatus, PantryItem, RecipeIngredient, RecipeMatchIngredientStatus } from '../types';

// Unit conversion matrices
const MASS_TO_GRAMS: Record<string, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
};

const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  L: 1000,
  cups: 240,
  tbsp: 15,
  tsp: 5,
};

const COUNT_UNITS = new Set(['pcs', 'cans', 'cloves', 'slices']);

export function getUnitFamily(unit: Unit): 'mass' | 'volume' | 'count' | 'other' {
  if (unit in MASS_TO_GRAMS) return 'mass';
  if (unit in VOLUME_TO_ML) return 'volume';
  if (COUNT_UNITS.has(unit)) return 'count';
  return 'other';
}

/**
 * Checks whether two units can be converted without density information.
 * If incompatible, returns details explaining why and preserves quantities.
 */
export function checkUnitCompatibility(
  pantryUnit: Unit,
  recipeUnit: Unit
): { isCompatible: boolean; reason?: string } {
  if (pantryUnit === recipeUnit) {
    return { isCompatible: true };
  }

  const pFamily = getUnitFamily(pantryUnit);
  const rFamily = getUnitFamily(recipeUnit);

  if (pFamily === rFamily && pFamily === 'mass') {
    return { isCompatible: true };
  }

  if (pFamily === rFamily && pFamily === 'volume') {
    return { isCompatible: true };
  }

  if (pFamily === 'count' && rFamily === 'count') {
    // Different count units (e.g. cans vs slices) are strictly incompatible
    return {
      isCompatible: false,
      reason: `Count units cannot be converted directly (${pantryUnit} vs ${recipeUnit}).`,
    };
  }

  // Cross-family mismatch (e.g., mass vs volume or count vs volume)
  return {
    isCompatible: false,
    reason: `Incompatible unit types (${pantryUnit} [${pFamily}] vs ${recipeUnit} [${rFamily}]). Density varies by ingredient; preserving exact recorded amount without guessing.`,
  };
}

/**
 * Converts quantity between compatible units.
 * Returns null if incompatible.
 */
export function convertUnitQuantity(
  quantity: number,
  fromUnit: Unit,
  toUnit: Unit
): number | null {
  if (fromUnit === toUnit) return quantity;

  const fromFamily = getUnitFamily(fromUnit);
  const toFamily = getUnitFamily(toUnit);

  if (fromFamily === 'mass' && toFamily === 'mass') {
    const inGrams = quantity * MASS_TO_GRAMS[fromUnit];
    return inGrams / MASS_TO_GRAMS[toUnit];
  }

  if (fromFamily === 'volume' && toFamily === 'volume') {
    const inMl = quantity * VOLUME_TO_ML[fromUnit];
    return inMl / VOLUME_TO_ML[toUnit];
  }

  return null;
}

/**
 * Normalizes an ingredient name for flexible matching
 * (e.g. "Roma Tomatoes" matches "Tomatoes" or "Fresh Basil" matches "Basil")
 */
export function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[,\(\)\.]/g, '')
    .replace(/\b(fresh|organic|dried|canned|crushed|diced|raw|whole|extra virgin|virgin|ripe)\b/g, '')
    .trim();
}

/**
 * Matches a recipe ingredient against pantry items
 */
export function evaluateIngredientMatch(
  recipeIngredient: RecipeIngredient,
  pantryItems: PantryItem[]
): RecipeMatchIngredientStatus {
  const normRecipe = normalizeIngredientName(recipeIngredient.name);

  // Look for exact or fuzzy pantry match
  const matchedPantry = pantryItems.find((item) => {
    const normPantry = normalizeIngredientName(item.name);
    return (
      normPantry === normRecipe ||
      normPantry.includes(normRecipe) ||
      normRecipe.includes(normPantry)
    );
  });

  if (!matchedPantry || matchedPantry.quantity <= 0) {
    return {
      recipeIngredient,
      matchedPantryItem: undefined,
      status: 'unavailable',
      missingQuantity: recipeIngredient.quantity,
      missingUnit: recipeIngredient.unit,
      warningNote: 'Unavailable in pantry (0 in stock). Exact quantity preserved.',
    };
  }

  // Check unit compatibility
  const compat = checkUnitCompatibility(matchedPantry.unit, recipeIngredient.unit);

  if (!compat.isCompatible) {
    return {
      recipeIngredient,
      matchedPantryItem: matchedPantry,
      status: 'incompatible-units',
      availableQuantity: matchedPantry.quantity,
      availableUnit: matchedPantry.unit,
      missingQuantity: recipeIngredient.quantity,
      missingUnit: recipeIngredient.unit,
      warningNote: `Unit mismatch: Pantry has ${matchedPantry.quantity} ${matchedPantry.unit}, Recipe requires ${recipeIngredient.quantity} ${recipeIngredient.unit}. ${compat.reason}`,
    };
  }

  // Convert pantry quantity to recipe unit to check sufficiency
  const convertedPantryQty = convertUnitQuantity(
    matchedPantry.quantity,
    matchedPantry.unit,
    recipeIngredient.unit
  );

  if (convertedPantryQty === null) {
    return {
      recipeIngredient,
      matchedPantryItem: matchedPantry,
      status: 'incompatible-units',
      availableQuantity: matchedPantry.quantity,
      availableUnit: matchedPantry.unit,
      missingQuantity: recipeIngredient.quantity,
      missingUnit: recipeIngredient.unit,
      warningNote: `Unable to convert units safely. Preserving exact recorded amounts.`,
    };
  }

  if (convertedPantryQty >= recipeIngredient.quantity) {
    return {
      recipeIngredient,
      matchedPantryItem: matchedPantry,
      status: 'sufficient',
      availableQuantity: matchedPantry.quantity,
      availableUnit: matchedPantry.unit,
      missingQuantity: 0,
      missingUnit: recipeIngredient.unit,
    };
  } else {
    const neededInRecipeUnit = recipeIngredient.quantity - convertedPantryQty;
    return {
      recipeIngredient,
      matchedPantryItem: matchedPantry,
      status: 'partial',
      availableQuantity: matchedPantry.quantity,
      availableUnit: matchedPantry.unit,
      missingQuantity: Math.round(neededInRecipeUnit * 10) / 10,
      missingUnit: recipeIngredient.unit,
      warningNote: `Partial stock: Have ${matchedPantry.quantity} ${matchedPantry.unit}, need ${recipeIngredient.quantity} ${recipeIngredient.unit}. Short by ${Math.round(neededInRecipeUnit * 10) / 10} ${recipeIngredient.unit}.`,
    };
  }
}

/**
 * Calculates days remaining and ExpiryStatus
 * Safely handles unknown or unspecified dates!
 */
export function getExpiryStatus(
  expiryDate?: string,
  isExpiryUnknown?: boolean
): {
  status: ExpiryStatus;
  daysRemaining: number | null;
  label: string;
  badgeText: string;
} {
  if (isExpiryUnknown || !expiryDate || expiryDate.trim() === '') {
    return {
      status: 'unknown',
      daysRemaining: null,
      label: 'Expiry date unknown / non-perishable',
      badgeText: 'Unknown expiry',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);

  if (isNaN(exp.getTime())) {
    return {
      status: 'unknown',
      daysRemaining: null,
      label: 'Invalid or unknown date format',
      badgeText: 'Unknown date',
    };
  }

  const diffTime = exp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    return {
      status: 'expired',
      daysRemaining: diffDays,
      label: `Expired ${daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`}`,
      badgeText: 'Expired',
    };
  } else if (diffDays === 0) {
    return {
      status: 'expiring-soon',
      daysRemaining: 0,
      label: 'Expires today',
      badgeText: 'Expires today',
    };
  } else if (diffDays <= 3) {
    return {
      status: 'expiring-soon',
      daysRemaining: diffDays,
      label: `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`,
      badgeText: `${diffDays}d left`,
    };
  } else if (diffDays <= 7) {
    return {
      status: 'fresh',
      daysRemaining: diffDays,
      label: `Expires in ${diffDays} days`,
      badgeText: `${diffDays}d left`,
    };
  } else {
    return {
      status: 'fresh',
      daysRemaining: diffDays,
      label: `Good until ${exp.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`,
      badgeText: 'Fresh',
    };
  }
}

/**
 * Format quantity with appropriate precision
 */
export function formatQuantity(qty: number): string {
  if (Number.isInteger(qty)) return qty.toString();
  return (Math.round(qty * 100) / 100).toString();
}
