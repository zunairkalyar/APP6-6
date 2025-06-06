import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { MessageTemplate, OrderStatus, AiGeneratedTemplate, AiCritique } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Checkbox from './ui/Checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import Alert from './ui/Alert';
import { DEFAULT_MESSAGE_TEMPLATES, AI_PLACEHOLDER_OPTIONS } from '../constants';
import AiSmartTemplateModal from './AiSmartTemplateModal';
import AiToneAdjustModal from './AiToneAdjustModal';
import AiCritiqueModal from './AiCritiqueModal';
import useToasts from '../hooks/useToasts';


// AI Icons
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.188l-1.25-2.188a2.25 2.25 0 00-1.7-1.7L12 9.75l2.188-1.25a2.25 2.25 0 001.7-1.7L17 4.75l1.25 2.188a2.25 2.25 0 001.7 1.7L22.25 9.75l-2.188 1.25a2.25 2.25 0 00-1.7 1.7z" /></svg>;
const WandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-2.096.096c-.53.243-.906.756-1.036 1.332A3.001 3.001 0 005.03 21.031c.31.31.642.569.988.784l3.573-3.573M18.031 5.031L5.031 18.031m0 0a3.001 3.001 0 102.096-2.096M12.067 11.933L18.031 5.03m-2.096.096a3 3 0 00-2.096-.096c-.53-.243-.906-.756-1.036-1.332A3.001 3.001 0 008.97 3.031c-.31-.31-.642-.569-.988-.784L4.41 5.818" /></svg>;
const ClipboardCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25c.88-.046 1.708-.126 2.55-.228M10.125 2.25a3.751 3.751 0 00-3.364 2.67M18.375 10.5H12.625M18.375 10.5c.063.07.12.144.172.222M18.375 10.5c.602-.429 1.135-.901 1.578-1.401M12.625 10.5c-.063.07-.12.144-.172.222M12.625 10.5c-.602-.429-1.135-.901-1.578-1.401m5.75 6.375c.277.309.516.634.717.981M18.375 16.875c.602.429 1.135.901 1.578 1.401M12.625 16.875c-.277.309-.516.634-.717.981M12.625 16.875c-.602.429-1.135.901-1.578 1.401m5.75-6.375a3.738 3.738 0 00-2.072-.888M12.625 10.5a3.738 3.738 0 01-2.072-.888" /></svg>;


