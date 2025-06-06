
import React from 'react';
import { Order, GeneratedMessage } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import usePushflow from '../hooks/usePushflow'; // To check if Pushflow is configured

interface MessagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  message: GeneratedMessage | null;
  onConfirmSend: (method: 'email' | 'sms', order: Order, message: GeneratedMessage) => Promise<void>;
  isSending: boolean;
}

const MessagePreviewModal: React.FC<MessagePreviewModalProps> = ({
  isOpen,
  onClose,
  order,
  message,
  onConfirmSend,
  isSending,
}) => {
  const { isConfigured: isPushflowConfigured, config: pushflowConfig } = usePushflow();

  if (!isOpen || !order || !message) {
    return null;
  }
  
  const phoneNumberForSms = order.shippingAddress.match(/\+?[0-9\s-()]{7,}/)?.[0]?.replace(/[\s-()]/g, '') || pushflowConfig.defaultPhoneNumber;

  const handleSend = async (method: 'email' | 'sms') => {
    await onConfirmSend(method, order, message);
    // Optionally close modal after send attempt, or let parent handle it based on success
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Preview Message for Order ${order.orderNumber}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            onClick={() => handleSend('email')}
            variant="secondary"
            isLoading={isSending} // Assuming isSending reflects both email/SMS sending attempt
            disabled={isSending}
          >
            Send Email (Simulated)
          </Button>
          <Button
            onClick={() => handleSend('sms')}
            isLoading={isSending}
            disabled={isSending || !isPushflowConfigured || !phoneNumberForSms}
            title={!isPushflowConfigured ? "Pushflow not configured" : (!phoneNumberForSms ? "No valid phone number for SMS" : "Send SMS via Pushflow")}
          >
            Send SMS via Pushflow
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-700">To:</h4>
          <p className="text-sm text-gray-600">{order.customerName} ({order.customerEmail})</p>
          {phoneNumberForSms && <p className="text-sm text-gray-600">SMS to: {phoneNumberForSms}</p>}
           {!phoneNumberForSms && isPushflowConfigured && <p className="text-sm text-yellow-600">No phone number found for SMS. Check order details or Pushflow default.</p>}
        </div>
        <div>
          <h4 className="font-semibold text-gray-700">Subject:</h4>
          <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded border border-gray-200">{message.subject}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700">Body:</h4>
          <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded border border-gray-200 whitespace-pre-wrap h-48 overflow-y-auto">
            {message.body}
          </div>
        </div>
         {!isPushflowConfigured && (
            <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
              Pushflow SMS sending is disabled because Pushflow is not configured.
            </p>
          )}
      </div>
    </Modal>
  );
};

export default MessagePreviewModal;
