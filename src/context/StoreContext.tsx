import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { CartLine, Product, Question, Review } from '../types';
import {
  rememberProduct as cacheProduct,
  resolveLineProduct,
  resolveProduct,
} from '../data/productLookup';
import { site } from '../config/site';
import { fetchProducts } from '../data/api';
import { readJSON, storageKeys, writeJSON } from '../lib/storage';
import { useToast } from './ToastContext';

interface StoreContextValue {
  cart: CartLine[];
  savedForLater: CartLine[];
  wishlist: string[];
  compare: string[];
  recent: string[];
  reviews: Record<string, Review[]>;
  questions: Record<string, Question[]>;
  drawerOpen: boolean;
  cartCount: number;
  cartSubtotal: number;
  addToCart: (
    productId: string,
    qty?: number,
    options?: { openDrawer?: boolean; silent?: boolean; snapshot?: Product }
  ) => void;
  updateQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  saveForLater: (productId: string) => void;
  moveToCart: (productId: string) => void;
  removeSaved: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string, snapshot?: Product) => boolean;
  toggleCompare: (productId: string, snapshot?: Product) => void;
  clearCompare: () => void;
  addRecent: (productId: string, snapshot?: Product) => void;
  addReview: (review: Review) => void;
  addQuestion: (question: Question) => void;
  setDrawerOpen: (open: boolean) => void;
  rememberProduct: (product?: Product) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartLine[]>(() => readJSON(storageKeys.cart, []));
  const [savedForLater, setSavedForLater] = useState<CartLine[]>(() => readJSON(storageKeys.saved, []));
  const [wishlist, setWishlist] = useState<string[]>(() => readJSON(storageKeys.wishlist, []));
  const [compare, setCompare] = useState<string[]>(() => readJSON(storageKeys.compare, []));
  const [recent, setRecent] = useState<string[]>(() => readJSON(storageKeys.recent, []));
  const [snapshots, setSnapshots] = useState<Record<string, Product>>(() =>
    readJSON(storageKeys.productSnapshots, {})
  );
  const [reviews, setReviews] = useState<Record<string, Review[]>>(() => readJSON(storageKeys.reviews, {}));
  const [questions, setQuestions] = useState<Record<string, Question[]>>(() => readJSON(storageKeys.questions, {}));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    // Keep the 100-product catalog out of the initial bundle; the API is the
    // runtime source for resolving saved cart/wishlist IDs after navigation.
    const controller = new AbortController();
    Promise.all(
      [1, 2, 3].map((page) => fetchProducts({ pageSize: 48, page }, controller.signal))
    )
      .then((pages) => pages.forEach((page) => page.items.forEach(cacheProduct)))
      .catch(() => {
        // Offline: stored product snapshots still resolve saved items.
      });
    return () => controller.abort();
  }, []);

  useEffect(() => writeJSON(storageKeys.cart, cart), [cart]);
  useEffect(() => writeJSON(storageKeys.saved, savedForLater), [savedForLater]);
  useEffect(() => writeJSON(storageKeys.wishlist, wishlist), [wishlist]);
  useEffect(() => writeJSON(storageKeys.compare, compare), [compare]);
  useEffect(() => writeJSON(storageKeys.recent, recent), [recent]);
  useEffect(() => {
    Object.values(snapshots).forEach(cacheProduct);
    writeJSON(storageKeys.productSnapshots, snapshots);
  }, [snapshots]);
  useEffect(() => writeJSON(storageKeys.reviews, reviews), [reviews]);
  useEffect(() => writeJSON(storageKeys.questions, questions), [questions]);

  /** Keep API-only products available to wishlist/compare/orders after reload. */
  const rememberProduct = useCallback((product?: Product) => {
    if (!product) return;
    cacheProduct(product);
    setSnapshots((prev) => (prev[product.id] ? prev : { ...prev, [product.id]: product }));
  }, []);

  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + line.qty, 0), [cart]);
  const cartSubtotal = useMemo(
    () =>
      cart.reduce((sum, line) => {
        const product = resolveLineProduct(line);
        return sum + (product ? product.price * line.qty : 0);
      }, 0),
    [cart]
  );

  const addToCart = useCallback<StoreContextValue['addToCart']>(
    (productId, qty = 1, options) => {
      const product = options?.snapshot ?? resolveProduct(productId);
      if (!product) return;
      rememberProduct(product);
      if (product.stock <= 0) {
        toast('This item is currently out of stock.', { tone: 'info' });
        return;
      }
      const desired = Math.min(Math.max(1, qty), product.stock);
      setCart((prev) => {
        const existing = prev.find((line) => line.productId === productId);
        if (existing) {
          return prev.map((line) =>
            line.productId === productId
              ? { ...line, qty: Math.min(product.stock, line.qty + desired), snapshot: line.snapshot ?? product }
              : line
          );
        }
        return [...prev, { productId, qty: desired, snapshot: product }];
      });
      if (options?.openDrawer !== false) setDrawerOpen(true);
      if (!options?.silent) {
        toast(`${product.title} added to cart.`, {
          action: { label: 'View cart', onClick: () => setDrawerOpen(true) },
        });
      }
    },
    [rememberProduct, toast]
  );

  const updateQty = useCallback<StoreContextValue['updateQty']>(
    (productId, qty) => {
      const line = cart.find((entry) => entry.productId === productId);
      const product = resolveLineProduct({ productId, snapshot: line?.snapshot });
      if (!product) return;
      const next = Math.max(0, Math.min(product.stock, qty));
      if (next === 0) {
        setCart((prev) => prev.filter((entry) => entry.productId !== productId));
        return;
      }
      setCart((prev) =>
        prev.map((entry) =>
          entry.productId === productId ? { ...entry, qty: next, snapshot: entry.snapshot ?? product } : entry
        )
      );
    },
    [cart]
  );

  const removeFromCart = useCallback<StoreContextValue['removeFromCart']>((productId) => {
    setCart((prev) => prev.filter((line) => line.productId !== productId));
    toast('Item removed from cart.', { tone: 'info' });
  }, [toast]);

  const saveForLater = useCallback<StoreContextValue['saveForLater']>(
    (productId) => {
      const line = cart.find((entry) => entry.productId === productId);
      if (!line) return;
      setCart((prev) => prev.filter((entry) => entry.productId !== productId));
      setSavedForLater((prev) => {
        const existing = prev.find((entry) => entry.productId === productId);
        if (existing) {
          return prev.map((entry) =>
            entry.productId === productId ? { ...entry, qty: entry.qty + line.qty, snapshot: entry.snapshot ?? line.snapshot } : entry
          );
        }
        return [...prev, line];
      });
      toast('Moved to saved for later.', { tone: 'info' });
    },
    [cart, toast]
  );

  const moveToCart = useCallback<StoreContextValue['moveToCart']>(
    (productId) => {
      const line = savedForLater.find((entry) => entry.productId === productId);
      if (!line) return;
      const product = resolveLineProduct(line);
      if (!product) return;
      setSavedForLater((prev) => prev.filter((entry) => entry.productId !== productId));
      setCart((prev) => {
        const existing = prev.find((entry) => entry.productId === productId);
        if (existing) {
          return prev.map((entry) =>
            entry.productId === productId
              ? { ...entry, qty: Math.min(product.stock, entry.qty + line.qty), snapshot: entry.snapshot ?? line.snapshot ?? product }
              : entry
          );
        }
        return [...prev, { productId, qty: Math.min(product.stock, line.qty), snapshot: line.snapshot ?? product }];
      });
      toast('Moved back to cart.');
    },
    [savedForLater, toast]
  );

  const removeSaved = useCallback<StoreContextValue['removeSaved']>((productId) => {
    setSavedForLater((prev) => prev.filter((entry) => entry.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback<StoreContextValue['toggleWishlist']>(
    (productId, snapshot) => {
      const exists = wishlist.includes(productId);
      if (!exists) rememberProduct(snapshot ?? resolveProduct(productId));
      setWishlist((prev) =>
        prev.includes(productId) ? prev.filter((id) => id !== productId) : [productId, ...prev]
      );
      toast(exists ? 'Removed from wishlist.' : 'Saved to wishlist.', { tone: exists ? 'info' : 'success' });
      return !exists;
    },
    [rememberProduct, toast, wishlist]
  );

  const toggleCompare = useCallback<StoreContextValue['toggleCompare']>(
    (productId, snapshot) => {
      if (compare.includes(productId)) {
        setCompare((prev) => prev.filter((id) => id !== productId));
        return;
      }
      if (compare.length >= site.maxCompare) {
        toast(`You can compare up to ${site.maxCompare} products at a time.`, { tone: 'info' });
        return;
      }
      rememberProduct(snapshot ?? resolveProduct(productId));
      toast('Added to compare.');
      setCompare((prev) => [...prev, productId]);
    },
    [compare, rememberProduct, toast]
  );

  const clearCompare = useCallback(() => setCompare([]), []);

  const addRecent = useCallback<StoreContextValue['addRecent']>(
    (productId, snapshot) => {
      rememberProduct(snapshot ?? resolveProduct(productId));
      setRecent((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, site.maxRecentlyViewed));
    },
    [rememberProduct]
  );

  const addReview = useCallback<StoreContextValue['addReview']>((review) => {
    setReviews((prev) => ({ ...prev, [review.productId]: [review, ...(prev[review.productId] ?? [])] }));
    toast('Thanks — your review has been posted.');
  }, [toast]);

  const addQuestion = useCallback<StoreContextValue['addQuestion']>((question) => {
    setQuestions((prev) => ({ ...prev, [question.productId]: [question, ...(prev[question.productId] ?? [])] }));
    toast('Your question was posted. Sellers usually reply within a day.');
  }, [toast]);

  const value = useMemo<StoreContextValue>(
    () => ({
      cart,
      savedForLater,
      wishlist,
      compare,
      recent,
      reviews,
      questions,
      drawerOpen,
      cartCount,
      cartSubtotal,
      addToCart,
      updateQty,
      removeFromCart,
      saveForLater,
      moveToCart,
      removeSaved,
      clearCart,
      toggleWishlist,
      toggleCompare,
      clearCompare,
      addRecent,
      addReview,
      addQuestion,
      setDrawerOpen,
      rememberProduct,
    }),
    [cart, savedForLater, wishlist, compare, recent, reviews, questions, drawerOpen, cartCount, cartSubtotal, addToCart, updateQty, removeFromCart, saveForLater, moveToCart, removeSaved, clearCart, toggleWishlist, toggleCompare, clearCompare, addRecent, addReview, addQuestion, rememberProduct]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}
