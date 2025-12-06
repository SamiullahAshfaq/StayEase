import { Component } from '@angular/core';

import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-listing-create',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, ButtonModule],
=======
  imports: [ButtonModule],
>>>>>>> 3bd6c1d (removed scss)
  templateUrl: './listing-create.component.html'
})
export class ListingCreateComponent {
  goBack() {
    window.history.back();
  }
}