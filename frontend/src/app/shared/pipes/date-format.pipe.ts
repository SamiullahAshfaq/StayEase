import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date, format: string = 'mediumDate'): string {
    const date = new Date(value);
    return date.toLocaleDateString();
  }
}
