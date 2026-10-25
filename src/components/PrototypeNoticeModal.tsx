import React from 'react';
import { X, Info, CheckCircle2, CloudOff, ShieldAlert, Database } from 'lucide-react';

interface PrototypeNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrototypeNoticeModal: React.FC<PrototypeNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="proto-title"
      className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-[#FAF7F2] text-stone-900 border border-stone-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          aria-label="Close prototype information dialog"
          className="absolute top-4 right-4 p-2 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4 text-rose-700">
          <Info className="w-5 h-5 shrink-0" />
          <h2 id="proto-title" className="text-xl font-bold font-serif tracking-tight text-stone-900">
            Prototype Architecture & Integrations
          </h2>
        </div>

        <p className="text-sm text-stone-600 mb-5 leading-relaxed">
          This is an interactive prototype for the fictional brand <strong className="font-semibold text-stone-900">Pantry</strong>.
          All sample demonstration records are loaded locally and modifications are saved to your browser’s local storage.
        </p>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-stone-200/80 shadow-xs">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Active In-Browser Capabilities</h3>
                <ul className="text-xs text-stone-600 mt-1.5 space-y-1 list-disc list-inside">
                  <li>Full inventory tracking with quantity adjustments and expiry status</li>
                  <li>Intelligent recipe matching based on pantry ingredient availability</li>
                  <li>Unit compatibility detection (mass vs volume vs count)</li>
                  <li>Adding missing ingredients directly to the shared shopping list</li>
                  <li>Moving purchased items from shopping list directly back to pantry</li>
                  <li>Preservation of in-progress form drafts across view navigation</li>
                  <li>Local storage persistence across browser reloads</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/70 rounded-xl p-4 border border-amber-200/80">
            <div className="flex items-start gap-3">
              <CloudOff className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Production Integrations (Unimplemented in Prototype)</h3>
                <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                  The following operations are marked as local demonstrations. In a production deployment, they would require dedicated external services:
                </p>
                <div className="grid grid-cols-1 gap-2 mt-2.5 text-xs text-stone-700">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span><strong>Central Database:</strong> Multi-user sync & persistent cloud database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span><strong>Authentication:</strong> Household accounts, invite codes & role access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
          >
            Got it, continue testing
          </button>
        </div>
      </div>
    </div>
  );
};
