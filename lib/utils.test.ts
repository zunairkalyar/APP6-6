import { describe, it, expect } from 'vitest';
import { replacePlaceholders } from './utils';
import { OrderStatus, Order } from '../types';

const mockOrder: Order = {
  id: '1',
  orderNumber: '#1001',
  status: OrderStatus.Shipped,
  customerName: 'Jane Doe',
  customerEmail: 'jane@example.com',
  orderDate: new Date('2024-01-01').toISOString(),
  items: [
    { id: '1', name: 'Widget', quantity: 2, price: 10 },
    { id: '2', name: 'Gadget', quantity: 1, price: 15 }
  ],
  totalAmount: 35,
  shippingAddress: '123 Test St',
  billingAddress: '123 Test St',
  paymentMethod: 'credit card',
  currency: 'USD',
  platform: 'shopify'
};

describe('replacePlaceholders', () => {
  it('substitutes placeholders with order values', () => {
    const template = 'Order {{orderNumber}} for {{customerName}}: {{itemsSummary}}, total {{totalAmount}} {{currency}}.';
    const result = replacePlaceholders(template, mockOrder);
    expect(result).toBe('Order #1001 for Jane Doe: Widget (Qty: 2), Gadget (Qty: 1), total 35.00 USD.');
  });
});
