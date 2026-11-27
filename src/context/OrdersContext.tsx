import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Address, Order, OrderItem } from '../types';
import { readJSON, storageKeys, writeJSON } from '../lib/storage';

export interface PlaceOrderInput {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  address: Address;
  deliveryMethod: 'standard' | 'express';
  paymentLabel: string;
  estimatedDelivery: string;
  email?: string;
  idempotencyKey: string;
}

interface OrdersContextValue {
  orders: Order[];
  getOrder: (id: string) => Order | undefined;
  placeOrder: (input: PlaceOrderInput) => Order;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

function newOrderId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `SK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  }
  return `SK-${Date.now().toString(36).toUpperCase().slice(-6)}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [userOrders, setUserOrders] = useState<Order[]>(() => readJSON(storageKeys.orders, []));
  const userOrdersRef = useRef(userOrders);
  const orderKeysRef = useRef<Record<string, string>>(readJSON(storageKeys.orderKeys, {}));

  useEffect(() => {
    writeJSON(storageKeys.orders, userOrders);
  }, [userOrders]);

  useEffect(() => {
    writeJSON(storageKeys.orderKeys, orderKeysRef.current);
  }, []);

  const orders = useMemo(
    () => [...userOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [userOrders]
  );

  const getOrder = useCallback(
    (id: string) => userOrders.find((order) => order.id === id),
    [userOrders]
  );

  const placeOrder = useCallback<OrdersContextValue['placeOrder']>((input) => {
    const existingId = input.idempotencyKey ? orderKeysRef.current[input.idempotencyKey] : undefined;
    if (existingId) {
      const existing = userOrdersRef.current.find((order) => order.id === existingId);
      if (existing) return existing;
    }

    const order: Order = {
      id: newOrderId(),
      createdAt: new Date().toISOString(),
      ...input,
      status: 'Ordered',
    };
    const nextOrders = [order, ...userOrdersRef.current];
    userOrdersRef.current = nextOrders;
    if (input.idempotencyKey) {
      orderKeysRef.current = { ...orderKeysRef.current, [input.idempotencyKey]: order.id };
      writeJSON(storageKeys.orderKeys, orderKeysRef.current);
    }
    setUserOrders(nextOrders);
    return order;
  }, []);

  const value = useMemo<OrdersContextValue>(() => ({ orders, getOrder, placeOrder }), [orders, getOrder, placeOrder]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersContextValue {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders must be used inside OrdersProvider');
  return context;
}
