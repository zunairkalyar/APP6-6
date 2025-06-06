import React, { useState, useRef, useEffect, FormEvent } from 'react';
import useGemini from '../hooks/useGemini';
import { AiChatMessage, BrandVoiceConfig } from '../types';
import { AI_SYSTEM_INSTRUCTION_HELP_ASSISTANT, DEFAULT_BRAND_VOICE_CONFIG } from '../constants';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import Alert from './ui/Alert';
import { cn } from '../lib/utils';
import useLocalStorage from '../hooks/useLocalStorage';


const AiHelpChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<AiChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const { isLoading, error, generateChatResponse, clearError } = useGemini();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [brandVoiceConfig] = useLocalStorage<BrandVoiceConfig>('brandVoiceConfig', DEFAULT_BRAND_VOICE_CONFIG);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatMessages]);

  useEffect(() => {
    // Add initial greeting from AI if chat is empty and modal opens
    if (isOpen && chatMessages.length === 0) {
      setChatMessages([
        { role: 'model', text: "Hello! I'm Store Connect AI. How can I help you today?", timestamp: Date.now() }
      ]);
    }
    if (!isOpen) { // Clear error when modal closes
        clearError();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    clearError();
    const newUserMessage: AiChatMessage = { role: 'user', text: userInput, timestamp: Date.now() };
    setChatMessages(prev => [...prev, newUserMessage]);
    setUserInput('');

    const responseText = await generateChatResponse(
      chatMessages, // Pass current history
      userInput, 
      AI_SYSTEM_INSTRUCTION_HELP_ASSISTANT,
      brandVoiceConfig.description // Use brand voice for the AI's personality if desired
    );

    if (responseText) {
      const newAiMessage: AiChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      setChatMessages(prev => [...prev, newAiMessage]);
    } else if (!error) {
      // Handle case where responseText is null but no specific error was set from useGemini
      const errorAiMessage: AiChatMessage = { role: 'model', text: "Sorry, I encountered an issue. Please try again.", timestamp: Date.now() };
      setChatMessages(prev => [...prev, errorAiMessage]);
    }
    // Error from useGemini hook will be displayed via the {error && <Alert>}
  };
  
  const ChatBubbleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m2.25 2.25H12M21 12a9 9 0 11-18 0 9 9 0 0118 0zM7.244 16.066l-.007-.006-.007-.007a.75.75 0 00-.994 1.144l1.513 1.261A9.034 9.034 0 0012 21.066a9.033 9.033 0 003.245-2.602l1.513-1.261a.75.75 0 10-.994-1.144l-.007.007-.007.006a7.502 7.502 0 01-5.502 0z" /></svg>;
  const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
  const AiIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015.25 2.25h-3.518c-.334 0-.667.054-.99.145l-.952.338c-.506.182-1.03.434-1.506.724L6.75 4.5M15.75 18.75h-3v-3h3v3z" /></svg>;


  return (
    <>
      <Button
        variant="primary"
        size="lg"
        className="fab rounded-full shadow-xl p-3"
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Help Chat"
        leftIcon={<ChatBubbleIcon/>}
      >
        AI Help
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Store Connect AI Assistant"
        size="lg" // Adjust size as needed
      >
        <div className="flex flex-col h-[60vh]">
          {error && <Alert type="danger" title="AI Error" className="mb-2">{error}</Alert>}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-md">
            {chatMessages.map((msg, index) => (
              <div key={index} className={cn("flex items-end space-x-2", msg.role === 'user' ? 'justify-end' : '')}>
                {msg.role === 'model' && <span className="flex-shrink-0 text-primary p-1.5 bg-primary/10 rounded-full"><AiIcon/></span>}
                <div
                  className={cn(
                    "max-w-[70%] p-3 rounded-xl whitespace-pre-wrap",
                    msg.role === 'user' ? 'bg-primary text-onPrimary' : 'bg-surface border border-gray-200 text-onSurface'
                  )}
                >
                  {msg.text}
                </div>
                 {msg.role === 'user' && <span className="flex-shrink-0 text-gray-600 p-1.5 bg-gray-200 rounded-full"><UserIcon/></span>}
              </div>
            ))}
            <div ref={messagesEndRef} />
            {isLoading && chatMessages[chatMessages.length -1]?.role === 'user' && ( // Show typing indicator only if user was last to speak
                <div className="flex items-end space-x-2">
                    <span className="flex-shrink-0 text-primary p-1.5 bg-primary/10 rounded-full"><AiIcon/></span>
                    <div className="max-w-[70%] p-3 rounded-xl bg-surface border border-gray-200 text-onSurface">
                        <span className="italic text-gray-500">AI is typing...</span>
                    </div>
                </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2 p-1 border-t border-gray-200 pt-4">
            <Input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-grow"
              disabled={isLoading}
              aria-label="Your message"
            />
            <Button type="submit" isLoading={isLoading} disabled={!userInput.trim()} aria-label="Send message">
              Send
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default AiHelpChat;
