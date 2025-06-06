import { TabKey, OrderStatus, ShopifyConfig, PushflowConfig, MessageTemplates, WooCommerceConfig } from './types';

export const APP_NAME = "Store Connect";

export const APP_TABS: { key: TabKey; label: string; icon?: React.ReactNode }[] = [
  { key: TabKey.ShopifyConfig, label: 'Shopify' },
  { key: TabKey.WooCommerceConfig, label: 'WooCommerce' },
  { key: TabKey.PushflowConfig, label: 'Pushflow SMS' },
  { key: TabKey.Orders, label: 'Orders' },
  { key: TabKey.MessageTemplates, label: 'Templates' },
];

export const DEFAULT_SHOPIFY_CONFIG: ShopifyConfig = {
  shopDomain: '',
  adminApiAccessToken: '',
};

export const DEFAULT_WOOCOMMERCE_CONFIG: WooCommerceConfig = {
  siteUrl: '',
  consumerKey: '',
  consumerSecret: '',
};

export const DEFAULT_PUSHFLOW_CONFIG: PushflowConfig = {
  instanceId: '',
  accessToken: '',
  defaultPhoneNumber: '',
};


export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: OrderStatus.Pending, label: 'Pending' },
  { value: OrderStatus.Processing, label: 'Processing' },
  { value: OrderStatus.Shipped, label: 'Shipped' },
  { value: OrderStatus.Delivered, label: 'Delivered / Completed' },
  { value: OrderStatus.OnHold, label: 'On Hold' },
  { value: OrderStatus.Cancelled, label: 'Cancelled' },
  { value: OrderStatus.Refunded, label: 'Refunded' },
  { value: OrderStatus.Failed, label: 'Failed' },
];

export const DEFAULT_MESSAGE_TEMPLATES: MessageTemplates = {
  [OrderStatus.Pending]: {
    status: OrderStatus.Pending,
    subject: 'Your Order {{orderNumber}} is Pending',
    body: `Hi {{customerName}},\n\nThank you for your order! Your order #{{orderNumber}} is currently pending. We will notify you once it's confirmed and processing.\n\nOrder Total: {{currency}} {{totalAmount}}\n\nThanks,\n${APP_NAME} Team`,
    isEnabled: true,
  },
  [OrderStatus.Processing]: {
    status: OrderStatus.Processing,
    subject: 'Your Order {{orderNumber}} is Being Processed',
    body: `Hi {{customerName}},\n\nGreat news! We've received your order #{{orderNumber}}, and it's now being processed. We'll let you know when it ships.\n\nThanks,\n${APP_NAME} Team`,
    isEnabled: true,
  },
  [OrderStatus.Shipped]: {
    status: OrderStatus.Shipped,
    subject: 'Your Order {{orderNumber}} Has Shipped!',
    body: `Hi {{customerName}},\n\nYour order #{{orderNumber}} has shipped! If a tracking number is available, it is [Tracking Link/Number].\nExpected delivery: [Date]\n\nThanks for shopping with us,\n${APP_NAME} Team`,
    isEnabled: true,
  },
  [OrderStatus.Delivered]: { 
    status: OrderStatus.Delivered,
    subject: 'Your Order {{orderNumber}} Has Been Delivered/Completed',
    body: `Hi {{customerName}},\n\nOur records show that your order #{{orderNumber}} has been delivered or completed. We hope you enjoy your purchase!\n\nIf you have any questions, feel free to contact us.\n\nThanks,\n${APP_NAME} Team`,
    isEnabled: true,
  },
  [OrderStatus.Cancelled]: {
    status: OrderStatus.Cancelled,
    subject: 'Your Order {{orderNumber}} Has Been Cancelled',
    body: `Hi {{customerName}},\n\nWe're writing to inform you that your order #{{orderNumber}} has been cancelled as requested or due to an issue. If you have any questions, please contact our support team.\n\nThanks,\n${APP_NAME} Team`,
    isEnabled: true,
  },
   [OrderStatus.OnHold]: {
    status: OrderStatus.OnHold,
    subject: 'Your Order {{orderNumber}} is On Hold',
    body: `Hi {{customerName}},\n\nYour order #{{orderNumber}} is currently on hold. This may be for verification or another reason. We will update you shortly with more information or next steps.\n\nThanks,\n${APP_NAME} Team`,
    isEnabled: true,
  },
  [OrderStatus.Refunded]: {
    status: OrderStatus.Refunded,
    subject: 'A Refund Has Been Processed for Order {{orderNumber}}',
    body: `Hi {{customerName}},\n\nWe've processed a refund related to your order #{{orderNumber}}. The amount of {{currency}} {{totalAmount}} (or partial amount) should reflect in your account within a few business days.\n\nThanks,\n${APP_NAME} Team`,
    isEnabled: true,
  },
  [OrderStatus.Failed]: {
    status: OrderStatus.Failed,
    subject: 'Action Required: Issue with Your Order {{orderNumber}}',
    body: `Hi {{customerName}},\n\nThere was an issue with processing your order #{{orderNumber}} (e.g., payment failed), and it has been marked as failed. Please contact us or try placing your order again.\n\nThanks,\n${APP_NAME} Team`,
    isEnabled: true,
  },
};

Object.values(OrderStatus).forEach(status => {
  if (!DEFAULT_MESSAGE_TEMPLATES[status]) {
    const statusLabel = ORDER_STATUS_OPTIONS.find(opt => opt.value === status)?.label || status;
    DEFAULT_MESSAGE_TEMPLATES[status] = {
      status: status,
      subject: `Update for Order {{orderNumber}} - Status: ${statusLabel}`,
      body: `Hi {{customerName}},\n\nYour order #{{orderNumber}} status has been updated to ${statusLabel}.\n\nThanks,\n${APP_NAME} Team`,
      isEnabled: false,
    };
  }
});

export const MOCK_ORDERS_COUNT = 15;
export const PLACEHOLDER_OPTIONS = [
    { placeholder: "{{orderNumber}}", description: "Order Number (e.g., #1001)" },
    { placeholder: "{{customerName}}", description: "Customer's Full Name" },
    { placeholder: "{{customerEmail}}", description: "Customer's Email Address" },
    { placeholder: "{{orderDate}}", description: "Date of the Order" },
    { placeholder: "{{totalAmount}}", description: "Total Amount of the Order" },
    { placeholder: "{{currency}}", description: "Order Currency (e.g., USD)" },
    { placeholder: "{{status}}", description: "Current Order Status" },
    { placeholder: "{{shippingAddress}}", description: "Shipping Address" },
    { placeholder: "{{billingAddress}}", description: "Billing Address" },
    { placeholder: "{{paymentMethod}}", description: "Payment Method Used" },
    { placeholder: "{{itemsSummary}}", description: "Summary of items (e.g., Product A (Qty: 1), Product B (Qty: 2))" },
  ];
