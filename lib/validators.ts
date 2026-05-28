export const RESERVED_USERNAMES = new Set(['admin', 'root', 'support', 'system']);

export const usernamePattern = /^[a-z][a-z0-9_]{2,19}$/;
export const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?!.*\s).{8,}$/;
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateUsername(username: string) {
  if (!username) return { valid: false, message: 'Username is required.' };
  if (username.length < 3 || username.length > 20)
    return { valid: false, message: 'Username must be 3–20 characters.' };
  if (RESERVED_USERNAMES.has(username))
    return { valid: false, message: 'This username is reserved.' };
  if (!usernamePattern.test(username))
    return { valid: false, message: 'Use lowercase letters, numbers, and underscore only. Start with a letter.' };
  return { valid: true, message: 'Username looks good.' };
}

export function validatePassword(password: string) {
  if (!password) return { valid: false, message: 'Password is required.' };
  if (password.length < 8) return { valid: false, message: 'Minimum 8 characters.' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Add at least one uppercase letter.' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Add at least one lowercase letter.' };
  if (!/\d/.test(password)) return { valid: false, message: 'Add at least one number.' };
  if (!/[^A-Za-z0-9]/.test(password)) return { valid: false, message: 'Add at least one special character.' };
  if (/\s/.test(password)) return { valid: false, message: 'Password cannot contain spaces.' };
  if (!passwordPattern.test(password)) return { valid: false, message: 'Use a stronger password like MyPass@123.' };
  return { valid: true, message: 'Strong password.' };
}

export function validateEmail(email: string) {
  if (!email) return { valid: false, message: 'Email is required.' };
  if (!emailPattern.test(email)) return { valid: false, message: 'Enter a valid email address.' };
  return { valid: true, message: 'Valid email.' };
}

export function validateName(name: string) {
  if (!name) return { valid: false, message: 'Full name is required.' };
  if (name.trim().length < 2) return { valid: false, message: 'Enter your full name.' };
  return { valid: true, message: 'Nice name.' };
}
