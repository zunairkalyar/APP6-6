
import { useState, useCallback, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { PushflowConfig } from '../types';
import { DEFAULT_PUSHFLOW_CONFIG } from '../constants';

const usePushflow = () => {
  const [config, setConfig] = useLocalStorage<PushflowConfig>('pushflowConfig', DEFAULT_PUSHFLOW_CONFIG);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(!!(config.instanceId && config.accessToken));

  useEffect(() => {
    setIsConfigured(!!(config.instanceId && config.accessToken));
  }, [config.instanceId, config.accessToken]);


  const sendPushflowMessage = useCallback(async (
    phoneNumber: string, 
    messageBody: string,
    configOverride?: PushflowConfig
  ): Promise<boolean> => {
    const activeConfig = configOverride || config;

    if (!(activeConfig.instanceId && activeConfig.accessToken)) {
      setError("Pushflow is not configured. Please provide API details.");
      console.error("Pushflow not configured. Cannot send SMS.");
      return false;
    }
    
    setIsSending(true);
    setError(null);
    
    console.log(`Simulating Pushflow SMS to ${phoneNumber}:`);
    console.log(`Using Instance ID: ${activeConfig.instanceId}`);
    // console.log(`Using Access Token: ${activeConfig.accessToken}`); // Don't log sensitive data
    console.log(`Message: ${messageBody}`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1; 
        if (success) {
          console.log("Pushflow SMS sent successfully (simulated).");
          resolve(true);
        } else {
          const mockError = "Simulated Pushflow API error: Invalid phone number or insufficient credits.";
          console.error(mockError);
          setError(mockError);
          resolve(false);
        }
        setIsSending(false);
      }, 1500);
    });
  }, [config]); // Keep `config` as dependency for the default case

  return {
    config,
    setConfig,
    sendPushflowMessage,
    isSending,
    error,
    isConfigured,
    clearError: () => setError(null)
  };
};

export default usePushflow;