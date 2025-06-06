
import React, { useState } from 'react';
import { AiGeneratedTemplate, AiToneStyle } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Select from './ui/Select';
import Alert from './ui/Alert';
import useGemini from '../hooks/useGemini';
import { AI_SYSTEM_INSTRUCTION_TONE_ADJUSTER } from '../constants';
import useToasts from '../hooks/useToasts'; // Added

interface AiToneAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: AiGeneratedTemplate) => void;
  currentSubject: string;
  currentBody: string;
  brandVoice?: string;
}

const AiToneAdjustModal: React.FC<AiToneAdjustModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  currentSubject,
  currentBody,
  brandVoice,
}) => {
  const [selectedTone, setSelectedTone] = useState<AiToneStyle | ''>('');
  const { isLoading, error, generateText, clearError } = useGemini();
  const { addToast } = useToasts(); // Added

  const toneOptions = Object.entries(AiToneStyle).map(([key, value]) => ({
    value: value as string,
    label: value,
  }));

  const handleSubmit = async () => {
    if (!selectedTone) {
      addToast("Please select a tone/style.", 'warning');
      return;
    }
    clearError();

    const prompt = `Rewrite the following message to be more "${selectedTone}":
Current Subject: ${currentSubject}
Current Body:
${currentBody}

Maintain the core message and any placeholders like {{customerName}} or {{orderNumber}}.`;

    const result = await generateText(prompt, AI_SYSTEM_INSTRUCTION_TONE_ADJUSTER, brandVoice, true);

    if (result) {
      try {
        const parsedResult: AiGeneratedTemplate = JSON.parse(result);
         if (parsedResult.subject && parsedResult.body) {
            onApplyTemplate(parsedResult);
        } else {
            console.error("AI response missing subject or body:", parsedResult);
            addToast("AI tone adjustment failed: Missing subject or body. Please try again.", 'error');
        }
      } catch (e) {
        console.error("Failed to parse AI response as JSON:", result, e);
        addToast("AI tone adjustment failed: Could not parse response. Please try again.", 'error');
      }
    } else if (!error) {
        addToast("AI tone adjustment failed. Please try again.", 'error');
    }
    // If 'error' from useGemini is set, it will be displayed by the Alert component.
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Adjust Tone/Style"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading} disabled={!selectedTone}>
            Adjust & Apply
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert type="danger" title="AI Error">{error}</Alert>}
        <Select
          label="Select Tone/Style"
          options={toneOptions}
          value={selectedTone}
          onChange={(e) => setSelectedTone(e.target.value as AiToneStyle | '')}
          placeholder="-- Choose a tone/style --"
          disabled={isLoading}
        />
        <Alert type="info">
          The AI will rewrite the current subject and body according to your selection,
          while trying to preserve the original meaning and placeholders.
          Your configured brand voice (if any) will also guide the AI.
        </Alert>
      </div>
    </Modal>
  );
};

export default AiToneAdjustModal;
