export interface ValidationRule {
  field: string;
  rules: {
    required?: boolean;
    min?: number;
    max?: number;
    email?: boolean;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

export const validate = (data: Record<string, any>, rules: ValidationRule[]): ValidationResult => {
  const errors: Record<string, string[]> = {};

  for (const { field, rules: fieldRules } of rules) {
    const value = data[field];
    const fieldErrors: string[] = [];

    if (fieldRules.required && (value === undefined || value === null || value === '')) {
      fieldErrors.push(`${field} الزامی است`);
      errors[field] = fieldErrors;
      continue;
    }

    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (fieldRules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        fieldErrors.push(`${field} باید یک ایمیل معتبر باشد`);
      }
    }

    if (fieldRules.min !== undefined && String(value).length < fieldRules.min) {
      fieldErrors.push(`${field} باید حداقل ${fieldRules.min} کاراکتر باشد`);
    }

    if (fieldRules.max !== undefined && String(value).length > fieldRules.max) {
      fieldErrors.push(`${field} باید حداکثر ${fieldRules.max} کاراکتر باشد`);
    }

    if (fieldRules.pattern && !fieldRules.pattern.test(String(value))) {
      fieldErrors.push(`${field} فرمت نامعتبر است`);
    }

    if (fieldRules.custom) {
      const result = fieldRules.custom(value);
      if (typeof result === 'string') {
        fieldErrors.push(result);
      } else if (!result) {
        fieldErrors.push(`${field} مقدار نامعتبر است`);
      }
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
};
