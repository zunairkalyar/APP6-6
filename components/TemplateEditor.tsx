import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { MessageTemplate, OrderStatus } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Checkbox from './ui/Checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import Alert from './ui/Alert';
import { DEFAULT_MESSAGE_TEMPLATES, PLACEHOLDER_OPTIONS } from '../constants';
import useToasts from '../hooks/useToasts';




interface TemplateEditorProps {
  template: MessageTemplate;
  orderStatusLabel: string;
  onSave: (status: OrderStatus, data: MessageTemplate) => void;
  onReset: (status: OrderStatus) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, orderStatusLabel, onSave, onReset }) => {
  const { control, register, handleSubmit, reset, formState: { errors, isDirty }, watch, getValues, setValue } = useForm<MessageTemplate>({
    defaultValues: template,
  });
  
  const { addToast } = useToasts();
  const [showPlaceholders, setShowPlaceholders] = useState(false);
  const isEnabledWatched = watch('isEnabled', template.isEnabled);

  useEffect(() => {
    reset(template);
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
                    {PLACEHOLDER_OPTIONS.map(p => <li key={p.placeholder}><strong>{p.placeholder}</strong>: {p.description}</li>)}
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

    </>
  );
};

export default TemplateEditor;
