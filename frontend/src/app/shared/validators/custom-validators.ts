export class CustomValidators {
  static required(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }
}
