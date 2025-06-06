import { describe, it, expect } from 'vitest';
import { replacePlaceholders } from '../lib/utils.ts';
import { OrderStatus } from '../types.ts';

const mockOrder = {
  id: '1',
  orderNumber: '#1001',
  status: OrderStatus.Shipped,
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  orderDate: new Date('2024-01-01').toISOString(),
  items: [],
  totalAmount: 123.45,
  shippingAddress: '123 Test St',
  billingAddress: '123 Test St',
  paymentMethod: 'credit',
  currency: 'USD',
  platform: 'shopify'
};

describe('replacePlaceholders', () => {
  it('substitutes values', () => {
    const template = 'Hi {{customerName}}, your order {{orderNumber}} is ready.';
    const result = replacePlaceholders(template, mockOrder);
    expect(result).toBe('Hi John Doe, your order #1001 is ready.');
  });
});

