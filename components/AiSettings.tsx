import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import useLocalStorage from '../hooks/useLocalStorage';
import { BrandVoiceConfig } from '../types';
import { DEFAULT_BRAND_VOICE_CONFIG } from '../constants';
import Button from './ui/Button';
import Textarea from './ui/Textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import useToasts from '../hooks/useToasts';

const AiSettings: React.FC = () => {
  const [brandVoiceConfig, setBrandVoiceConfig] = useLocalStorage<BrandVoiceConfig>(
    'brandVoiceConfig',
    DEFAULT_BRAND_VOICE_CONFIG
  );
  const { addToast } = useToasts();

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<BrandVoiceConfig>({
    defaultValues: brandVoiceConfig,
  });

  useEffect(() => {
    reset(brandVoiceConfig);
  }, [brandVoiceConfig, reset]);

  const onSubmit: SubmitHandler<BrandVoiceConfig> = (data) => {
    setBrandVoiceConfig(data);
    reset(data); // To clear dirty state
    addToast('Brand voice settings saved!', 'success');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Brand Voice Configuration</CardTitle>
        <CardDescription>
          Define your brand's voice and personality. This will guide the AI in generating content
          that aligns with your brand identity (e.g., for message templates).
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <Textarea
            label="Describe Your Brand Voice"
            id="brandVoiceDescription"
            rows={8}
            placeholder="e.g., We are playful and energetic, using emojis and casual language. OR We are a luxury brand, formal, sophisticated, and prioritize trust."
            {...register('description', {
              required: 'Brand voice description cannot be empty.',
              minLength: { value: 20, message: 'Please provide a more detailed description (at least 20 characters).' }
            })}
            error={errors.description?.message}
            containerClassName="mb-4"
          />
          <p className="text-xs text-gray-500">
            Provide details about your brand's tone, style, values, target audience, and any specific keywords or phrases to use or avoid.
            The more detailed you are, the better the AI can match your brand.
          </p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={!isDirty}>
            Save Brand Voice
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AiSettings;
