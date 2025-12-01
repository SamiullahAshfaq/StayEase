export function passwordValidator(password: string): boolean {
  // Example: at least 8 chars, 1 number, 1 uppercase
  return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}
