import { useState, useCallback, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { WooCommerceConfig, Order, OrderStatus } from '../types';
import { DEFAULT_WOOCOMMERCE_CONFIG } from '../constants';

// Map WooCommerce order object to internal Order type
const mapWooOrder = (woo: any): Order => ({
  id: String(woo.id),
  orderNumber: woo.number,
  status: woo.status as OrderStatus,
  customerName: `${woo.billing.first_name} ${woo.billing.last_name}`.trim(),
  customerEmail: woo.billing.email,
  orderDate: woo.date_created,
  items: (woo.line_items || []).map((i: any) => ({
    id: String(i.id),
    name: i.name,
    quantity: i.quantity,
    price: parseFloat(i.price ?? i.subtotal) || 0,
  })),
  totalAmount: parseFloat(woo.total),
  shippingAddress: `${woo.shipping.address_1} ${woo.shipping.address_2} ${woo.shipping.city} ${woo.shipping.state} ${woo.shipping.postcode} ${woo.shipping.country}`.trim(),
  billingAddress: `${woo.billing.address_1} ${woo.billing.address_2} ${woo.billing.city} ${woo.billing.state} ${woo.billing.postcode} ${woo.billing.country}`.trim(),
  paymentMethod: woo.payment_method_title,
  currency: woo.currency,
  platform: 'woocommerce',
});

type StoredConfig = Omit<WooCommerceConfig, 'consumerSecret'>;

const useWooCommerce = () => {
  const [config, setStoredConfig] = useLocalStorage<StoredConfig>('wooCommerceConfig', {
    siteUrl: DEFAULT_WOOCOMMERCE_CONFIG.siteUrl,
    consumerKey: DEFAULT_WOOCOMMERCE_CONFIG.consumerKey,
  });
  const [consumerSecret, setConsumerSecret] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testConnectionError, setTestConnectionError] = useState<string | null>(null);

  useEffect(() => {
    setIsConfigured(!!(config.siteUrl && config.consumerKey && consumerSecret));
  }, [config, consumerSecret]);

  const fetchOrders = useCallback(async () => {
    if (!isConfigured) {
      setError('WooCommerce is not configured.');
      setOrders([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/orders');
      if (!resp.ok) throw new Error(`Status ${resp.status}`);
      const data = await resp.json();
      setOrders(data.map((o: any) => mapWooOrder(o)));
    } catch (e: any) {
      console.error('Failed to fetch WooCommerce orders:', e);
      setError('Failed to fetch WooCommerce orders.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus): Promise<boolean> => {
    if (!isConfigured) {
      setError('WooCommerce is not configured.');
      return false;
    }
    setIsLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!resp.ok) throw new Error(`Status ${resp.status}`);
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));
      return true;
    } catch (e) {
      console.error('Failed to update WooCommerce order status:', e);
      setError('Failed to update WooCommerce order status.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const getOrderById = useCallback((orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId);
  }, [orders]);

  const testWooCommerceConnection = useCallback(async (): Promise<boolean> => {
    setIsTestingConnection(true);
    setTestConnectionError(null);
    try {
      const resp = await fetch('/api/test-connection');
      if (!resp.ok) throw new Error(`Status ${resp.status}`);
      return true;
    } catch (e: any) {
      console.error('WooCommerce test connection failed:', e);
      setTestConnectionError(e.message || 'Unable to connect to WooCommerce.');
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  }, []);

  const saveConfig = (cfg: WooCommerceConfig) => {
    setStoredConfig({ siteUrl: cfg.siteUrl, consumerKey: cfg.consumerKey });
    if (cfg.consumerSecret) setConsumerSecret(cfg.consumerSecret);
  };

  return {
    config: { ...config, consumerSecret },
    setConfig: saveConfig,
    orders,
    fetchOrders,
    updateOrderStatus,
    getOrderById,
    isLoading,
    error,
    isConfigured,
    clearError: () => setError(null),
    testWooCommerceConnection,
    isTestingConnection,
    testConnectionError,
    clearTestConnectionError: () => setTestConnectionError(null),
  };
};

export default useWooCommerce;