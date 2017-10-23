import { randomBytes } from 'crypto';

export function bytes() {
  return randomBytes(16);
}
