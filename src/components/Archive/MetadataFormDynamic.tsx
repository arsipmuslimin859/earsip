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
    const commonProps = {
      key: field.field,
      label: field.label,
      required: field.required,
      value: values[field.field] || '',
      onChange: (value: string | Date | number | null) => {
        if (value instanceof Date) {
          onChange(field.field, value.toISOString());
        } else {
          onChange(field.field, String(value || ''));
        }
      },
    };

    switch (field.type) {
      case 'textarea':
        return <Textarea {...commonProps} minRows={3} />;

      case 'date':
        return (
          <DateInput
            {...commonProps}
            value={values[field.field] ? new Date(values[field.field]) : null}
            onChange={(value) => {
              if (value) {
                onChange(field.field, value.toISOString());
              }
            }}
          />
        );

      case 'number':
        return (
          <NumberInput
            {...commonProps}
            value={values[field.field] ? Number(values[field.field]) : undefined}
            onChange={(value) => onChange(field.field, String(value || ''))}
          />
        );

      case 'select':
        return (
          <Select
            {...commonProps}
            data={field.options || []}
            onChange={(value) => onChange(field.field, value || '')}
          />
        );

      default:
        return <TextInput {...commonProps} />;
    }
  };

  return (
    <Stack gap="md">
      {schema.map((field) => renderField(field))}
    </Stack>
  );
}
