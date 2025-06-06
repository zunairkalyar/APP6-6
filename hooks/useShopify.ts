import { useState, useCallback, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { ShopifyConfig, Order, OrderStatus, OrderItem } from '../types';
import { DEFAULT_SHOPIFY_CONFIG, MOCK_ORDERS_COUNT, ORDER_STATUS_OPTIONS } from '../constants';

// Mock data generation
const generateMockOrderItem = (idx: number): OrderItem => ({
  id: `item-shopify-${idx}-${Date.now()}`,
  name: `Shopify Product ${String.fromCharCode(65 + (idx % 26))}`,
  quantity: Math.floor(Math.random() * 3) + 1,
  price: parseFloat((Math.random() * 50 + 5).toFixed(2)),
});

const generateMockOrder = (id: number): Order => {
  const items = Array.from({ length: Math.floor(Math.random() * 2) + 1 }, (_, i) => generateMockOrderItem(i));
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const statuses = ORDER_STATUS_OPTIONS.map(opt => opt.value);
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const orderDate = new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000);

  const customerSegments: Array<'VIP' | 'New' | 'Regular'> = ['VIP', 'New', 'Regular'];
  const randomSegment = customerSegments[Math.floor(Math.random() * customerSegments.length)];
  const isRepeat = Math.random() > 0.5;

  return {
    id: `shopify-order-${id}-${Date.now()}`,
    orderNumber: `#S${1000 + id}`,
    status: randomStatus,
    customerName: `Shopify Customer ${String.fromCharCode(65 + (id % 10))} ${String.fromCharCode(97 + (id % 10))}`,
    customerEmail: `shopify.customer${id}@example.com`,
    orderDate: orderDate.toISOString(),
    items,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    shippingAddress: id % 3 === 0 ? `${100 + id} Main St, Anytown, USA` : `${200 + id} Commerce Rd, Shopville, USA`, // Vary addresses
    billingAddress: `${200 + id} Commerce Rd, Shopville, USA`,
    paymentMethod: 'Shopify Payments',
    currency: 'USD',
    platform: 'shopify',
    isRepeatCustomer: isRepeat,
    customerSegment: randomSegment,
  };
};

const useShopify = () => {
  const [config, setConfig] = useLocalStorage<ShopifyConfig>('shopifyConfig', DEFAULT_SHOPIFY_CONFIG);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testConnectionError, setTestConnectionError] = useState<string | null>(null);

  useEffect(() => {
    setIsConfigured(!!(config.shopDomain && config.adminApiAccessToken));
  }, [config]);

  const fetchOrders = useCallback(async () => {
    if (!isConfigured) {
      setError("Shopify is not configured. Please provide store domain and API access token.");
      setOrders([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    try {
      const mockOrders = Array.from({ length: MOCK_ORDERS_COUNT }, (_, i) => generateMockOrder(i + 1));
      setOrders(mockOrders);
    } catch (e) {
      console.error("Failed to fetch Shopify orders:", e);
      setError("Failed to fetch Shopify orders. Check console for details.");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured, config.shopDomain, config.adminApiAccessToken]);


  const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus): Promise<boolean> => {
    if (!isConfigured) {
      setError("Shopify is not configured. Cannot update order status.");
      return false;
    }
    setIsLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      console.log(`Updating Shopify order ${orderId} to status ${newStatus}`);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      return true;
    } catch (e) {
      console.error("Failed to update Shopify order status:", e);
      setError("Failed to update Shopify order status. Check console for details.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const getOrderById = useCallback((orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId);
  }, [orders]);

  const testShopifyConnection = useCallback(async (testConfig: ShopifyConfig): Promise<boolean> => {
    setIsTestingConnection(true);
    setTestConnectionError(null);
    await new Promise(resolve => setTimeout(resolve, 1200));
    try {
      if (!testConfig.shopDomain || !testConfig.adminApiAccessToken) {
        throw new Error("Shop Domain and Admin API Access Token are required for testing.");
      }
      if (testConfig.adminApiAccessToken.toLowerCase() === 'fail_token') {
          throw new Error("Simulated Admin API Access Token resulted in an error.");
      }
      console.log("Test connection with Shopify config:", testConfig, "was successful (simulated).");
      return true;
    } catch (e: any) {
      console.error("Shopify test connection failed:", e);
      setTestConnectionError(e.message || "An unknown error occurred during Shopify connection test.");
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
    testShopifyConnection,
    isTestingConnection,
    testConnectionError,
    clearTestConnectionError: () => setTestConnectionError(null),
  };
};

export default useShopify;