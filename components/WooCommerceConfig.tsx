
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import useWooCommerce from '../hooks/useWooCommerce';
import { WooCommerceConfig as WooCommerceConfigType } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import Alert from './ui/Alert';

interface WooCommerceConfigFormProps {}

const WooCommerceConfig: React.FC<WooCommerceConfigFormProps> = () => {
  const { 
    config, 
    setConfig, 
    isLoading: isSavingSettings,
    error: wooCommerceError,
    clearError,
    testWooCommerceConnection,
    isTestingConnection,
    testConnectionError,
    clearTestConnectionError
  } = useWooCommerce();

  const { register, handleSubmit, reset, formState: { errors, isDirty }, watch } = useForm<WooCommerceConfigType>({ 
    defaultValues: config,
  });
  
  const [testResult, setTestResult] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  useEffect(() => {
    reset(config);
  }, [config, reset]);

  useEffect(() => {
    // Clear test results if errors change or config changes (which might imply a save)
    setTestResult(null);
  }, [wooCommerceError, testConnectionError, config]);


  const onSubmit: SubmitHandler<WooCommerceConfigType> = (data) => {
    setConfig(data);
    console.log('WooCommerce settings saved successfully!');
    reset(data); // Reflect saved data and clear dirty state
  };

  const handleTestConnection = async () => {
    setTestResult(null); // Clear previous test results
    if(wooCommerceError) clearError(); // Clear general hook errors
    if(testConnectionError) clearTestConnectionError(); // Clear previous test connection errors

    const currentFormData = watch();

    setConfig(currentFormData);
    const success = await testWooCommerceConnection();

    if (success) {
      setTestResult({ type: 'success', message: 'WooCommerce connection successful!' });
    } else {
      setTestResult({ type: 'danger', message: `WooCommerce connection failed: ${testConnectionError || 'Unknown error'}` });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>WooCommerce Configuration</CardTitle>
        <CardDescription>Connect your WooCommerce store to manage orders and automate messages.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Display general WooCommerce hook errors if not testing and no specific test result */}
          {wooCommerceError && !isTestingConnection && !testResult && (
            <Alert type="danger" title="WooCommerce Error">
              {wooCommerceError} <Button variant="link" size="sm" onClick={clearError} className="ml-1 p-0">Dismiss</Button>
            </Alert>
          )}
          {/* Display test connection results */}
          {testResult && (
             <Alert type={testResult.type} title="Connection Test Result">
                {testResult.message}
             </Alert>
          )}
          {/* Display test connection error if it occurred during testing and no other result is set */}
          {isTestingConnection && testConnectionError && !testResult && ( //This might be redundant if testResult always gets set
            <Alert type="danger" title="Connection Test Error">
              {testConnectionError}
            </Alert>
          )}

          <Input
            label="Site URL"
            id="siteUrl"
            type="url"
            placeholder="https://yourstore.com"
            {...register('siteUrl', { 
              required: 'Site URL is required',
              pattern: {
                value: /^https?:\/\/.+/,
                message: "Enter a valid URL (e.g., https://yourstore.com)"
              }
            })}
            error={errors.siteUrl?.message}
            disabled={isSavingSettings || isTestingConnection}
          />
          <Input
            label="Consumer Key"
            id="consumerKey"
            type="text" 
            placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            {...register('consumerKey', { 
              required: 'Consumer Key is required',
              pattern: {
                value: /^ck_[a-zA-Z0-9]{40}$/,
                message: "Enter a valid Consumer Key (e.g., ck_...)"
              }
            })}
            error={errors.consumerKey?.message}
            disabled={isSavingSettings || isTestingConnection}
          />
          <Input
            label="Consumer Secret"
            id="consumerSecret"
            type="password"
            placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            {...register('consumerSecret', { 
              required: 'Consumer Secret is required',
              pattern: {
                value: /^cs_[a-zA-Z0-9]{40}$/,
                message: "Enter a valid Consumer Secret (e.g., cs_...)"
              }
              // validate: value => value.toLowerCase() !== 'fail_secret' || 'This secret is known to fail tests (mock).'
            })}
            error={errors.consumerSecret?.message}
            disabled={isSavingSettings || isTestingConnection}
          />
        </CardContent>
        <CardFooter className="justify-end space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleTestConnection} 
            isLoading={isTestingConnection}
            disabled={isSavingSettings} // Also disable if saving general settings
          >
            Test Connection
          </Button>
          <Button 
            type="submit" 
            isLoading={isSavingSettings} 
            disabled={isTestingConnection || !isDirty} // Disable if testing or form not dirty
          >
            Save Settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default WooCommerceConfig;