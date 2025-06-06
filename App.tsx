import React, { useState, useCallback, useEffect } from 'react';
import { TabKey, Order, GeneratedMessage, BrandVoiceConfig } from './types'; // Removed ShopifyConfig, PushflowConfig, WooCommerceConfig as they are not directly used here
import { APP_TABS, APP_NAME, DEFAULT_BRAND_VOICE_CONFIG } from './constants';
import TabsNav from './components/ui/TabsNav';
import ShopifyConfigComponent from './components/ShopifyConfig';
import WooCommerceConfigComponent from './components/WooCommerceConfig';
import PushflowConfigComponent from './components/PushflowConfig';
import OrderListComponent from './components/OrderList';
import MessageTemplatesManager from './components/MessageTemplates';
import MessagePreviewModal from './components/MessagePreviewModal';
import AiSettingsComponent from './components/AiSettings'; // Added
import AiHelpChat from './components/AiHelpChat'; // Added
import useShopify from './hooks/useShopify';
import useWooCommerce from './hooks/useWooCommerce';
import usePushflow from './hooks/usePushflow';
import useMessageTemplates from './hooks/useMessageTemplates';
import useLocalStorage from './hooks/useLocalStorage'; // Added
import useToasts, { Toaster } from './hooks/useToasts'; // Added Toaster
import { cn } from './lib/utils';
import Button from './components/ui/Button';

// Icons for tabs
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A2.25 2.25 0 0011.25 11.25H6.75A2.25 2.25 0 004.5 13.5V21M6.75 21H21M21 21v-7.5A2.25 2.25 0 0018.75 11.25h-5.25A2.25 2.25 0 0011.25 13.5V21M4.5 11.25h6.75M12.75 11.25H19.5m-15 0A2.25 2.25 0 016.75 9h10.5a2.25 2.25 0 012.25 2.25M4.5 6.75h15M4.5 3.75h15M4.5 3.75a2.25 2.25 0 01-2.25-2.25V1.5M19.5 3.75a2.25 2.25 0 002.25-2.25V1.5m-15 15h15" /></svg>;
const WooIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6H2.25m0 0a3.001 3.001 0 003.75 2.25l.155L11.25 6H12m0 0M21.75 12a9 9 0 11-18 0 9 9 0 0118 0zM12 4.875c-.621 0-1.125.504-1.125 1.125v6.75c0 .621.504 1.125 1.125 1.125s1.125-.504 1.125-1.125V6c0-.621-.504-1.125-1.125-1.125z" /></svg>; 
const SmsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>;
const EnvelopeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>;
const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.003 1.11-.962a8.25 8.25 0 014.594 4.593c.04.55-.422 1.02-.962 1.11m-4.594 4.593c-.09.542-.56 1.003-1.11.962a8.25 8.25 0 00-4.594-4.593c-.04-.55.422-1.02.962-1.11M14 9a3 3 0 11-6 0 3 3 0 016 0zm-9.594-4.593c.09-.542.56-1.003 1.11-.962a8.25 8.25 0 014.594 4.593c.04.55-.422 1.02-.962 1.11m-4.594 4.593c-.09.542-.56 1.003-1.11.962a8.25 8.25 0 00-4.594-4.593c-.04-.55.422-1.02.962-1.11M16.5 10.5M16.5 13.5M16.5 7.5" /></svg>; // Simple Cog for AI Settings

const TAB_ICONS: Record<TabKey, React.ReactNode> = {
  [TabKey.ShopifyConfig]: <StoreIcon />,
  [TabKey.WooCommerceConfig]: <WooIcon />,
  [TabKey.PushflowConfig]: <SmsIcon />,
  [TabKey.Orders]: <ListIcon />,
  [TabKey.MessageTemplates]: <EnvelopeIcon />,
  [TabKey.AiSettings]: <CogIcon />, // Added
};

