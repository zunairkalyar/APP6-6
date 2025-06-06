
import { ClassValue, OrderStatus, Order } from '../types'; 

export function cn(...inputs: ClassValue[]): string {
  const classList: string[] = [];

  inputs.forEach(input => {
    if (typeof input === 'string') {
      classList.push(input);
    } else if (Array.isArray(input)) {
      classList.push(cn(...input));
    } else if (typeof input === 'object' && input !== null) {
      Object.keys(input).forEach(key => {
        if (input[key]) {
          classList.push(key);
        }
      });
    }
  });

  return classList.filter(Boolean).join(' ');
}

export function replacePlaceholders(template: string, order: Order): string {
  let result = template;
  result = result.replace(/{{orderNumber}}/g, order.orderNumber);
  result = result.replace(/{{customerName}}/g, order.customerName);
  result = result.replace(/{{customerEmail}}/g, order.customerEmail);
  result = result.replace(/{{orderDate}}/g, new Date(order.orderDate).toLocaleDateString());
  result = result.replace(/{{totalAmount}}/g, order.totalAmount.toFixed(2));
  result = result.replace(/{{currency}}/g, order.currency);
  result = result.replace(/{{status}}/g, order.status); // Will show the key like 'processing'
  // To show label: you might need to pass ORDER_STATUS_OPTIONS or find label here
  // const statusLabel = ORDER_STATUS_OPTIONS.find(opt => opt.value === order.status)?.label || order.status;
  // result = result.replace(/{{statusLabel}}/g, statusLabel);
  result = result.replace(/{{shippingAddress}}/g, order.shippingAddress);
  result = result.replace(/{{billingAddress}}/g, order.billingAddress);
  result = result.replace(/{{paymentMethod}}/g, order.paymentMethod);
  
  const itemsSummary = order.items.map(item => `${item.name} (Qty: ${item.quantity})`).join(', ');
  result = result.replace(/{{itemsSummary}}/g, itemsSummary);

  return result;
}

// Updated for new Shopify OrderStatus values
export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.Pending: return 'bg-yellow-100 text-yellow-800';      // Yellow for Pending
    case OrderStatus.Processing: return 'bg-blue-100 text-blue-800';       // Blue for Processing
    case OrderStatus.Shipped: return 'bg-indigo-100 text-indigo-800';     // Indigo for Shipped
    case OrderStatus.Delivered: return 'bg-green-100 text-green-800';     // Green for Delivered/Completed
    case OrderStatus.Cancelled: return 'bg-red-100 text-red-800';         // Red for Cancelled
    case OrderStatus.Refunded: return 'bg-purple-100 text-purple-800';    // Purple for Refunded
    case OrderStatus.Failed: return 'bg-pink-100 text-pink-800';          // Pink for Failed
    case OrderStatus.OnHold: return 'bg-gray-100 text-gray-800';        // Orange for On Hold
    default: return 'bg-gray-200 text-gray-700';                         // Default Gray
  }
};

export const getStatusBorderColor = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.Pending: return 'border-yellow-500';
    case OrderStatus.Processing: return 'border-blue-500';
    case OrderStatus.Shipped: return 'border-indigo-500';
    case OrderStatus.Delivered: return 'border-green-500';
    case OrderStatus.Cancelled: return 'border-red-500';
    case OrderStatus.Refunded: return 'border-purple-500';
    case OrderStatus.Failed: return 'border-pink-500';
    case OrderStatus.OnHold: return 'border-gray-500'; // Was orange, changed to gray-500 to match bg-gray-100 better
    default: return 'border-gray-300';
  }
};