import { Component, signal } from '@angular/core';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MainLayoutComponent],
  templateUrl: './app.html',
  // styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
}
