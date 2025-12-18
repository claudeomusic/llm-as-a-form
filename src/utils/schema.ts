import { z } from 'zod';
import { ToolParameter, ToolDefinition, FormField } from '../types';

/**
 * Converts a tool parameter to a Zod schema for validation
 */
export function parameterToZodSchema(param: ToolParameter): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (param.type) {
    case 'string':
      schema = z.string();
      if (param.enum) {
        schema = z.enum(param.enum as [string, ...string[]]);
      }
      break;

    case 'number':
      if (param.enum) {
        // For number enums, use union of literals
        const numberValues = param.enum as number[];
        schema = z.union([
          z.literal(numberValues[0]),
          ...numberValues.slice(1).map(v => z.literal(v))
        ] as [z.ZodLiteral<number>, z.ZodLiteral<number>, ...z.ZodLiteral<number>[]]);
      } else {
        schema = z.number();
      }
      break;

    case 'boolean':
      schema = z.boolean();
      break;

    case 'array':
      if (param.items) {
        schema = z.array(parameterToZodSchema(param.items));
      } else {
        schema = z.array(z.unknown());
      }
      break;

    case 'object':
      if (param.properties) {
        const shape: Record<string, z.ZodTypeAny> = {};
        for (const [key, value] of Object.entries(param.properties)) {
          shape[key] = parameterToZodSchema(value);
        }
        schema = z.object(shape);
      } else {
        schema = z.record(z.unknown());
      }
      break;

    default:
      schema = z.unknown();
  }

  // Handle optional fields
  if (!param.required) {
    schema = schema.optional();
  }

  // Handle default values
  if (param.default !== undefined) {
    schema = schema.default(param.default);
  }

  return schema;
}

/**
 * Converts a tool definition to a complete Zod schema
 */
export function toolToZodSchema(tool: ToolDefinition): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [name, param] of Object.entries(tool.parameters)) {
    shape[name] = parameterToZodSchema(param);
  }

  return z.object(shape);
}

/**
 * Converts a tool parameter to a form field configuration
 */
export function parameterToFormField(name: string, param: ToolParameter): FormField {
  let type: FormField['type'] = 'text';

  if (param.enum) {
    type = 'select';
  } else if (param.type === 'number') {
    type = 'number';
  } else if (param.type === 'boolean') {
    type = 'checkbox';
  } else if (param.type === 'string' && param.description && param.description.length > 100) {
    type = 'textarea';
  }

  const field: FormField = {
    name,
    label: name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1'),
    type,
    description: param.description,
    required: param.required,
    defaultValue: param.default,
  };

  if (param.enum) {
    field.options = param.enum.map((value) => ({
      label: String(value),
      value,
    }));
  }

  return field;
}

/**
 * Converts a tool definition to form fields
 */
export function toolToFormFields(tool: ToolDefinition): FormField[] {
  return Object.entries(tool.parameters).map(([name, param]) =>
    parameterToFormField(name, param)
  );
}
