
import { useState, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { AiChatMessage } from '../types';
import { GEMINI_MODEL_TEXT } from '../constants';

interface UseGeminiReturn {
  isLoading: boolean;
  error: string | null;
  generateText: (prompt: string, systemInstruction?: string, brandVoice?: string, expectJson?: boolean) => Promise<string | null>;
  generateChatResponse: (history: AiChatMessage[], newMessage: string, systemInstruction?: string, brandVoice?: string) => Promise<string | null>;
  clearError: () => void;
}

const useGemini = (): UseGeminiReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const apiKey = typeof process !== 'undefined' && process.env && process.env.API_KEY ? process.env.API_KEY : null;
  
  const getAiInstance = useCallback(() => {
    if (!apiKey) {
      console.error("Gemini API key is missing. Please ensure process.env.API_KEY is set.");
      setError("Gemini API key is not configured. AI features will not work.");
      return null;
    }
    return new GoogleGenAI({ apiKey });
  }, [apiKey]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const generateText = useCallback(async (
    prompt: string, 
    systemInstruction?: string, 
    brandVoice?: string,
    expectJson: boolean = false
  ): Promise<string | null> => {
    const ai = getAiInstance();
    if (!ai) return null;

    setIsLoading(true);
    setError(null);
    
    let fullSystemInstruction = systemInstruction || "";
    if (brandVoice) {
      fullSystemInstruction = `${brandVoice}\n\n${fullSystemInstruction}`;
    }

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
        config: {
          ...(fullSystemInstruction && { systemInstruction: fullSystemInstruction.trim() }),
          ...(expectJson && { responseMimeType: "application/json" }),
        },
      });
      
      let responseText = response.text; // This is a string from the API

      if (expectJson && responseText) {
        let jsonStrToValidate = responseText.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStrToValidate.match(fenceRegex);
        if (match && match[2]) {
          jsonStrToValidate = match[2].trim(); // Use content within fences
        }
        
        try {
          JSON.parse(jsonStrToValidate); // Attempt to parse to validate structure
          responseText = jsonStrToValidate; // If successful, responseText is the clean JSON string
        } catch (parseError) {
          console.error("AI response was not valid JSON after stripping fences:", jsonStrToValidate, parseError);
          setError("AI response was not in the expected JSON format. Please try again.");
          setIsLoading(false);
          return null; // Return null if JSON was expected but couldn't be parsed
        }
      }
      
      setIsLoading(false);
      return responseText; // Return the (potentially cleaned) string, or original if not expecting JSON, or null on error
    } catch (e: any) {
      console.error("Error generating content from Gemini:", e);
      setError(e.message || "An unknown error occurred with the AI model.");
      setIsLoading(false);
      return null;
    }
  }, [getAiInstance]);


  const generateChatResponse = useCallback(async (
    history: AiChatMessage[], 
    newMessage: string,
    systemInstruction?: string,
    brandVoice?: string
  ): Promise<string | null> => {
    const ai = getAiInstance();
    if (!ai) return null;

    setIsLoading(true);
    setError(null);

    let fullSystemInstruction = systemInstruction || "";
    if (brandVoice) {
      fullSystemInstruction = `${brandVoice}\n\n${fullSystemInstruction}`;
    }

    try {
      const chat: Chat = ai.chats.create({
        model: GEMINI_MODEL_TEXT,
        ...(fullSystemInstruction && { config: {systemInstruction: fullSystemInstruction.trim()}}),
        history: history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
        })),
      });

      const result: GenerateContentResponse = await chat.sendMessage({message: newMessage});
      const responseText = result.text;
      
      setIsLoading(false);
      return responseText;
    } catch (e: any) {
      console.error("Error generating chat response from Gemini:", e);
      setError(e.message || "An unknown error occurred with the AI chat model.");
      setIsLoading(false);
      return null;
    }
  }, [getAiInstance]);


  return { isLoading, error, generateText, generateChatResponse, clearError };
};

export default useGemini;
