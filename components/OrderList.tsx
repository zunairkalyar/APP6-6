
import React, { useEffect, useState, useMemo } from 'react';
// Removed direct import of useShopify
import OrderItemCard from './OrderItem';
import { Order, OrderStatus } from '../types';
import Button from './ui/Button';
import Alert from './ui/Alert';
import Input from './ui/Input';
import Select from './ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'; 
import { ORDER_STATUS_OPTIONS } from '../constants';

interface OrderListProps {
  orders: Order[];
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  clearError: () => void;
  platformName: string; // e.g., "Shopify" or "WooCommerce"
  onSendUpdate: (order: Order) => void;
}

const OrderList: React.FC<OrderListProps> = ({ 
  orders, 
  fetchOrders, 
  updateOrderStatus, 
  isLoading, 
  error, 
  isConfigured, 
  clearError,
  platformName,
  onSendUpdate 
}) => {
  const [updatingStatusMap, setUpdatingStatusMap] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  // Effect to fetch orders when the component mounts or platformName/isConfigured changes,
  // implying a switch or initial load for a configured platform.
  useEffect(() => {
    if (isConfigured) {
      fetchOrders();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigured, platformName]); // Add platformName to dependencies

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus): Promise<boolean> => {
    setUpdatingStatusMap(prev => ({ ...prev, [orderId]: true }));
    const success = await updateOrderStatus(orderId, newStatus);
    setUpdatingStatusMap(prev => ({ ...prev, [orderId]: false }));
    if (success) { // If successful, refetch orders to ensure data consistency
      await fetchOrders();
    }
    return success;
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          order.orderNumber.toLowerCase().includes(searchTermLower) ||
          order.customerName.toLowerCase().includes(searchTermLower) ||
          order.customerEmail.toLowerCase().includes(searchTermLower)
        );
      })
      .filter(order => {
        return statusFilter ? order.status === statusFilter : true;
      })
      .sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [orders, searchTerm, statusFilter]);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (!isConfigured) {
    return (
      <Alert type="warning" title="Not Configured">
        {platformName} settings are not configured. Please configure them in the '{platformName}' tab to view orders.
      </Alert>
    );
  }
  
  const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter & Search {platformName} Orders</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Input
            label="Search Orders"
            placeholder="Order #, Customer Name/Email"
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
          />
          <Select
            label="Filter by Status"
            options={[{ value: '', label: 'All Statuses' }, ...ORDER_STATUS_OPTIONS]}
            value={statusFilter}
            onChange={(e) => {setStatusFilter(e.target.value as OrderStatus | ''); setCurrentPage(1);}}
            placeholder="All Statuses"
          />
           <Button onClick={() => fetchOrders()} isLoading={isLoading} disabled={isLoading} leftIcon={<RefreshIcon/>}>
            Refresh Orders
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert type="danger" title={`Error Fetching ${platformName} Orders`} className="my-4">
          {error}
          <Button variant="link" onClick={clearError} className="ml-2 text-sm">Dismiss</Button>
        </Alert>
      )}

      {isLoading && orders.length === 0 && (
         <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="ml-3 text-lg text-gray-600">Loading {platformName} orders...</p>
          </div>
      )}

      {!isLoading && orders.length === 0 && !error && isConfigured && (
        <Alert type="info" title={`No ${platformName} Orders Found`}>
          No orders to display for {platformName}. Try refreshing or check your configuration.
        </Alert>
      )}
      
      {currentOrders.length > 0 && (
        <div className="space-y-4">
          {currentOrders.map((order) => (
            <OrderItemCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
              onSendUpdate={onSendUpdate}
              isUpdatingStatus={!!updatingStatusMap[order.id] || isLoading}
            />
          ))}
        </div>
      )}

      {!isLoading && filteredOrders.length === 0 && orders.length > 0 && (
         <Alert type="info" title={`No ${platformName} Orders Match Filter`}>
          No {platformName} orders match your current search term or filter.
        </Alert>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-2">
          <Button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderList;