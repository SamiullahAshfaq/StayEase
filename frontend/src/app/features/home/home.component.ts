import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, NgFor],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  categories = [
    { name: 'Entire Homes', image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop', query: 'home' },
    { name: 'Unique Stays', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1974&auto=format=fit=crop', query: 'unique' },
    { name: 'Apartments', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format=fit=crop', query: 'apartment' },
    { name: 'Villas', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format=fit=crop', query: 'villa' }
  ];
}
