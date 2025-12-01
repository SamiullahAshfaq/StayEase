import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-listing-create',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './listing-create.component.html',
  styleUrls: ['./listing-create.component.scss']
})
export class ListingCreateComponent {
  goBack() {
    window.history.back();
  }
}