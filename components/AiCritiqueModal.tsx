
import React, { useState, useEffect } from 'react';
import { AiCritique } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Alert from './ui/Alert';
import useGemini from '../hooks/useGemini';
import { AI_SYSTEM_INSTRUCTION_CRITIQUE_MESSAGE } from '../constants';

interface AiCritiqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCritiqueGenerated: (critique: AiCritique) => void;
  currentSubject: string;
  currentBody: string;
  brandVoice?: string;
}

const AiCritiqueModal: React.FC<AiCritiqueModalProps> = ({
  isOpen,
  onClose,
  onCritiqueGenerated,
  currentSubject,
  currentBody,
  brandVoice,
}) => {
  const { isLoading, error, generateText, clearError } = useGemini();
  const [critiqueResult, setCritiqueResult] = useState<AiCritique | null>(null);

  const fetchCritique = async () => {
    clearError();
    setCritiqueResult(null);

    const prompt = `Analyze this customer message for e-commerce. 
Provide a qualitative score (e.g., "Good", "Fair", "Needs Improvement") and 1-2 brief, actionable suggestions for improvement regarding clarity, call to action, or tone.
Message Subject: ${currentSubject}
Message Body: 
${currentBody}`;

    const result = await generateText(prompt, AI_SYSTEM_INSTRUCTION_CRITIQUE_MESSAGE, brandVoice, true);

    if (result) {
      try {
        const parsedResult: AiCritique = JSON.parse(result);
        if (parsedResult.score && parsedResult.suggestions) {
          setCritiqueResult(parsedResult);
        } else {
          const errorMessage = "AI critique response is missing expected fields (score or suggestions).";
          console.error(errorMessage, parsedResult);
          setCritiqueResult({ score: "Error", suggestions: [errorMessage, "Please check the AI's output format or try again."] });
        }
      } catch (e: any) {
        console.error("Failed to parse AI critique response as JSON:", result, e);
        setCritiqueResult({ score: "Error", suggestions: ["Failed to parse AI response. The response was not valid JSON.", e.message || ""] });
      }
    } else if (!error) { // This `error` is from `useGemini` hook's state
       setCritiqueResult({ score: "Error", suggestions: ["AI critique generation failed. Please try again."] });
    }
    // If useGemini hook's `error` state is set, it will be displayed by the {error && <Alert>} in the render.
  };
  
  // Fetch critique when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCritique();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // We only want to fetch when isOpen becomes true

  const handleApplyAndClose = () => {
    // Check if critiqueResult is valid and not an error state we set manually, and no hook error
    if (critiqueResult && critiqueResult.score !== "Error" && !error) { 
      onCritiqueGenerated(critiqueResult);
    }
    onClose(); 
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose} 
      title="AI Message Critique"
      size="md"
      footer={
        <>
          <Button 
            variant="primary" 
            onClick={handleApplyAndClose} 
            disabled={isLoading || (!critiqueResult && !error && !isLoading)} // Disable if loading, or no result and no hook error and not loading
          >
            {critiqueResult && critiqueResult.score !== "Error" && !error ? "Done" : "Close"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="ml-2">Generating AI critique...</p>
          </div>
        )}
        {error && <Alert type="danger" title="AI Error">{error}</Alert>}
        {!isLoading && critiqueResult && (
          <div>
            <h4 className="font-semibold text-lg mb-2">
              Overall Score: 
              <span className={`ml-2 font-bold ${
                critiqueResult.score.toLowerCase() === 'error' ? 'text-danger' : // Handle explicit error score
                critiqueResult.score.toLowerCase().includes('good') ? 'text-success' : 
                critiqueResult.score.toLowerCase().includes('fair') ? 'text-yellow-600' : 'text-danger' // Default to danger if not good/fair/error
              }`}>
                {critiqueResult.score}
              </span>
            </h4>
            <h5 className="font-semibold mt-3 mb-1">Suggestions:</h5>
            {critiqueResult.suggestions.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                {critiqueResult.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No specific suggestions provided.</p>
            )}
          </div>
        )}
         {!isLoading && !critiqueResult && !error && ( // Shown if not loading, no result yet, and no hook error
            <Alert type="info">Critique will appear here.</Alert>
         )}
      </div>
    </Modal>
  );
};

export default AiCritiqueModal;
