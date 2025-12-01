import { Directive, Input, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appLazyLoadImage]',
  standalone: true
})
export class LazyLoadImageDirective implements OnInit {
  @Input() appLazyLoadImage!: string;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnInit() {
    const img = this.el.nativeElement;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = this.appLazyLoadImage;
          observer.disconnect();
        }
      });
    });
    observer.observe(img);
  }
}
