import { v4 as uuidv4 } from 'uuid';

export const generateId = (): string => uuidv4();

export const generateCode = (prefix: string, length: number = 8): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
