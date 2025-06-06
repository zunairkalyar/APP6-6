export enum TabKey {
  ShopifyConfig = 'shopifyConfig',
  WooCommerceConfig = 'wooCommerceConfig',
  PushflowConfig = 'pushflowConfig',
  Orders = 'orders',
  MessageTemplates = 'messageTemplates',
  AiSettings = 'aiSettings', // Added for AI configuration
}

export interface ShopifyConfig {
  shopDomain: string; // e.g., your-store.myshopify.com
  adminApiAccessToken: string;
}

export interface WooCommerceConfig {
  siteUrl: string; // e.g., https://yourstore.com
  consumerKey: string;
  consumerSecret: string;
}

export interface PushflowConfig {
  instanceId: string;
  accessToken: string;
  defaultPhoneNumber: string;
}

export enum OrderStatus {
  Pending = 'pending',        // Payment pending, or new order awaiting processing
  Processing = 'processing',  // Order confirmed (e.g., paid), fulfillment in progress
  Shipped = 'shipped',        // Items fulfilled/shipped
  Delivered = 'delivered',    // Order confirmed received by customer (if tracking allows) / WooCommerce 'completed'
  Cancelled = 'cancelled',    // Order cancelled
  Refunded = 'refunded',      // Order refunded
  OnHold = 'on-hold',         // Order on hold for various reasons
  Failed = 'failed',          // Order failed (e.g. payment failed)
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string; // Platform-specific order ID
  orderNumber: string; // Display order number (e.g., #1001, WC Order ID)
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  currency: string;
  platform: 'shopify' | 'woocommerce'; // Added to distinguish order source
  // For AI Features (mocked for now)
  isRepeatCustomer?: boolean; 
  customerSegment?: 'VIP' | 'New' | 'Regular'; 
}

export interface MessageTemplate {
  status: OrderStatus;
  subject: string;
  body: string;
  isEnabled: boolean;
}

export type MessageTemplates = {
  [key in OrderStatus]?: MessageTemplate;
};

export interface GeneratedMessage {
  subject: string;
  body: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

// Utility type for class names
export type ClassValue = string | null | undefined | Record<string, boolean> | ClassValue[];

// AI Specific Types
export interface BrandVoiceConfig {
  description: string;
}

export interface AiGeneratedTemplate {
  subject: string;
  body: string;
}

export enum AiToneStyle {
  Friendly = 'Friendly',
  Formal = 'Formal',
  Empathetic = 'Empathetic',
  Urgent = 'Urgent',
  Playful = 'Playful',
  Concise = 'More Concise',
  Detailed = 'More Detailed',
  ActionOriented = 'Action-Oriented',
}

export interface AiCritique {
    score: string; // e.g., "Good", "Fair", "Needs Improvement"
    suggestions: string[];
}

export interface AiChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}