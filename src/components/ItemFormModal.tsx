import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, Save, Sparkles, HelpCircle } from 'lucide-react';
import { PantryItem, Category, Unit } from '../types';

interface ItemFormModalProps {
  isOpen: boolean;
  itemToEdit?: PantryItem | null;
  onSave: (item: Omit<PantryItem, 'id' | 'addedAt' | 'updatedAt'>, editId?: string) => void;
  onClose: () => void;
  draftState: Partial<Omit<PantryItem, 'id' | 'addedAt' | 'updatedAt'>>;
  onUpdateDraft: (draft: Partial<Omit<PantryItem, 'id' | 'addedAt' | 'updatedAt'>>) => void;
  onClearDraft: () => void;
}

const CATEGORIES: Category[] = [
  'Produce',
  'Dairy & Eggs',
  'Pantry & Grains',
  'Proteins',
  'Canned & Jars',
  'Spices & Oils',
  'Bakery',
  'Other',
];

const COMMON_UNITS: { label: string; units: Unit[] }[] = [
  { label: 'Weight (Mass)', units: ['g', 'kg', 'oz'] },
  { label: 'Volume (Liquid/Baking)', units: ['ml', 'L', 'cups', 'tbsp', 'tsp'] },
  { label: 'Count & Portions', units: ['pcs', 'cans', 'cloves', 'slices'] },
];

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  itemToEdit,
  onSave,
  onClose,
  draftState,
  onUpdateDraft,
  onClearDraft,
}) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<string>('1');
  const [unit, setUnit] = useState<Unit>('pcs');
  const [category, setCategory] = useState<Category>('Produce');
  const [storageLocation, setStorageLocation] = useState<'Fridge' | 'Pantry' | 'Freezer'>('Pantry');
  const [isExpiryUnknown, setIsExpiryUnknown] = useState<boolean>(false);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [errors, setErrors] = useState<{ name?: string; quantity?: string }>({});
  const [hasDraftRestored, setHasDraftRestored] = useState(false);

  // Initialize or restore state
  useEffect(() => {
    if (!isOpen) return;

    if (itemToEdit) {
      setName(itemToEdit.name);
      setQuantity(itemToEdit.quantity.toString());
      setUnit(itemToEdit.unit);
      setCategory(itemToEdit.category);
      setStorageLocation(itemToEdit.storageLocation);
      setIsExpiryUnknown(itemToEdit.isExpiryUnknown || !itemToEdit.expiryDate);
      setExpiryDate(itemToEdit.expiryDate || '');
      setNotes(itemToEdit.notes || '');
      setHasDraftRestored(false);
    } else {
      // Check if draft exists
      if (draftState.name || draftState.quantity) {
        setName(draftState.name || '');
        setQuantity(draftState.quantity?.toString() || '1');
        setUnit(draftState.unit || 'pcs');
        setCategory(draftState.category || 'Produce');
        setStorageLocation(draftState.storageLocation || 'Pantry');
        setIsExpiryUnknown(draftState.isExpiryUnknown ?? false);
        setExpiryDate(draftState.expiryDate || '');
        setNotes(draftState.notes || '');
        setHasDraftRestored(true);
      } else {
        // Defaults for fresh addition
        setName('');
        setQuantity('1');
        setUnit('pcs');
        setCategory('Produce');
        setStorageLocation('Pantry');
        setIsExpiryUnknown(false);
        // Default expiry in 7 days
        const defaultDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        setExpiryDate(defaultDate);
        setNotes('');
        setHasDraftRestored(false);
      }
    }
    setErrors({});
  }, [isOpen, itemToEdit]);

  // Persist draft on edit (when not editing an existing item)
  useEffect(() => {
    if (!itemToEdit && isOpen) {
      const parsedQty = parseFloat(quantity) || 1;
      onUpdateDraft({
        name,
        quantity: parsedQty,
        unit,
        category,
        storageLocation,
        isExpiryUnknown,
        expiryDate: isExpiryUnknown ? undefined : expiryDate,
        notes,
      });
    }
  }, [name, quantity, unit, category, storageLocation, isExpiryUnknown, expiryDate, notes, itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleQuickAddDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setExpiryDate(d.toISOString().split('T')[0]);
    setIsExpiryUnknown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; quantity?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Ingredient name is required';
    }

    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(
      {
        name: name.trim(),
        quantity: parsedQty,
        unit,
        category,
        storageLocation,
        isExpiryUnknown,
        expiryDate: isExpiryUnknown ? undefined : (expiryDate.trim() || undefined),
        notes: notes.trim() || undefined,
      },
      itemToEdit?.id
    );

    if (!itemToEdit) {
      onClearDraft();
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-ingredient-title"
      className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      <div className="bg-[#FAF7F2] text-stone-900 border border-stone-200 rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl relative animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-[#FAF7F2]/95 backdrop-blur-md px-5 py-4 border-b border-stone-200 flex items-center justify-between z-10">
          <div>
            <h2 id="modal-ingredient-title" className="text-lg font-bold font-serif text-stone-900">
              {itemToEdit ? `Edit: ${itemToEdit.name}` : 'Add Pantry Ingredient'}
            </h2>
            <p className="text-xs text-stone-500">
              {itemToEdit ? 'Update stock quantity, location, or expiry' : 'Track quantities and shelf life to prevent food waste'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="p-2 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {hasDraftRestored && !itemToEdit && (
          <div className="mx-5 mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-800">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Restored unsaved draft input
            </span>
            <button
              type="button"
              onClick={() => {
                onClearDraft();
                setName('');
                setQuantity('1');
                setNotes('');
                setHasDraftRestored(false);
              }}
              className="text-stone-500 hover:text-stone-800 underline font-semibold"
            >
              Clear
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Ingredient Name */}
          <div>
            <label htmlFor="ingredient-name" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Ingredient Name <span className="text-rose-600">*</span>
            </label>
            <input
              id="ingredient-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g. San Marzano Cherry Tomatoes"
              className={`w-full px-3.5 py-2.5 bg-white rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                  : 'border-stone-300 focus:ring-rose-500 focus:border-rose-500'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ingredient-quantity" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Quantity <span className="text-rose-600">*</span>
              </label>
              <input
                id="ingredient-quantity"
                type="number"
                step="any"
                min="0.1"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: undefined }));
                }}
                className={`w-full px-3.5 py-2.5 bg-white rounded-xl border text-sm text-stone-900 focus:outline-none focus:ring-2 ${
                  errors.quantity
                    ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                    : 'border-stone-300 focus:ring-rose-500 focus:border-rose-500'
                }`}
              />
              {errors.quantity && (
                <p className="mt-1 text-xs text-rose-600">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label htmlFor="ingredient-unit" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Unit
              </label>
              <select
                id="ingredient-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className="w-full px-3 py-2.5 bg-white rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {COMMON_UNITS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Storage Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ingredient-category" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Category
              </label>
              <select
                id="ingredient-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2.5 bg-white rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ingredient-storage" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Location
              </label>
              <select
                id="ingredient-storage"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value as 'Fridge' | 'Pantry' | 'Freezer')}
                className="w-full px-3 py-2.5 bg-white rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Pantry">Pantry Cupboard</option>
                <option value="Fridge">Refrigerator</option>
                <option value="Freezer">Freezer</option>
              </select>
            </div>
          </div>

          {/* Expiry Date Section (Handles Unknown Expiry explicitly) */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="ingredient-expiry" className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>Expiry Date</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700 select-none">
                <input
                  type="checkbox"
                  checked={isExpiryUnknown}
                  onChange={(e) => setIsExpiryUnknown(e.target.checked)}
                  className="rounded border-stone-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <span>Unknown / Non-perishable</span>
                  <span title="Safely handles items without an expiration date without guessing">
                    <HelpCircle className="w-3 h-3 text-stone-400" />
                  </span>
                </span>
              </label>
            </div>

            {!isExpiryUnknown ? (
              <div className="space-y-2">
                <input
                  id="ingredient-expiry"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 rounded-lg border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-stone-500">Quick set:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickAddDays(3)}
                    className="px-2 py-1 text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 rounded transition-colors"
                  >
                    +3 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddDays(7)}
                    className="px-2 py-1 text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 rounded transition-colors"
                  >
                    +1 Week
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddDays(30)}
                    className="px-2 py-1 text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 rounded transition-colors"
                  >
                    +1 Month
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Unknown Expiry Active:</strong> Item will be tracked as shelf-stable. Quantities are strictly preserved and never auto-expired.
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="ingredient-notes" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Notes / Brand / Storage Tip (Optional)
            </label>
            <textarea
              id="ingredient-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. In sealed mason jar; purchased at farmer's market"
              className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-stone-300 hover:bg-stone-200/50 text-stone-700 text-xs font-semibold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
            >
              <Save className="w-4 h-4" />
              <span>{itemToEdit ? 'Save Changes' : 'Add to Pantry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
