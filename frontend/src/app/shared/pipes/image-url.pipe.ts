import { Pipe, PipeTransform } from '@angular/core';
import { ImageUrlHelper } from '../utils/image-url.helper';

/**
 * Pipe to convert backend image paths to full URLs
 * Usage: {{ imagePath | imageUrl }}
 * Example: {{ '/images/listings/listing-1.jpg' | imageUrl }}
 * Output: http://localhost:8080/images/listings/listing-1.jpg
 */
@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return ImageUrlHelper.getFullImageUrl(value || '');
  }
}