type ActiveDisplayPlatform = 'shopify' | 'woocommerce';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>(TabKey.ShopifyConfig);
  const [activeDisplayPlatform, setActiveDisplayPlatform] = useState<ActiveDisplayPlatform>('shopify');
  
  const shopify = useShopify();
  const wooCommerce = useWooCommerce();
  const pushflow = usePushflow();
  const messageTemplates = useMessageTemplates();
  const { toasts, removeToast, addToast } = useToasts(); // Added addToast
  const [brandVoiceConfig] = useLocalStorage<BrandVoiceConfig>('brandVoiceConfig', DEFAULT_BRAND_VOICE_CONFIG); // To pass to components


  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedOrderForPreview, setSelectedOrderForPreview] = useState<Order | null>(null);
  const [generatedMessageForPreview, setGeneratedMessageForPreview] = useState<GeneratedMessage | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    if (shopify.isConfigured) {
        setActiveDisplayPlatform('shopify');
    } else if (wooCommerce.isConfigured) {
        setActiveDisplayPlatform('woocommerce');
    }
    
    if (activeTab === TabKey.Orders && !shopify.isConfigured && !wooCommerce.isConfigured) {
        setActiveTab(TabKey.ShopifyConfig); 
        addToast("Please configure Shopify or WooCommerce to view orders.", "warning");
    }
  }, [shopify.isConfigured, wooCommerce.isConfigured, activeTab, addToast]);

  const handleTabChange = (tabKey: TabKey) => {
    if (tabKey === TabKey.Orders && !shopify.isConfigured && !wooCommerce.isConfigured) {
      setActiveTab(TabKey.ShopifyConfig); 
      addToast("Please configure Shopify or WooCommerce first.", "warning");
      return;
    }
    setActiveTab(tabKey);
  };

  const handleShowMessagePreview = useCallback((order: Order) => {
    const message = messageTemplates.generateMessage(order);
    if (message) {
      setSelectedOrderForPreview(order);
      setGeneratedMessageForPreview(message);
      setIsPreviewModalOpen(true);
    } else {
      addToast(`Message template for status "${order.status}" is disabled or not found.`, "warning");
    }
  }, [messageTemplates, addToast]);

  const handleConfirmSend = async (method: 'email' | 'sms', order: Order, message: GeneratedMessage) => {
    setIsSendingMessage(true);
    if (method === 'email') {
      console.log('Simulating email send:', { to: order.customerEmail, subject: message.subject, body: message.body, platform: order.platform });
      await new Promise(resolve => setTimeout(resolve, 1000));
      addToast(`Simulated email sent to ${order.customerEmail}.`, "success");
    } else if (method === 'sms') {
        const phoneNumberForSms = order.shippingAddress.match(/\+?[0-9\s-()]{7,}/)?.[0]?.replace(/[\s-()]/g, '') || pushflow.config.defaultPhoneNumber;
        if (!phoneNumberForSms) {
             addToast(`No phone number for order ${order.orderNumber} to send SMS.`, "error");
             setIsSendingMessage(false);
             return;
        }
      const success = await pushflow.sendPushflowMessage(phoneNumberForSms, `${message.subject}\n${message.body}`);
      if (success) {
        addToast(`Pushflow SMS sent successfully (simulated).`, "success");
      } else {
        addToast(`Failed to send Pushflow SMS: ${pushflow.error || 'Unknown error'}.`, "error");
      }
    }
    setIsSendingMessage(false);
    setIsPreviewModalOpen(false);
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case TabKey.ShopifyConfig:
        return <ShopifyConfigComponent />;
      case TabKey.WooCommerceConfig:
        return <WooCommerceConfigComponent />;
      case TabKey.PushflowConfig:
        return <PushflowConfigComponent />;
      case TabKey.AiSettings: // Added
        return <AiSettingsComponent />;
      case TabKey.Orders:
        const platformHooks = { shopify: shopify, woocommerce: wooCommerce };
        const currentPlatformHook = platformHooks[activeDisplayPlatform];
        return <OrderListComponent 
                    orders={currentPlatformHook.orders}
                    fetchOrders={currentPlatformHook.fetchOrders}
                    updateOrderStatus={currentPlatformHook.updateOrderStatus}
                    isLoading={currentPlatformHook.isLoading}
                    error={currentPlatformHook.error}
                    isConfigured={currentPlatformHook.isConfigured}
                    clearError={currentPlatformHook.clearError}
                    platformName={activeDisplayPlatform === 'shopify' ? 'Shopify' : 'WooCommerce'}
                    onSendUpdate={handleShowMessagePreview}
                />;
      case TabKey.MessageTemplates:
        return <MessageTemplatesManager />; // brandVoice will be read from localStorage inside
      default:
        return <p>Select a tab</p>;
    }
  };

  const appTabsForNav = APP_TABS.map(tab => ({
    ...tab,
    icon: TAB_ICONS[tab.key],
    disabled: tab.key === TabKey.Orders && !shopify.isConfigured && !wooCommerce.isConfigured,
  }));
  
  const showPlatformSwitcher = shopify.isConfigured && wooCommerce.isConfigured;

  return (
    <div className="min-h-screen bg-background text-onBackground">
      <Toaster toasts={toasts} removeToast={removeToast} /> {/* Added Toaster */}
      <header className="bg-surface shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-primary">{APP_NAME}</h1>
            {showPlatformSwitcher && activeTab === TabKey.Orders && (
                 <div className="flex items-center space-x-1 p-1 bg-gray-200 rounded-lg">
                    <Button
                        size="sm"
                        variant={activeDisplayPlatform === 'shopify' ? 'primary' : 'ghost'}
                        onClick={() => setActiveDisplayPlatform('shopify')}
                        className={cn("!px-3 !py-1", activeDisplayPlatform === 'shopify' ? 'shadow-md' : '')}
                    >
                        Shopify Orders
                    </Button>
                    <Button
                        size="sm"
                        variant={activeDisplayPlatform === 'woocommerce' ? 'primary' : 'ghost'}
                        onClick={() => setActiveDisplayPlatform('woocommerce')}
                        className={cn("!px-3 !py-1", activeDisplayPlatform === 'woocommerce' ? 'shadow-md' : '')}
                    >
                        WooCommerce Orders
                    </Button>
                 </div>
            )}
             <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1" title={shopify.isConfigured ? "Shopify Connected" : "Shopify Not Connected"}>
                    <span className={cn("w-2.5 h-2.5 rounded-full", shopify.isConfigured ? "bg-success" : "bg-danger")}></span>
                    <span className="text-xs text-gray-500">Shopify</span>
                </div>
                <div className="flex items-center space-x-1" title={wooCommerce.isConfigured ? "WooCommerce Connected" : "WooCommerce Not Connected"}>
                    <span className={cn("w-2.5 h-2.5 rounded-full", wooCommerce.isConfigured ? "bg-success" : "bg-danger")}></span>
                    <span className="text-xs text-gray-500">WooCommerce</span>
                </div>
                 <div className="flex items-center space-x-1" title={pushflow.isConfigured ? "Pushflow Connected" : "Pushflow Not Connected"}>
                    <span className={cn("w-2.5 h-2.5 rounded-full", pushflow.isConfigured ? "bg-success" : "bg-danger")}></span>
                    <span className="text-xs text-gray-500">Pushflow</span>
                </div>
            </div>
          </div>
          <TabsNav tabs={appTabsForNav} activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-surface shadow-lg rounded-lg p-4 sm:p-6 lg:p-8">
          {renderTabContent()}
        </div>
      </main>
      
      <AiHelpChat /> {/* Added AI Help Chat FAB */}

      <footer className="text-center py-4 mt-8 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} {APP_NAME}. AI Features Powered by Google Gemini.
      </footer>

      <MessagePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        order={selectedOrderForPreview}
        message={generatedMessageForPreview}
        onConfirmSend={handleConfirmSend}
        isSending={isSendingMessage}
      />
    </div>
  );
};

export default App;
