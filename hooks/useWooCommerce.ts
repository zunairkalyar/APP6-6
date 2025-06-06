import { useState, useCallback, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { WooCommerceConfig, Order, OrderStatus, OrderItem } from '../types';
import { DEFAULT_WOOCOMMERCE_CONFIG, MOCK_ORDERS_COUNT, ORDER_STATUS_OPTIONS } from '../constants';

// Mock data generation for WooCommerce
const generateMockWooOrderItem = (idx: number): OrderItem => ({
  id: `item-woo-${idx}-${Date.now()}`,
  name: `Woo Product ${String.fromCharCode(70 + (idx % 20))}`, // Product F, Product G, ...
  quantity: Math.floor(Math.random() * 2) + 1,
  price: parseFloat((Math.random() * 70 + 10).toFixed(2)),
});

const generateMockWooOrder = (id: number): Order => {
  const items = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => generateMockWooOrderItem(i));
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const statuses = ORDER_STATUS_OPTIONS.map(opt => opt.value);
  const randomStatusKey = statuses[Math.floor(Math.random() * statuses.length)];
  
  const orderDate = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);

  const customerSegments: Array<'VIP' | 'New' | 'Regular'> = ['VIP', 'New', 'Regular'];
  const randomSegment = customerSegments[Math.floor(Math.random() * customerSegments.length)];
  const isRepeat = Math.random() > 0.4; // Slightly different probability

  return {
    id: `woo-order-${2000 + id}-${Date.now()}`, 
    orderNumber: `${2000 + id}`, 
    status: randomStatusKey,
    customerName: `Woo Customer ${String.fromCharCode(75 + (id % 10))} ${String.fromCharCode(107 + (id % 10))}`,
    customerEmail: `woo.customer${id}@example.net`,
    orderDate: orderDate.toISOString(),
    items,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    shippingAddress: id % 2 === 0 ? `${400 + id} Woo Avenue, Anycity, USA` : `${500 + id} Woo Street, Wooville, USA`, // Vary addresses
    billingAddress: `${500 + id} Woo Street, Wooville, USA`,
    paymentMethod: 'Stripe (WooCommerce)', 
    currency: 'USD',
    platform: 'woocommerce',
    isRepeatCustomer: isRepeat,
    customerSegment: randomSegment,
  };
};

const useWooCommerce = () => {
  const [config, setConfig] = useLocalStorage<WooCommerceConfig>('wooCommerceConfig', DEFAULT_WOOCOMMERCE_CONFIG);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testConnectionError, setTestConnectionError] = useState<string | null>(null);

  useEffect(() => {
    setIsConfigured(!!(config.siteUrl && config.consumerKey && config.consumerSecret));
  }, [config]);

  const fetchOrders = useCallback(async () => {
    if (!isConfigured) {
      setError("WooCommerce is not configured. Please provide Site URL, Consumer Key, and Consumer Secret.");
      setOrders([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 1100)); 
    try {
      const mockOrders = Array.from({ length: MOCK_ORDERS_COUNT - 5 }, (_, i) => generateMockWooOrder(i + 1)); 
      setOrders(mockOrders);
    } catch (e) {
      console.error("Failed to fetch WooCommerce orders:", e);
      setError("Failed to fetch WooCommerce orders. Check console for details.");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured, config.siteUrl, config.consumerKey, config.consumerSecret]);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus): Promise<boolean> => {
    if (!isConfigured) {
      setError("WooCommerce is not configured. Cannot update order status.");
      return false;
    }
    setIsLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 600)); 
    try {
      console.log(`Updating WooCommerce order ${orderId} to status ${newStatus}`);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      return true;
    } catch (e) {
      console.error("Failed to update WooCommerce order status:", e);
      setError("Failed to update WooCommerce order status. Check console for details.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const getOrderById = useCallback((orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId);
  }, [orders]);

  const testWooCommerceConnection = useCallback(async (testConfig: WooCommerceConfig): Promise<boolean> => {
    setIsTestingConnection(true);
    setTestConnectionError(null);
    await new Promise(resolve => setTimeout(resolve, 1300));
    try {
      if (!testConfig.siteUrl || !testConfig.consumerKey || !testConfig.consumerSecret) {
        throw new Error("Site URL, Consumer Key, and Consumer Secret are required for testing.");
      }
      if (testConfig.consumerSecret.toLowerCase() === 'fail_secret') {
          throw new Error("Simulated Consumer Secret resulted in an error.");
      }
      console.log("Test connection with WooCommerce config:", testConfig, "was successful (simulated).");
      return true;
    } catch (e: any) {
      console.error("WooCommerce test connection failed:", e);
      setTestConnectionError(e.message || "An unknown error occurred during WooCommerce connection test.");
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  }, []);

  return {
    config,
    setConfig,
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