interface TemplateEditorProps {
  template: MessageTemplate;
  orderStatusLabel: string;
  onSave: (status: OrderStatus, data: MessageTemplate) => void;
  onReset: (status: OrderStatus) => void;
  brandVoice?: string; // Added for passing to AI modals
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, orderStatusLabel, onSave, onReset, brandVoice }) => {
  const { control, register, handleSubmit, reset, formState: { errors, isDirty }, watch, getValues, setValue } = useForm<MessageTemplate>({
    defaultValues: template,
  });
  
  const { addToast } = useToasts();
  const [showPlaceholders, setShowPlaceholders] = useState(false);
  const isEnabledWatched = watch('isEnabled', template.isEnabled);

  const [isSmartTemplateModalOpen, setIsSmartTemplateModalOpen] = useState(false);
  const [isToneAdjustModalOpen, setIsToneAdjustModalOpen] = useState(false);
  const [isCritiqueModalOpen, setIsCritiqueModalOpen] = useState(false);
  const [currentAiCritique, setCurrentAiCritique] = useState<AiCritique | null>(null);

  useEffect(() => {
    reset(template);
    setCurrentAiCritique(null); // Clear critique when template changes
  }, [template, reset]);

  const onSubmitHandler: SubmitHandler<MessageTemplate> = (data) => {
    onSave(template.status, { ...template, ...data, isEnabled: isEnabledWatched });
    reset({ ...template, ...data, isEnabled: isEnabledWatched }); 
    addToast('Template saved successfully!', 'success');
  };
  
  const handleResetClick = () => {
    const appDefaultTemplate = DEFAULT_MESSAGE_TEMPLATES[template.status];
    if (appDefaultTemplate) {
      reset(appDefaultTemplate); 
    }
    onReset(template.status); 
    addToast('Template reset to default.', 'info');
  };

  const checkIsAlreadyAppDefault = () => {
    const currentValues = getValues();
    const appDefaultTemplate = DEFAULT_MESSAGE_TEMPLATES[template.status];
    if (!appDefaultTemplate) return false;
    return (
        currentValues.subject === appDefaultTemplate.subject &&
        currentValues.body === appDefaultTemplate.body &&
        currentValues.isEnabled === appDefaultTemplate.isEnabled
    );
  };

  const handleApplyAiTemplate = (generated: AiGeneratedTemplate) => {
    setValue('subject', generated.subject, { shouldDirty: true });
    setValue('body', generated.body, { shouldDirty: true });
    setIsSmartTemplateModalOpen(false);
    setIsToneAdjustModalOpen(false);
    addToast('AI suggestions applied!', 'success');
  };
  
  const handleShowCritique = (critique: AiCritique) => {
    setCurrentAiCritique(critique);
    setIsCritiqueModalOpen(false); // Close the generation modal
    addToast('AI critique generated!', 'info');
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
              <div>
                  <CardTitle>Template for: {orderStatusLabel}</CardTitle>
                  <CardDescription>Customize the subject and body for messages sent when an order is {orderStatusLabel.toLowerCase()}.</CardDescription>
              </div>
              <Controller
                  name="isEnabled"
                  control={control}
                  render={({ field }) => (
                      <Checkbox
                      label="Enable this template"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      />
                  )}
              />
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end space-y-2 sm:space-y-0 sm:space-x-2 mb-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsSmartTemplateModalOpen(true)} leftIcon={<SparklesIcon />} disabled={!isEnabledWatched}>AI Generate</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsToneAdjustModalOpen(true)} leftIcon={<WandIcon />} disabled={!isEnabledWatched || !watch('subject')}>AI Adjust Tone/Style</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCritiqueModalOpen(true)} leftIcon={<ClipboardCheckIcon />} disabled={!isEnabledWatched || !watch('subject')}>AI Critique</Button>
            </div>
            {currentAiCritique && (
                <Alert type={currentAiCritique.score.toLowerCase().includes('improvement') ? 'warning' : 'info'} title={`AI Critique: ${currentAiCritique.score}`} className="mb-3">
                    <ul className="list-disc pl-5">
                        {currentAiCritique.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </Alert>
            )}
            <Input
              label="Message Subject"
              id={`subject-${template.status}`}
              {...register('subject', { required: 'Subject is required' })}
              error={errors.subject?.message}
              disabled={!isEnabledWatched} 
            />
            <Textarea
              label="Message Body"
              id={`body-${template.status}`}
              {...register('body', { required: 'Body is required' })}
              error={errors.body?.message}
              rows={6}
              disabled={!isEnabledWatched}
            />
            <div className="mt-2">
              <Button type="button" variant="link" size="sm" onClick={() => setShowPlaceholders(!showPlaceholders)}>
                {showPlaceholders ? 'Hide' : 'Show'} Available Placeholders
              </Button>
              {showPlaceholders && (
                <Alert type="info" title="Available Placeholders" className="mt-2">
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {AI_PLACEHOLDER_OPTIONS.map(p => <li key={p.placeholder}><strong>{p.placeholder}</strong>: {p.description}</li>)}
                  </ul>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleResetClick}
              disabled={checkIsAlreadyAppDefault()}
            >
              Reset to Default
            </Button>
            <Button type="submit" disabled={!isDirty}>
              Save Template
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isSmartTemplateModalOpen && (
        <AiSmartTemplateModal
          isOpen={isSmartTemplateModalOpen}
          onClose={() => setIsSmartTemplateModalOpen(false)}
          onApplyTemplate={handleApplyAiTemplate}
          brandVoice={brandVoice}
          orderStatusLabel={orderStatusLabel}
        />
      )}
      {isToneAdjustModalOpen && (
        <AiToneAdjustModal
          isOpen={isToneAdjustModalOpen}
          onClose={() => setIsToneAdjustModalOpen(false)}
          onApplyTemplate={handleApplyAiTemplate}
          currentSubject={watch('subject')}
          currentBody={watch('body')}
          brandVoice={brandVoice}
        />
      )}
      {isCritiqueModalOpen && (
        <AiCritiqueModal
            isOpen={isCritiqueModalOpen}
            onClose={() => setIsCritiqueModalOpen(false)}
            onCritiqueGenerated={handleShowCritique}
            currentSubject={watch('subject')}
            currentBody={watch('body')}
            brandVoice={brandVoice}
        />
      )}
    </>
  );
};

export default TemplateEditor;
