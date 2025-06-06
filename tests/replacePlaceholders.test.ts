import test from 'node:test';
import assert from 'node:assert/strict';
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

test('replacePlaceholders substitutes values', () => {
  const template = 'Hi {{customerName}}, your order {{orderNumber}} is ready.';
  const result = replacePlaceholders(template, mockOrder);
  assert.equal(result, 'Hi John Doe, your order #1001 is ready.');
});

test('unknown placeholders remain unchanged', () => {
  const template = 'Code {{doesNotExist}} for {{customerName}}';
  const result = replacePlaceholders(template, mockOrder);
  assert.equal(result, 'Code {{doesNotExist}} for John Doe');
});
