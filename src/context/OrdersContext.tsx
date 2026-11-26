import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Address, Order, OrderItem } from '../types';
import { sampleOrders } from '../data/sampleOrders';
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
}

interface OrdersContextValue {
  orders: Order[];
  getOrder: (id: string) => Order | undefined;
  placeOrder: (input: PlaceOrderInput) => Order;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [userOrders, setUserOrders] = useState<Order[]>(() => readJSON(storageKeys.orders, []));

  useEffect(() => {
    writeJSON(storageKeys.orders, userOrders);
  }, [userOrders]);

  const orders = useMemo(
    () =>
      [...userOrders, ...sampleOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [userOrders]
  );

  const getOrder = useCallback(
    (id: string) => orders.find((order) => order.id === id),
    [orders]
  );

  const placeOrder = useCallback<OrdersContextValue['placeOrder']>((input) => {
    const order: Order = {
      id: `SK-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      createdAt: new Date().toISOString(),
      ...input,
      status: 'Ordered',
    };
    setUserOrders((prev) => [order, ...prev]);
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
