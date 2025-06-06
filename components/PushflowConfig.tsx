
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import usePushflow from '../hooks/usePushflow';
import { PushflowConfig as PushflowConfigType } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import Alert from './ui/Alert';

interface PushflowConfigFormProps {}

const PushflowConfig: React.FC<PushflowConfigFormProps> = () => {
  const { config, setConfig, isSending, error: hookError, sendPushflowMessage, clearError } = usePushflow();
  const { register, handleSubmit, reset, formState: { errors, isDirty }, watch } = useForm<PushflowConfigType>({
    defaultValues: config,
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [testPhoneNumber, setTestPhoneNumber] = useState(config.defaultPhoneNumber || '');

  useEffect(() => {
    reset(config);
    setTestPhoneNumber(config.defaultPhoneNumber || '');
  }, [config, reset]);

  const onSubmitHandler: SubmitHandler<PushflowConfigType> = (data) => {
    setConfig(data);
    console.log('Pushflow SMS settings saved successfully!');
    reset(data); // Clear dirty state after saving
  };

  const handleTestSend = async () => {
    if (!testPhoneNumber) {
      setTestResult({ type: 'danger', message: 'Please enter a phone number to send a test SMS.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    clearError(); 

    const currentFormValues = watch(); 
    
    // Pass currentFormValues directly to sendPushflowMessage for the test
    const success = await sendPushflowMessage(
      testPhoneNumber, 
      'This is a test message from Store Connect (Pushflow Configuration).',
      currentFormValues // Use current form values for this test send
    );
    
    if (success) {
      setTestResult({ type: 'success', message: `Test SMS sent to ${testPhoneNumber} successfully! (Simulated)` });
    } else {
      setTestResult({ type: 'danger', message: `Failed to send test SMS: ${hookError || 'Unknown error'} (Simulated)` });
    }
    setIsTesting(false);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Pushflow SMS Configuration</CardTitle>
        <CardDescription>Set up your Pushflow credentials to send SMS notifications.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <CardContent className="space-y-4">
          {hookError && !isTesting && !testResult && <Alert type="danger" title="Pushflow Hook Error">{hookError}</Alert>}
          {testResult && <Alert type={testResult.type} title="SMS Test Result">{testResult.message}</Alert>}
          <Input
            label="Instance ID"
            id="instanceId"
            {...register('instanceId', { required: 'Instance ID is required' })}
            error={errors.instanceId?.message}
            disabled={isSending || isTesting}
            placeholder="e.g., 12345"
          />
          <Input
            label="Access Token"
            id="accessToken"
            type="password"
            {...register('accessToken', { required: 'Access Token is required' })}
            error={errors.accessToken?.message}
            disabled={isSending || isTesting}
            placeholder="e.g., your_access_token"
          />
          <Input
            label="Default Sender Phone Number (Optional)"
            id="defaultPhoneNumber"
            type="tel"
            {...register('defaultPhoneNumber')}
            error={errors.defaultPhoneNumber?.message}
            disabled={isSending || isTesting}
            placeholder="e.g., +12345678900 (international format)"
          />
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-700 mb-2">Test SMS</h4>
            <Input
              label="Test Phone Number"
              id="testPhoneNumber"
              type="tel"
              value={testPhoneNumber}
              onChange={(e) => setTestPhoneNumber(e.target.value)}
              placeholder="Enter phone number for test SMS"
              disabled={isSending || isTesting} 
              containerClassName="mb-2"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleTestSend} 
              isLoading={isTesting}
              disabled={isSending || !watch('instanceId') || !watch('accessToken')} 
            >
              Send Test SMS
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button 
            type="submit" 
            isLoading={isSending} 
            disabled={isTesting || !isDirty} 
          >
            Save Settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PushflowConfig;