
import React, { useState }  from 'react';
import { AiGeneratedTemplate } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Textarea from './ui/Textarea';
import Alert from './ui/Alert';
import useGemini from '../hooks/useGemini';
import { AI_SYSTEM_INSTRUCTION_ECOMMERCE_COPYWRITER } from '../constants';
import useToasts from '../hooks/useToasts'; // Added

interface AiSmartTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: AiGeneratedTemplate) => void;
  brandVoice?: string;
  orderStatusLabel: string;
}

const AiSmartTemplateModal: React.FC<AiSmartTemplateModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  brandVoice,
  orderStatusLabel,
}) => {
  const [intent, setIntent] = useState('');
  const { isLoading, error, generateText, clearError } = useGemini();
  const { addToast } = useToasts(); // Added

  const handleSubmit = async () => {
    if (!intent.trim()) {
      addToast("Please describe the intent of the message.", 'warning');
      return;
    }
    clearError();

    const prompt = `Generate a message subject and body for an order status update: '${orderStatusLabel}'. 
User's intent for this message: "${intent}".
Include relevant placeholders like {{customerName}}, {{orderNumber}}, etc., where appropriate.`;

    const result = await generateText(prompt, AI_SYSTEM_INSTRUCTION_ECOMMERCE_COPYWRITER, brandVoice, true);

    if (result) {
      try {
        const parsedResult: AiGeneratedTemplate = JSON.parse(result);
        if (parsedResult.subject && parsedResult.body) {
          onApplyTemplate(parsedResult);
        } else {
            console.error("AI response missing subject or body:", parsedResult);
            addToast("AI generation failed: Missing subject or body. Please try again or refine your intent.", 'error');
        }
      } catch (e) {
        console.error("Failed to parse AI response as JSON:", result, e);
        addToast("AI generation failed: Could not parse response. Please try again or refine your intent.", 'error');
      }
    } else if (!error) { 
        addToast("AI generation failed. Please try again.", 'error');
    }
    // If 'error' from useGemini is set, it will be displayed by the Alert component.
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`AI Generate Template for: ${orderStatusLabel}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading} disabled={!intent.trim()}>
            Generate & Apply
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert type="danger" title="AI Error">{error}</Alert>}
        <Textarea
          label="Describe the purpose or key message for this template:"
          placeholder="e.g., Apologize for a shipping delay due to a specific reason and offer a small discount. Or, thank a first-time customer and highlight return policy."
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          rows={5}
          disabled={isLoading}
        />
        <Alert type="info">
            The AI will use this description, along with your configured brand voice (if any), 
            to generate a subject and body for the template.
            You can always edit the generated content afterwards.
        </Alert>
      </div>
    </Modal>
  );
};

export default AiSmartTemplateModal;
