import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToolDefinition } from '../types';
import { toolToZodSchema, toolToFormFields } from '../utils/schema';

export interface ToolFormProps {
  tool: ToolDefinition;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ToolForm({ tool, onSubmit, onCancel, isLoading = false }: ToolFormProps) {
  const schema = toolToZodSchema(tool);
  const fields = toolToFormFields(tool);

  const form = useForm<Record<string, any>>({
    resolver: zodResolver(schema),
  });

  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="llm-form">
      <h2 className="llm-form-title">{tool.name}</h2>
      {tool.description && <p className="llm-form-description">{tool.description}</p>}

      {fields.map((field) => (
        <div key={field.name} className="llm-form-field">
          <label htmlFor={field.name} className="llm-form-label">
            {field.label}
            {field.required && <span className="llm-form-required"> *</span>}
          </label>

          {field.description && (
            <small className="llm-form-help">{field.description}</small>
          )}

          {field.type === 'select' && field.options ? (
            <select
              id={field.name}
              className="llm-form-select"
              {...register(field.name, {
                setValueAs: (v) => {
                  // Handle number types in select
                  const option = field.options?.find(opt => String(opt.value) === v);
                  return option ? option.value : v;
                }
              })}
              disabled={isLoading}
            >
              <option value="">Select...</option>
              {field.options.map((option) => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : field.type === 'checkbox' ? (
            <input
              id={field.name}
              type="checkbox"
              className="llm-form-checkbox"
              {...register(field.name)}
              disabled={isLoading}
            />
          ) : field.type === 'textarea' ? (
            <textarea
              id={field.name}
              className="llm-form-textarea"
              {...register(field.name)}
              disabled={isLoading}
              rows={4}
            />
          ) : (
            <input
              id={field.name}
              type={field.type}
              className="llm-form-input"
              {...register(field.name, {
                setValueAs: field.type === 'number' ? (v) => (v === '' ? undefined : Number(v)) : undefined,
              })}
              disabled={isLoading}
            />
          )}

          {errors[field.name] && (
            <span className="llm-form-error">
              {errors[field.name]?.message as string}
            </span>
          )}
        </div>
      ))}

      <div className="llm-form-actions">
        <button
          type="submit"
          className="llm-form-submit"
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>

        {onCancel && (
          <button
            type="button"
            className="llm-form-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
