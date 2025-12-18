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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2>{tool.name}</h2>
      {tool.description && <p>{tool.description}</p>}

      {fields.map((field) => (
        <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label htmlFor={field.name}>
            {field.label}
            {field.required && <span style={{ color: 'red' }}> *</span>}
          </label>

          {field.description && (
            <small style={{ color: '#666' }}>{field.description}</small>
          )}

          {field.type === 'select' && field.options ? (
            <select
              id={field.name}
              {...register(field.name, {
                setValueAs: (v) => {
                  // Handle number types in select
                  const option = field.options?.find(opt => String(opt.value) === v);
                  return option ? option.value : v;
                }
              })}
              disabled={isLoading}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
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
              {...register(field.name)}
              disabled={isLoading}
              style={{ width: 'fit-content' }}
            />
          ) : field.type === 'textarea' ? (
            <textarea
              id={field.name}
              {...register(field.name)}
              disabled={isLoading}
              rows={4}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <input
              id={field.name}
              type={field.type}
              {...register(field.name, {
                setValueAs: field.type === 'number' ? (v) => (v === '' ? undefined : Number(v)) : undefined,
              })}
              disabled={isLoading}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          )}

          {errors[field.name] && (
            <span style={{ color: 'red', fontSize: '0.875rem' }}>
              {errors[field.name]?.message as string}
            </span>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
