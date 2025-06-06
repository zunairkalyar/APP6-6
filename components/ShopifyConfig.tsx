
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import useShopify from '../hooks/useShopify'; // Changed to useShopify
import { ShopifyConfig as ShopifyConfigType } from '../types'; // Changed to ShopifyConfigType
import Button from './ui/Button';
import Input from './ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import Alert from './ui/Alert';

interface ShopifyConfigFormProps {}

const ShopifyConfig: React.FC<ShopifyConfigFormProps> = () => {
  const { 
    config, 
    setConfig, 
    isLoading: isSavingSettings,
    error: shopifyError, // Renamed from wooCommerceError
    clearError,
    testShopifyConnection, // Renamed
    isTestingConnection,
    testConnectionError,
    clearTestConnectionError
  } = useShopify(); // Changed to useShopify

  const { register, handleSubmit, reset, formState: { errors, isDirty }, watch } = useForm<ShopifyConfigType>({ 
    defaultValues: config,
  });
  
  const [testResult, setTestResult] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  useEffect(() => {
    reset(config);
  }, [config, reset]);

  useEffect(() => {
    setTestResult(null);
  }, [shopifyError, testConnectionError, config]);


  const onSubmit: SubmitHandler<ShopifyConfigType> = (data) => {
    setConfig(data);
    console.log('Shopify settings saved successfully!');
    reset(data); 
  };

  const handleTestConnection = async () => {
    setTestResult(null);
    if(shopifyError) clearError();
    if(testConnectionError) clearTestConnectionError();

    const currentFormData = watch(); 
    
    const success = await testShopifyConnection(currentFormData); // Renamed

    if (success) {
      setTestResult({ type: 'success', message: 'Shopify connection successful! (Simulated)' });
    } else {
      setTestResult({ type: 'danger', message: `Shopify connection failed: ${testConnectionError || 'Unknown error'} (Simulated)` });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shopify Configuration</CardTitle>
        <CardDescription>Connect your Shopify store to manage orders and automate messages.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {shopifyError && !isTestingConnection && !testResult && (
            <Alert type="danger" title="Shopify Error">
              {shopifyError} <Button variant="link" size="sm" onClick={clearError} className="ml-1 p-0">Dismiss</Button>
            </Alert>
          )}
          {testResult && (
             <Alert type={testResult.type} title="Connection Test Result">
                {testResult.message}
             </Alert>
          )}
          {isTestingConnection && testConnectionError && !testResult && (
            <Alert type="danger" title="Connection Test Error">
              {testConnectionError}
            </Alert>
          )}

          <Input
            label="Shop Domain"
            id="shopDomain"
            type="text"
            placeholder="your-store.myshopify.com"
            {...register('shopDomain', { 
              required: 'Shop Domain is required',
              pattern: {
                value: /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/,
                message: "Enter a valid Shopify domain (e.g., your-store.myshopify.com)"
              }
            })}
            error={errors.shopDomain?.message}
            disabled={isSavingSettings || isTestingConnection}
          />
          <Input
            label="Admin API Access Token"
            id="adminApiAccessToken"
            type="password" // Keep as password for security
            placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            {...register('adminApiAccessToken', { 
              required: 'Admin API Access Token is required',
              // validate: value => value.toLowerCase() !== 'fail_token' || 'This token is known to fail tests (mock).'
            })}
            error={errors.adminApiAccessToken?.message}
            disabled={isSavingSettings || isTestingConnection}
          />
        </CardContent>
        <CardFooter className="justify-end space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleTestConnection} 
            isLoading={isTestingConnection}
            disabled={isSavingSettings}
          >
            Test Connection
          </Button>
          <Button 
            type="submit" 
            isLoading={isSavingSettings} 
            disabled={isTestingConnection || !isDirty}
          >
            Save Settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ShopifyConfig;
