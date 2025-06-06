
import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { ORDER_STATUS_OPTIONS } from '../constants';
import Button from './ui/Button';
import Select from './ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import { getStatusColor, getStatusBorderColor, cn } from '../lib/utils';

interface OrderItemProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<boolean>;
  onSendUpdate: (order: Order) => void;
  isUpdatingStatus: boolean;
}

const OrderItemCard: React.FC<OrderItemProps> = ({ order, onStatusChange, onSendUpdate, isUpdatingStatus }) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setSelectedStatus(newStatus); // Optimistically update UI for select
    if (newStatus === order.status) return;

    setIsSubmittingStatus(true);
    await onStatusChange(order.id, newStatus);
    setIsSubmittingStatus(false);
    // The parent OrderList will refresh orders, which should update the `order.status` prop
  };

  const statusColorClass = getStatusColor(order.status);
  const statusBorderColorClass = getStatusBorderColor(order.status);

  const ItemIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125-1.125V6.375c0 .621.504 1.125 1.125 1.125z" /></svg>;
  const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
  const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008z" /></svg>;
  const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>;


  return (
    <Card className={cn("border-l-4", statusBorderColorClass)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Order {order.orderNumber}</CardTitle>
            <CardDescription>
              <span className={cn("px-2 py-0.5 text-xs font-semibold rounded-full", statusColorClass)}>
                {ORDER_STATUS_OPTIONS.find(opt => opt.value === order.status)?.label || order.status}
              </span>
            </CardDescription>
          </div>
          <div className="text-lg font-semibold text-primary">
            {order.currency} {order.totalAmount.toFixed(2)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center text-gray-600">
          <UserIcon />
          <span>{order.customerName} ({order.customerEmail})</span>
        </div>
        <div className="flex items-center text-gray-600">
          <CalendarIcon />
          <span>Ordered on: {new Date(order.orderDate).toLocaleDateString()}</span>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-1">Items:</h4>
          <ul className="list-disc list-inside pl-1 space-y-0.5">
            {order.items.map(item => (
              <li key={item.id} className="text-gray-600">
                {item.name} (x{item.quantity}) - {order.currency} {(item.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
         <div className="space-y-1">
          <p className="text-gray-600"><strong className="font-medium text-gray-700">Shipping:</strong> {order.shippingAddress}</p>
          <p className="text-gray-600"><strong className="font-medium text-gray-700">Payment:</strong> {order.paymentMethod}</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-2">
        <Select
          options={ORDER_STATUS_OPTIONS}
          value={selectedStatus} // Use local selectedStatus for responsiveness
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          disabled={isUpdatingStatus || isSubmittingStatus}
          className="min-w-[180px] sm:w-auto"
          containerClassName="w-full sm:w-auto"
        />
        <Button
          onClick={() => onSendUpdate(order)}
          variant="secondary"
          size="md"
          disabled={isUpdatingStatus || isSubmittingStatus}
          className="w-full sm:w-auto"
          leftIcon={<SendIcon/>}
        >
          Send Update
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrderItemCard;
