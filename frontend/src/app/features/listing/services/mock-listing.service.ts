import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Listing, ListingPage, ListingStatus, SearchListingParams } from '../models/listing.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class MockListingService {
  private mockListings: Listing[] = [
    {
      publicId: 'lst-001',
      landlordPublicId: 'usr-001',
      title: 'Luxury Beachfront Villa in Malibu',
      description: 'Experience the ultimate coastal living in this stunning beachfront villa. Wake up to breathtaking ocean views, enjoy private beach access, and relax in the infinity pool overlooking the Pacific. This modern architectural masterpiece features floor-to-ceiling windows, an open-concept design, and luxurious amenities throughout. Perfect for families or groups seeking an unforgettable beach getaway.',
      location: 'Malibu',
      city: 'Malibu',
      country: 'United States',
      latitude: 34.0259,
      longitude: -118.7798,
      address: '123 Pacific Coast Highway, Malibu, CA 90265',
      pricePerNight: 850,
      currency: 'USD',
      maxGuests: 8,
      bedrooms: 4,
      beds: 5,
      bathrooms: 4.5,
      propertyType: 'Villa',
      category: 'Beachfront',
      amenities: ['WiFi', 'Pool', 'Kitchen', 'Air conditioning', 'Beach access', 'Parking', 'Ocean view', 'Hot tub', 'BBQ grill', 'Gym'],
      houseRules: 'No smoking, No parties, Check-in after 3 PM, Check-out before 11 AM',
      cancellationPolicy: 'Free cancellation up to 7 days before check-in',
      minimumStay: 2,
      maximumStay: 30,
      instantBook: true,
      status: ListingStatus.ACTIVE,
      images: [
        { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop', caption: 'Ocean View Living Room', isCover: true, sortOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop', caption: 'Master Bedroom', isCover: false, sortOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop', caption: 'Infinity Pool', isCover: false, sortOrder: 3 },
        { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop', caption: 'Modern Kitchen', isCover: false, sortOrder: 4 },
        { url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1200&h=800&fit=crop', caption: 'Sunset Terrace', isCover: false, sortOrder: 5 }
      ],
      coverImageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop',
      averageRating: 4.9,
      totalReviews: 127,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-12-01T15:30:00Z'
    },
    {
      publicId: 'lst-002',
      landlordPublicId: 'usr-002',
      title: 'Cozy Mountain Cabin in Aspen',
      description: 'Escape to this charming mountain retreat nestled in the heart of Aspen. This rustic yet modern cabin offers the perfect blend of comfort and adventure. Featuring exposed wooden beams, a stone fireplace, and panoramic mountain views, this property is ideal for skiing enthusiasts and nature lovers. The cabin includes a fully equipped kitchen, spacious living areas, and a private hot tub on the deck.',
      location: 'Aspen',
      city: 'Aspen',
      country: 'United States',
      latitude: 39.1911,
      longitude: -106.8175,
      address: '456 Mountain Trail, Aspen, CO 81611',
      pricePerNight: 425,
      currency: 'USD',
      maxGuests: 6,
      bedrooms: 3,
      beds: 4,
      bathrooms: 2,
      propertyType: 'Cabin',
      category: 'Countryside',
      amenities: ['WiFi', 'Fireplace', 'Kitchen', 'Heating', 'Mountain view', 'Parking', 'Hot tub', 'Ski storage', 'Washer', 'Dryer'],
      houseRules: 'No smoking, Pets allowed with fee, Quiet hours 10 PM - 8 AM',
      cancellationPolicy: 'Moderate: Full refund 5 days prior to arrival',
      minimumStay: 3,
      maximumStay: 14,
      instantBook: false,
      status: ListingStatus.ACTIVE,
      images: [
        { url: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&h=800&fit=crop', caption: 'Mountain Cabin Exterior', isCover: true, sortOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop', caption: 'Cozy Living Room', isCover: false, sortOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop', caption: 'Bedroom with Mountain View', isCover: false, sortOrder: 3 },
        { url: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&h=800&fit=crop', caption: 'Rustic Kitchen', isCover: false, sortOrder: 4 }
      ],
      coverImageUrl: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&h=800&fit=crop',
      averageRating: 4.8,
      totalReviews: 89,
      createdAt: '2024-02-20T14:00:00Z',
      updatedAt: '2024-11-28T09:15:00Z'
    },
    {
      publicId: 'lst-003',
      landlordPublicId: 'usr-003',
      title: 'Modern Downtown Loft in NYC',
      description: 'Stay in the heart of Manhattan in this sleek, contemporary loft. Perfect for business travelers and urban explorers, this stylish space features exposed brick, high ceilings, and industrial-chic design. Located within walking distance of Times Square, Central Park, and world-class dining and shopping. The loft includes a fully equipped kitchen, dedicated workspace, and premium amenities.',
      location: 'Manhattan',
      city: 'New York',
      country: 'United States',
      latitude: 40.7580,
      longitude: -73.9855,
      address: '789 Broadway, New York, NY 10003',
      pricePerNight: 295,
      currency: 'USD',
      maxGuests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      propertyType: 'Loft',
      category: 'City',
      amenities: ['WiFi', 'Kitchen', 'Air conditioning', 'Elevator', 'City view', 'Workspace', 'Smart TV', 'Coffee maker', 'Keyless entry'],
      houseRules: 'No smoking, No pets, No parties',
      cancellationPolicy: 'Strict: 50% refund up to 1 week before check-in',
      minimumStay: 1,
      maximumStay: 30,
      instantBook: true,
      status: ListingStatus.ACTIVE,
      images: [
        { url: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200&h=800&fit=crop', caption: 'Modern Loft Interior', isCover: true, sortOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop', caption: 'Open Kitchen', isCover: false, sortOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=800&fit=crop', caption: 'Master Suite', isCover: false, sortOrder: 3 },
        { url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop', caption: 'City View', isCover: false, sortOrder: 4 }
      ],
      coverImageUrl: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200&h=800&fit=crop',
      averageRating: 4.7,
      totalReviews: 213,
      createdAt: '2024-03-10T11:00:00Z',
      updatedAt: '2024-12-05T16:45:00Z'
    },
    {
      publicId: 'lst-004',
      landlordPublicId: 'usr-004',
      title: 'Tropical Paradise Villa in Bali',
      description: 'Immerse yourself in luxury at this stunning tropical villa surrounded by lush rice paddies and jungle views. This Balinese-style property features traditional architecture with modern amenities, including a private pool, outdoor shower, and expansive terrace. Perfect for couples or small families seeking tranquility and authentic Balinese hospitality. Located near Ubud\'s cultural attractions and world-class restaurants.',
      location: 'Ubud',
      city: 'Ubud',
      country: 'Indonesia',
      latitude: -8.5069,
      longitude: 115.2625,
      address: 'Jl. Raya Ubud No. 88, Ubud, Bali 80571',
      pricePerNight: 185,
      currency: 'USD',
      maxGuests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      propertyType: 'Villa',
      category: 'Tropical',
      amenities: ['WiFi', 'Pool', 'Kitchen', 'Air conditioning', 'Garden view', 'Parking', 'Outdoor shower', 'Yoga space', 'Daily cleaning'],
      houseRules: 'No smoking indoors, Respectful of local culture',
      cancellationPolicy: 'Flexible: Full refund 1 day prior to arrival',
      minimumStay: 2,
      maximumStay: 30,
      instantBook: true,
      status: ListingStatus.ACTIVE,
      images: [
        { url: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200&h=800&fit=crop', caption: 'Tropical Villa Exterior', isCover: true, sortOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1200&h=800&fit=crop', caption: 'Private Pool', isCover: false, sortOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop', caption: 'Luxurious Bedroom', isCover: false, sortOrder: 3 },
        { url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop', caption: 'Open-air Bathroom', isCover: false, sortOrder: 4 },
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop', caption: 'Rice Paddy View', isCover: false, sortOrder: 5 }
      ],
      coverImageUrl: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200&h=800&fit=crop',
      averageRating: 4.9,
      totalReviews: 156,
      createdAt: '2024-04-05T08:00:00Z',
      updatedAt: '2024-12-03T12:20:00Z'
    },
    {
      publicId: 'lst-005',
      landlordPublicId: 'usr-005',
      title: 'Historic Parisian Apartment with Eiffel Tower View',
      description: 'Experience authentic Parisian living in this beautifully renovated 19th-century apartment. Located in the prestigious 7th arrondissement, this elegant space offers stunning views of the Eiffel Tower from the balcony. Featuring original parquet floors, high ceilings with ornate moldings, and a mix of classic French charm with modern comfort. Walking distance to museums, cafes, and the Seine River.',
      location: 'Paris 7th',
      city: 'Paris',
      country: 'France',
      latitude: 48.8566,
      longitude: 2.3522,
      address: '12 Avenue de la Bourdonnais, 75007 Paris',
      pricePerNight: 385,
      currency: 'EUR',
      maxGuests: 5,
      bedrooms: 2,
      beds: 3,
      bathrooms: 1,
      propertyType: 'Apartment',
      category: 'City',
      amenities: ['WiFi', 'Kitchen', 'Heating', 'Eiffel Tower view', 'Balcony', 'Washer', 'Elevator', 'Coffee maker', 'Wine glasses'],
      houseRules: 'No smoking, No parties, Quiet hours 10 PM - 8 AM',
      cancellationPolicy: 'Moderate: Full refund 5 days prior to arrival',
      minimumStay: 3,
      maximumStay: 30,
      instantBook: false,
      status: ListingStatus.ACTIVE,
      images: [
        { url: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200&h=800&fit=crop', caption: 'Parisian Living Room', isCover: true, sortOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop', caption: 'Eiffel Tower View', isCover: false, sortOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=1200&h=800&fit=crop', caption: 'Classic Bedroom', isCover: false, sortOrder: 3 },
        { url: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&h=800&fit=crop', caption: 'French Kitchen', isCover: false, sortOrder: 4 }
      ],
      coverImageUrl: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200&h=800&fit=crop',
      averageRating: 4.8,
      totalReviews: 94,
      createdAt: '2024-05-12T13:00:00Z',
      updatedAt: '2024-11-30T10:30:00Z'
    },
    {
      publicId: 'lst-006',
      landlordPublicId: 'usr-006',
      title: 'Seaside Cottage in Santorini',
      description: 'Discover the magic of Santorini in this traditional Cycladic cottage perched on the caldera cliff. Whitewashed walls, blue-domed architecture, and breathtaking sunset views over the Aegean Sea create an unforgettable Greek island experience. The cottage features a private terrace, outdoor dining area, and modern amenities while maintaining authentic island charm. Perfect for romantic getaways.',
      location: 'Oia',
      city: 'Santorini',
      country: 'Greece',
      latitude: 36.4618,
      longitude: 25.3753,
      address: 'Oia Main Street, Santorini 84702',
      pricePerNight: 320,
      currency: 'EUR',
      maxGuests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      propertyType: 'Cottage',
      category: 'Beachfront',
      amenities: ['WiFi', 'Kitchen', 'Air conditioning', 'Sea view', 'Terrace', 'Outdoor dining', 'Sunset view', 'Wine cellar'],
      houseRules: 'No smoking, No pets, Romantic retreat - adults only',
      cancellationPolicy: 'Flexible: Full refund 3 days prior to arrival',
      minimumStay: 2,
      maximumStay: 14,
      instantBook: true,
      status: ListingStatus.ACTIVE,
      images: [
        { url: 'https://images.unsplash.com/photo-1600011689032-8b628b8a8747?w=1200&h=800&fit=crop', caption: 'Santorini Sunset View', isCover: true, sortOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop', caption: 'Cozy Interior', isCover: false, sortOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop', caption: 'Private Terrace', isCover: false, sortOrder: 3 },
        { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop', caption: 'Cycladic Kitchen', isCover: false, sortOrder: 4 }
      ],
      coverImageUrl: 'https://images.unsplash.com/photo-1600011689032-8b628b8a8747?w=1200&h=800&fit=crop',
      averageRating: 5.0,
      totalReviews: 78,
      createdAt: '2024-06-18T09:00:00Z',
      updatedAt: '2024-12-02T14:10:00Z'
    },
    {
      publicId: 'lst-007',
      landlordPublicId: 'usr-007',
      title: 'Safari Lodge in Serengeti National Park',
      description: 'Experience the African wilderness in this luxury safari lodge overlooking the vast Serengeti plains. Watch wildlife from your private deck, enjoy sundowners by the fire pit, and fall asleep to the sounds of nature. This eco-friendly lodge combines rustic elegance with modern comfort, featuring en-suite bathrooms, gourmet meals, and guided safari tours. An adventure of a lifetime awaits.',
      location: 'Serengeti',
      city: 'Serengeti',
      country: 'Tanzania',
      latitude: -2.3333,
      longitude: 34.8333,
      address: 'Serengeti National Park, Tanzania',
      pricePerNight: 550,
      currency: 'USD',
      maxGuests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      propertyType: 'Lodge',
      category: 'Countryside',
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Wildlife view', 'Safari tours', 'Fire pit', 'Outdoor shower', 'Laundry service', 'All meals included'],
      houseRules: 'Follow safari guide instructions, Wildlife safety protocols apply',
      cancellationPolicy: 'Moderate: 50% refund 14 days prior to arrival',
      minimumStay: 3,
      maximumStay: 10,
      instantBook: false,
      status: ListingStatus.ACTIVE,
      images: [
        { url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&h=800&fit=crop', caption: 'Safari Lodge Exterior', isCover: true, sortOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop', caption: 'Luxury Tent Interior', isCover: false, sortOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop', caption: 'Serengeti View', isCover: false, sortOrder: 3 },
        { url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop', caption: 'Sunset Deck', isCover: false, sortOrder: 4 }
      ],
      coverImageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&h=800&fit=crop',
      averageRating: 4.9,
      totalReviews: 45,
      createdAt: '2024-07-22T07:00:00Z',
      updatedAt: '2024-11-25T11:50:00Z'
    },
    {
      publicId: 'lst-008',
      landlordPublicId: 'usr-008',
      title: 'Lake House Retreat in Lake Como',
      description: 'Relax in this elegant lakefront property on the shores of Lake Como, Italy. This beautifully restored villa offers panoramic lake and mountain views, a private dock, and lush gardens. Features include marble floors, antique furnishings, a gourmet kitchen, and multiple terraces perfect for al fresco dining. Close to charming villages, upscale boutiques, and excellent restaurants.',
      location: 'Bellagio',
      city: 'Como',
      country: 'Italy',
      latitude: 45.9771,
      longitude: 9.2577,
      address: 'Via Regina 100, 22021 Bellagio CO',
      pricePerNight: 675,
      currency: 'EUR',
      maxGuests: 10,
      bedrooms: 5,
      beds: 6,
      bathrooms: 4,
      propertyType: 'Villa',
      category: 'Lakefront',
      amenities: ['WiFi', 'Kitchen', 'Air conditioning', 'Lake view', 'Parking', 'Garden', 'Private dock', 'Boat rental', 'BBQ grill', 'Wine cellar'],
      houseRules: 'No smoking indoors, Events allowed with prior approval',
      cancellationPolicy: 'Strict: 50% refund up to 2 weeks before check-in',
      minimumStay: 4,
      maximumStay: 30,
      instantBook: false,
      status: ListingStatus.ACTIVE,
      images: [
        { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=800&fit=crop', caption: 'Lake Como Villa', isCover: true, sortOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200&h=800&fit=crop', caption: 'Elegant Living Room', isCover: false, sortOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop', caption: 'Lakefront Terrace', isCover: false, sortOrder: 3 },
        { url: 'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=1200&h=800&fit=crop', caption: 'Master Suite', isCover: false, sortOrder: 4 },
        { url: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&h=800&fit=crop', caption: 'Gourmet Kitchen', isCover: false, sortOrder: 5 }
      ],
      coverImageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=800&fit=crop',
      averageRating: 4.9,
      totalReviews: 112,
      createdAt: '2024-08-14T12:00:00Z',
      updatedAt: '2024-12-04T13:25:00Z'
    }
  ];

  constructor() {}

  // Mock implementation of search listings
  searchListings(searchParams: SearchListingParams): Observable<ApiResponse<ListingPage>> {
    let filteredListings = [...this.mockListings];

    // Apply filters
    if (searchParams.location) {
      filteredListings = filteredListings.filter(l => 
        l.location.toLowerCase().includes(searchParams.location!.toLowerCase()) ||
        l.city.toLowerCase().includes(searchParams.location!.toLowerCase())
      );
    }

    if (searchParams.city) {
      filteredListings = filteredListings.filter(l => 
        l.city.toLowerCase() === searchParams.city!.toLowerCase()
      );
    }

    if (searchParams.categories && searchParams.categories.length > 0) {
      filteredListings = filteredListings.filter(l => 
        searchParams.categories!.includes(l.category)
      );
    }

    if (searchParams.propertyTypes && searchParams.propertyTypes.length > 0) {
      filteredListings = filteredListings.filter(l => 
        searchParams.propertyTypes!.includes(l.propertyType)
      );
    }

    if (searchParams.minPrice) {
      filteredListings = filteredListings.filter(l => l.pricePerNight >= searchParams.minPrice!);
    }

    if (searchParams.maxPrice) {
      filteredListings = filteredListings.filter(l => l.pricePerNight <= searchParams.maxPrice!);
    }

    if (searchParams.guests) {
      filteredListings = filteredListings.filter(l => l.maxGuests >= searchParams.guests!);
    }

    if (searchParams.minBedrooms) {
      filteredListings = filteredListings.filter(l => l.bedrooms >= searchParams.minBedrooms!);
    }

    if (searchParams.minBathrooms) {
      filteredListings = filteredListings.filter(l => l.bathrooms >= searchParams.minBathrooms!);
    }

    if (searchParams.amenities && searchParams.amenities.length > 0) {
      filteredListings = filteredListings.filter(l => 
        searchParams.amenities!.every(amenity => l.amenities.includes(amenity))
      );
    }

    if (searchParams.instantBook) {
      filteredListings = filteredListings.filter(l => l.instantBook);
    }

    // Pagination
    const page = searchParams.page || 0;
    const size = searchParams.size || 20;
    const start = page * size;
    const end = start + size;
    const paginatedListings = filteredListings.slice(start, end);

    const response: ApiResponse<ListingPage> = {
      success: true,
      message: 'Listings retrieved successfully',
      timestamp: new Date().toISOString(),
      data: {
        content: paginatedListings,
        number: page,
        size: size,
        totalElements: filteredListings.length,
        totalPages: Math.ceil(filteredListings.length / size),
        first: page === 0,
        last: end >= filteredListings.length,
        empty: filteredListings.length === 0
      }
    };

    return of(response).pipe(delay(500)); // Simulate network delay
  }

  // Mock implementation of get listing by ID
  getListingById(publicId: string): Observable<ApiResponse<Listing>> {
    const listing = this.mockListings.find(l => l.publicId === publicId);
    
    const response: ApiResponse<Listing> = {
      success: !!listing,
      message: listing ? 'Listing retrieved successfully' : 'Listing not found',
      timestamp: new Date().toISOString(),
      data: listing || null as any
    };

    return of(response).pipe(delay(300));
  }

  // Mock implementation of get all listings
  getAllListings(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'createdAt',
    sortDirection: string = 'DESC'
  ): Observable<ApiResponse<ListingPage>> {
    return this.searchListings({ page, size, sortBy, sortDirection });
  }

  // Get listings by category
  getListingsByCategory(
    category: string,
    page: number = 0,
    size: number = 20
  ): Observable<ApiResponse<ListingPage>> {
    return this.searchListings({ categories: [category], page, size });
  }
}
