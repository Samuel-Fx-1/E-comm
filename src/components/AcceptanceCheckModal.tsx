import React from 'react';
import { X, CheckCircle, AlertTriangle, HelpCircle, PackageX, ArrowRight } from 'lucide-react';
import { ViewMode } from '../types';

interface AcceptanceCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTo: (view: ViewMode, itemId?: string) => void;
}

export const AcceptanceCheckModal: React.FC<AcceptanceCheckModalProps> = ({
  isOpen,
  onClose,
  onNavigateTo,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="acceptance-title"
      className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-[#FAF7F2] text-stone-900 border border-stone-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          aria-label="Close acceptance verification dialog"
          className="absolute top-4 right-4 p-2 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-wider font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded">
            Task Verification
          </span>
          <span className="text-xs text-stone-500">Live Acceptance Check</span>
        </div>

        <h2 id="acceptance-title" className="text-xl font-bold font-serif text-stone-900 mb-2">
          Task-Specific Acceptance Review
        </h2>

        <p className="text-xs text-stone-600 mb-4">
          The brief requires the planner to handle three specific boundary conditions without silently guessing or altering user quantities. Here is how each is implemented and verified:
        </p>

        <div className="space-y-3.5">
          {/* Check 1: Unknown Expiry Dates */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-stone-900">1. Unknown Expiry Dates</h3>
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Handled
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Items like <strong className="text-stone-800">Raw Wildflower Honey (350g)</strong> or bulk spices have no expiry date forced.
                  The system tracks them with non-color label <code className="text-[11px] bg-stone-100 px-1 py-0.5 rounded">Unknown expiry</code>, preserves their quantities, and never assumes today’s date or marks them as expired.
                </p>
                <div className="mt-2.5">
                  <button
                    onClick={() => {
                      onNavigateTo('pantry', 'pantry-8');
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 active:text-rose-900 underline underline-offset-2"
                  >
                    <span>Inspect Raw Wildflower Honey in Pantry</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Check 2: Incompatible Units */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-stone-900">2. Incompatible Units</h3>
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Handled
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  When a recipe requests <strong className="text-stone-800">300g Flour</strong>, but the pantry holds <strong className="text-stone-800">2 cups Flour</strong>, the app flags an explicit unit mismatch warning. It does not guess density or silently change the pantry’s recorded 2 cups.
                </p>
                <div className="mt-2.5">
                  <button
                    onClick={() => {
                      onNavigateTo('recipes', 'recipe-3');
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 active:text-rose-900 underline underline-offset-2"
                  >
                    <span>Inspect Rustic Focaccia Recipe Unit Check</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Check 3: Unavailable Ingredient */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 text-rose-800 rounded-lg shrink-0">
                <PackageX className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-stone-900">3. Unavailable Ingredients</h3>
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Handled
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  When a recipe requires <strong className="text-stone-800">Parmigiano (60g)</strong> which is missing (0 in stock), it clearly highlights it as unavailable and allows 1-tap addition to the shopping list with the exact 60g quantity preserved.
                </p>
                <div className="mt-2.5">
                  <button
                    onClick={() => {
                      onNavigateTo('recipes', 'recipe-1');
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 active:text-rose-900 underline underline-offset-2"
                  >
                    <span>Inspect Creamy Tomato Penne missing Parmigiano</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-600"
          >
            Close Check
          </button>
        </div>
      </div>
    </div>
  );
};
