import { Request, Response, NextFunction } from 'express';
import { validate, ValidationRule } from '@utils/validator';
import { ValidationError } from '@utils/errors';

export const validateBody = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validate(req.body, rules);

    if (!result.valid) {
      next(new ValidationError(JSON.stringify(result.errors)));
      return;
    }

    next();
  };
};
