import { Component, Input, OnDestroy, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-location-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <div #mapElement id="map-{{mapId}}" class="w-full h-full rounded-xl"></div>
    </div>
  `,
  styles: [`
    .map-container {
      width: 100%;
      height: 100%;
      position: relative;
    }
  `]
})
export class LocationMapComponent implements AfterViewInit, OnDestroy {
  @Input() latitude!: number;
  @Input() longitude!: number;
  @Input() city!: string;
  @Input() country!: string;
  @Input() height = '384px'; // Default 96 (h-96)
  @Input() showMarker = true;
  @Input() zoom = 13;

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  mapId = '';
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.mapId = `map-${Math.random().toString(36).substr(2, 9)}`;
  }

  async ngAfterViewInit(): Promise<void> {
    // Only initialize map in browser environment
    if (isPlatformBrowser(this.platformId)) {
      await this.initializeMap();
    }
  }

  private async initializeMap(): Promise<void> {
    try {
      // Dynamically import Leaflet only in browser
      const L = (await import('leaflet')).default;

      // Fix Leaflet default icon issue with webpack
      const iconRetinaUrl = 'assets/marker-icon-2x.png';
      const iconUrl = 'assets/marker-icon.png';
      const shadowUrl = 'assets/marker-shadow.png';
      
      const DefaultIcon = L.icon({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      // Initialize map
      this.map = L.map(`map-${this.mapId}`, {
        center: [this.latitude, this.longitude],
        zoom: this.zoom,
        scrollWheelZoom: false,
        dragging: true,
        zoomControl: true
      });

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Add marker if enabled
      if (this.showMarker) {
        this.marker = L.marker([this.latitude, this.longitude])
          .addTo(this.map)
          .bindPopup(`<b>${this.city}, ${this.country}</b>`)
          .openPopup();
      }

      // Add circle to show approximate area (not exact location)
      L.circle([this.latitude, this.longitude], {
        color: '#005461',
        fillColor: '#018790',
        fillOpacity: 0.2,
        radius: 500 // 500 meter radius
      }).addTo(this.map);

      // Fix map display issues
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 100);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
  }
}
