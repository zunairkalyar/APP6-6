import React from 'react';
import useMessageTemplates from '../hooks/useMessageTemplates';
import { OrderStatus, MessageTemplate, BrandVoiceConfig } from '../types';
import { ORDER_STATUS_OPTIONS, DEFAULT_MESSAGE_TEMPLATES, DEFAULT_BRAND_VOICE_CONFIG } from '../constants';
import TemplateEditor from './TemplateEditor';
import Alert from './ui/Alert';
import Button from './ui/Button';
import useLocalStorage from '../hooks/useLocalStorage'; // To get brand voice

interface MessageTemplatesManagerProps {}

const MessageTemplatesManager: React.FC<MessageTemplatesManagerProps> = () => {
  const { templates, updateTemplate, setTemplates } = useMessageTemplates();
  const [brandVoiceConfig] = useLocalStorage<BrandVoiceConfig>('brandVoiceConfig', DEFAULT_BRAND_VOICE_CONFIG);


  const handleSaveTemplate = (status: OrderStatus, data: MessageTemplate) => {
    updateTemplate(status, data);
    console.log(`Template for "${ORDER_STATUS_OPTIONS.find(opt => opt.value === status)?.label || status}" saved.`);
  };

  const handleResetTemplate = (status: OrderStatus) => {
    const defaultTemplate = DEFAULT_MESSAGE_TEMPLATES[status];
    if (defaultTemplate) {
      updateTemplate(status, defaultTemplate);
      console.log(`Template for "${ORDER_STATUS_OPTIONS.find(opt => opt.value === status)?.label || status}" reset to default.`);
    }
  };
  
  const handleResetAllTemplates = () => {
    setTemplates(DEFAULT_MESSAGE_TEMPLATES);
    console.log('All templates have been reset to their default values.');
  };

  return (
    <div className="space-y-6">
      <Alert type="info" title="Customize Your Messages">
        <p>
          Here you can define templates for automated messages sent to customers when their order status changes.
          Use placeholders (like <code>{'{{customerName}}'}</code> or <code>{'{{orderNumber}}'}</code>) to personalize your messages.
          Disabled templates will not be used for sending updates.
        </p>
        <div className="mt-4">
             <Button onClick={handleResetAllTemplates} variant="outline" size="sm">
                Reset All Templates to Default
            </Button>
        </div>
      </Alert>

      {ORDER_STATUS_OPTIONS.map(({ value: status, label }) => {
        const currentTemplate = templates[status] || DEFAULT_MESSAGE_TEMPLATES[status] || {
          status: status,
          subject: '',
          body: '',
          isEnabled: false, 
        };
        return (
          <TemplateEditor
            key={status}
            template={currentTemplate}
            orderStatusLabel={label}
            onSave={handleSaveTemplate}
            onReset={handleResetTemplate}
            brandVoice={brandVoiceConfig.description} // Pass brand voice
          />
        );
      })}
    </div>
  );
};

export default MessageTemplatesManager;