
import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { MessageTemplates, MessageTemplate, OrderStatus, Order, GeneratedMessage } from '../types';
import { DEFAULT_MESSAGE_TEMPLATES } from '../constants';
import { replacePlaceholders } from '../lib/utils';

const useMessageTemplates = () => {
  const [templates, setTemplates] = useLocalStorage<MessageTemplates>(
    'messageTemplates',
    DEFAULT_MESSAGE_TEMPLATES
  );

  const updateTemplate = useCallback((status: OrderStatus, newTemplate: Partial<MessageTemplate>) => {
    setTemplates(prevTemplates => {
      const existingTemplate = prevTemplates[status] || { 
        status, 
        subject: '', 
        body: '', 
        isEnabled: true 
      };
      return {
        ...prevTemplates,
        [status]: { ...existingTemplate, ...newTemplate },
      };
    });
  }, [setTemplates]);

  const getTemplate = useCallback((status: OrderStatus): MessageTemplate | undefined => {
    return templates[status];
  }, [templates]);

  const generateMessage = useCallback((order: Order): GeneratedMessage | null => {
    const template = templates[order.status];
    if (!template || !template.isEnabled) {
      return null; // Or return a default message if template is missing/disabled
    }
    
    const subject = replacePlaceholders(template.subject, order);
    const body = replacePlaceholders(template.body, order);

    return { subject, body };
  }, [templates]);

  return { templates, updateTemplate, getTemplate, generateMessage, setTemplates };
};

export default useMessageTemplates;
