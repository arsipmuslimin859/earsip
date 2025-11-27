import { TextInput, Textarea, Select, NumberInput, Stack } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import type { MetadataField } from '../../types';

interface MetadataFormDynamicProps {
  schema: MetadataField[];
  values: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export function MetadataFormDynamic({ schema, values, onChange }: MetadataFormDynamicProps) {
  const renderField = (field: MetadataField) => {
    const baseProps = {
      key: field.field,
      label: field.label,
      required: field.required,
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...baseProps}
            value={values[field.field] || ''}
            onChange={(e) => onChange(field.field, e.currentTarget.value)}
            minRows={3}
          />
        );

      case 'date':
        return (
          <DateInput
            {...baseProps}
            value={values[field.field] ? new Date(values[field.field]) : null}
            onChange={(value) => {
              if (value) {
                onChange(field.field, value.toISOString());
              } else {
                onChange(field.field, '');
              }
            }}
          />
        );

      case 'number':
        return (
          <NumberInput
            {...baseProps}
            value={values[field.field] ? Number(values[field.field]) : undefined}
            onChange={(value) => onChange(field.field, value !== null && value !== undefined ? String(value) : '')}
          />
        );

      case 'select':
        return (
          <Select
            {...baseProps}
            value={values[field.field] || ''}
            data={field.options || []}
            onChange={(value) => onChange(field.field, value || '')}
            clearable
          />
        );

      default:
        return (
          <TextInput
            {...baseProps}
            value={values[field.field] || ''}
            onChange={(e) => onChange(field.field, e.currentTarget.value)}
          />
        );
    }
  };

  return (
    <Stack gap="md">
      {schema.map((field) => renderField(field))}
    </Stack>
  );
}
