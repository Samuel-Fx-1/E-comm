import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { SavedAddress, SavedPaymentMethod, StoredUser, User } from '../types';
import { hashPassword, randomSalt, validateEmail } from '../lib/hash';
import { readJSON, storageKeys, writeJSON } from '../lib/storage';

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  user: User | null;
  addresses: SavedAddress[];
  paymentMethods: SavedPaymentMethod[];
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => void;
  updateProfile: (name: string) => AuthResult;
  addAddress: (address: Omit<SavedAddress, 'id'>) => void;
  removeAddress: (id: string) => void;
  addPaymentMethod: (method: Omit<SavedPaymentMethod, 'id'>) => void;
  removePaymentMethod: (id: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ADDRESS_KEY = 'soko_address_book_v1';
const PAYMENT_KEY = 'soko_payment_book_v1';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<StoredUser[]>(() => readJSON(storageKeys.users, []));
  const [sessionId, setSessionId] = useState<string>(() => readJSON<string | null>(storageKeys.session, null) ?? '');
  const [addressBook, setAddressBook] = useState<Record<string, SavedAddress[]>>(() =>
    readJSON(ADDRESS_KEY, {})
  );
  const [paymentBook, setPaymentBook] = useState<Record<string, SavedPaymentMethod[]>>(() =>
    readJSON(PAYMENT_KEY, {})
  );

  useEffect(() => {
    writeJSON(storageKeys.users, users);
  }, [users]);

  useEffect(() => {
    writeJSON(storageKeys.session, sessionId || null);
  }, [sessionId]);

  useEffect(() => {
    writeJSON(ADDRESS_KEY, addressBook);
  }, [addressBook]);

  useEffect(() => {
    writeJSON(PAYMENT_KEY, paymentBook);
  }, [paymentBook]);

  const storedUser = users.find((candidate) => candidate.id === sessionId) ?? null;
  const user: User | null = storedUser
    ? { id: storedUser.id, name: storedUser.name, email: storedUser.email, createdAt: storedUser.createdAt }
    : null;

  const addresses = user ? addressBook[user.id] ?? [] : [];
  const paymentMethods = user ? paymentBook[user.id] ?? [] : [];

  const signUp = useCallback<AuthContextValue['signUp']>(async (name, email, password) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 2) return { ok: false, error: 'Please enter your full name.' };
    if (!validateEmail(cleanEmail)) return { ok: false, error: 'Enter a valid email address.' };
    if (password.length < 8) return { ok: false, error: 'Use at least 8 characters for your password.' };
    if (users.some((candidate) => candidate.email === cleanEmail)) {
      return { ok: false, error: 'An account with this email already exists. Try signing in.' };
    }
    const salt = randomSalt();
    const passwordHash = await hashPassword(password, salt);
    const newUser: StoredUser = {
      id: `user-${Date.now().toString(36)}`,
      name: cleanName,
      email: cleanEmail,
      createdAt: new Date().toISOString(),
      salt,
      passwordHash,
    };
    setUsers((prev) => [...prev, newUser]);
    setSessionId(newUser.id);
    return { ok: true };
  }, [users]);

  const signIn = useCallback<AuthContextValue['signIn']>(async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const candidate = users.find((entry) => entry.email === cleanEmail);
    if (!candidate) return { ok: false, error: 'No account found for that email. Create one first.' };
    const passwordHash = await hashPassword(password, candidate.salt);
    if (passwordHash !== candidate.passwordHash) {
      return { ok: false, error: 'That password does not match. Please try again.' };
    }
    setSessionId(candidate.id);
    return { ok: true };
  }, [users]);

  const signOut = useCallback(() => setSessionId(''), []);

  const updateProfile = useCallback<AuthContextValue['updateProfile']>((name) => {
    const cleanName = name.trim();
    if (cleanName.length < 2) return { ok: false, error: 'Please enter your full name.' };
    if (!user) return { ok: false, error: 'You need to be signed in.' };
    setUsers((prev) => prev.map((entry) => (entry.id === user.id ? { ...entry, name: cleanName } : entry)));
    return { ok: true };
  }, [user]);

  const addAddress = useCallback<AuthContextValue['addAddress']>((address) => {
    if (!user) return;
    const entry: SavedAddress = { ...address, id: `addr-${Date.now().toString(36)}` };
    setAddressBook((prev) => ({ ...prev, [user.id]: [...(prev[user.id] ?? []), entry] }));
  }, [user]);

  const removeAddress = useCallback<AuthContextValue['removeAddress']>((id) => {
    if (!user) return;
    setAddressBook((prev) => ({
      ...prev,
      [user.id]: (prev[user.id] ?? []).filter((entry) => entry.id !== id),
    }));
  }, [user]);

  const addPaymentMethod = useCallback<AuthContextValue['addPaymentMethod']>((method) => {
    if (!user) return;
    const entry: SavedPaymentMethod = { ...method, id: `pay-${Date.now().toString(36)}` };
    setPaymentBook((prev) => ({ ...prev, [user.id]: [...(prev[user.id] ?? []), entry] }));
  }, [user]);

  const removePaymentMethod = useCallback<AuthContextValue['removePaymentMethod']>((id) => {
    if (!user) return;
    setPaymentBook((prev) => ({
      ...prev,
      [user.id]: (prev[user.id] ?? []).filter((entry) => entry.id !== id),
    }));
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      addresses,
      paymentMethods,
      signUp,
      signIn,
      signOut,
      updateProfile,
      addAddress,
      removeAddress,
      addPaymentMethod,
      removePaymentMethod,
    }),
    [user, addresses, paymentMethods, signUp, signIn, signOut, updateProfile, addAddress, removeAddress, addPaymentMethod, removePaymentMethod]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
