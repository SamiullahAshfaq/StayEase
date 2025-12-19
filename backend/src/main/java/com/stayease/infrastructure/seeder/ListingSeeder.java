package com.stayease.infrastructure.seeder;

import com.stayease.domain.listing.entity.Listing;
import com.stayease.domain.listing.entity.ListingImage;
import com.stayease.domain.listing.repository.ListingRepository;
import com.stayease.domain.user.entity.User;
import com.stayease.domain.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Database seeder for creating sample listings for Zain Yaqoob
 * (zainyaqoob66@youtubeLandlord.com)
 * 
 * To run this seeder, use: --spring.profiles.active=seed
 * Example: mvn spring-boot:run
 * -Dspring-boot.run.arguments=--spring.profiles.active=seed
 */
@Component
@Profile("seed")
public class ListingSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ListingSeeder.class);
    private static final String LANDLORD_EMAIL = "zainyaqoob66@youtubeLandlord.com";

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;

    public ListingSeeder(UserRepository userRepository, ListingRepository listingRepository) {
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("🌱 Starting Listing Seeder...");

        // Find Zain Yaqoob's user account
        Optional<User> landlordOpt = userRepository.findByEmail(LANDLORD_EMAIL);

        if (landlordOpt.isEmpty()) {
            log.error("❌ User not found: {}. Please ensure the user exists before running the seeder.", LANDLORD_EMAIL);
            return;
        }

        User landlord = landlordOpt.get();
        log.info("✅ Found landlord: {} (ID: {})", landlord.getEmail(), landlord.getId());

        // Check if listings already exist
        long existingCount = listingRepository.countByLandlord(landlord.getPublicId());
        if (existingCount > 0) {
            log.info("⚠️  Landlord already has {} listings. Skipping seeder to avoid duplicates.", existingCount);
            log.info("💡 To re-seed, delete existing listings first or modify the seeder logic.");
            return;
        }

        // Create 6 sample listings
        List<Listing> listings = Arrays.asList(
                createListing1(landlord),
                createListing2(landlord),
                createListing3(landlord),
                createListing4(landlord),
                createListing5(landlord),
                createListing6(landlord));

        // Save all listings
        listings.forEach(listing -> {
            Listing saved = listingRepository.save(listing);
            log.info("✅ Created listing: {} (ID: {}, Status: {})",
                    saved.getTitle(), saved.getPublicId(), saved.getStatus());
        });

        log.info("🎉 Seeding completed! Created {} listings for {}", listings.size(), LANDLORD_EMAIL);
        log.info("📊 You can now view these listings in the My Listings page.");
    }

    private Listing createListing1(User landlord) {
        Listing listing = Listing.builder()
                .landlordPublicId(landlord.getPublicId())
                .title("Luxury Downtown Penthouse with Skyline Views")
                .description(
                        "Experience the epitome of urban luxury in this stunning penthouse. Floor-to-ceiling windows offer breathtaking 360-degree city views. Features include a gourmet kitchen with top-of-the-line appliances, spacious master suite with spa-like bathroom, and a private rooftop terrace perfect for entertaining. Located in the heart of downtown, you're steps away from fine dining, shopping, and entertainment.")
                .propertyType("Apartment")
                .category("Luxury")
                .address("456 Sky Tower Blvd, Suite 4501")
                .location("New York, NY, United States")
                .city("New York")
                .country("United States")
                .latitude(new BigDecimal("40.7589"))
                .longitude(new BigDecimal("-73.9851"))
                .bedrooms(3)
                .beds(3)
                .bathrooms(new BigDecimal("2.5"))
                .maxGuests(6)
                .pricePerNight(new BigDecimal("450.00"))
                .currency("USD")
                .minimumStay(2)
                .maximumStay(30)
                .status(Listing.ListingStatus.ACTIVE)
                .instantBook(true)
                .houseRules("No smoking, No parties, Quiet hours 10pm-8am")
                .cancellationPolicy("MODERATE")
                .build();

        // Add amenities
        listing.getAmenities().addAll(Arrays.asList(
                "WiFi", "TV", "Kitchen", "Air Conditioning", "Heating",
                "Washer", "Gym", "Parking", "Elevator", "Workspace"));

        // Add images
        listing.getImages().addAll(Arrays.asList(
                createImage(listing, "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", 0, true),
                createImage(listing, "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", 1, false),
                createImage(listing, "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", 2, false),
                createImage(listing, "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800", 3, false)));

        return listing;
    }

    private Listing createListing2(User landlord) {
        Listing listing = Listing.builder()
                .landlordPublicId(landlord.getPublicId())
                .title("Cozy Beachfront Villa with Private Pool")
                .description(
                        "Escape to paradise in this beautiful beachfront villa. Wake up to the sound of waves and enjoy your morning coffee overlooking the ocean. The villa features a modern open-concept design, private infinity pool, outdoor dining area, and direct beach access. Perfect for families or groups seeking a relaxing tropical getaway.")
                .propertyType("Villa")
                .category("Beachfront")
                .address("789 Ocean Drive")
                .location("Miami Beach, FL, United States")
                .city("Miami Beach")
                .country("United States")
                .latitude(new BigDecimal("25.7907"))
                .longitude(new BigDecimal("-80.1300"))
                .bedrooms(4)
                .beds(5)
                .bathrooms(new BigDecimal("3.0"))
                .maxGuests(8)
                .pricePerNight(new BigDecimal("650.00"))
                .currency("USD")
                .minimumStay(3)
                .maximumStay(60)
                .status(Listing.ListingStatus.ACTIVE)
                .instantBook(false)
                .houseRules("No smoking indoors, No loud music after 10pm, Respect neighbors")
                .cancellationPolicy("STRICT")
                .build();

        listing.getAmenities().addAll(Arrays.asList(
                "WiFi", "TV", "Kitchen", "Air Conditioning", "Pool",
                "Beach Access", "BBQ Grill", "Parking", "Washer", "Garden"));

        listing.getImages().addAll(Arrays.asList(
                createImage(listing, "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800", 0, true),
                createImage(listing, "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", 1, false),
                createImage(listing, "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", 2, false),
                createImage(listing, "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", 3, false)));

        return listing;
    }

    private Listing createListing3(User landlord) {
        Listing listing = Listing.builder()
                .landlordPublicId(landlord.getPublicId())
                .title("Modern Loft in Arts District - Perfect for Creatives")
                .description(
                        "Inspire your creativity in this industrial-chic loft located in the vibrant Arts District. High ceilings, exposed brick walls, and massive windows create a bright, airy space. The open floor plan is perfect for both work and relaxation. Walking distance to galleries, cafes, and trendy restaurants.")
                .propertyType("Loft")
                .category("Creative")
                .address("123 Gallery Street, Unit 302")
                .location("Los Angeles, CA, United States")
                .city("Los Angeles")
                .country("United States")
                .latitude(new BigDecimal("34.0522"))
                .longitude(new BigDecimal("-118.2437"))
                .bedrooms(1)
                .beds(1)
                .bathrooms(new BigDecimal("1.0"))
                .maxGuests(2)
                .pricePerNight(new BigDecimal("180.00"))
                .currency("USD")
                .minimumStay(1)
                .maximumStay(28)
                .status(Listing.ListingStatus.ACTIVE)
                .instantBook(true)
                .houseRules("No smoking, No pets, Quiet hours 11pm-7am")
                .cancellationPolicy("FLEXIBLE")
                .build();

        listing.getAmenities().addAll(Arrays.asList(
                "WiFi", "TV", "Kitchen", "Air Conditioning", "Heating",
                "Workspace", "Washer", "Parking", "Elevator"));

        listing.getImages().addAll(Arrays.asList(
                createImage(listing, "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800", 0, true),
                createImage(listing, "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800", 1, false),
                createImage(listing, "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800", 2, false)));

        return listing;
    }

    private Listing createListing4(User landlord) {
        Listing listing = Listing.builder()
                .landlordPublicId(landlord.getPublicId())
                .title("Mountain Retreat Cabin with Hot Tub")
                .description(
                        "Escape to the mountains in this charming rustic cabin. Surrounded by towering pines and stunning mountain views, this cozy retreat offers the perfect blend of comfort and nature. Features include a stone fireplace, modern kitchen, outdoor hot tub, and deck with BBQ grill. Ideal for hiking enthusiasts and those seeking tranquility.")
                .propertyType("Cabin")
                .category("Mountain")
                .address("567 Pine Ridge Road")
                .location("Aspen, CO, United States")
                .city("Aspen")
                .country("United States")
                .latitude(new BigDecimal("39.1911"))
                .longitude(new BigDecimal("-106.8175"))
                .bedrooms(2)
                .beds(3)
                .bathrooms(new BigDecimal("2.0"))
                .maxGuests(5)
                .pricePerNight(new BigDecimal("280.00"))
                .currency("USD")
                .minimumStay(2)
                .maximumStay(21)
                .status(Listing.ListingStatus.ACTIVE)
                .instantBook(false)
                .houseRules("No smoking, Pets allowed with fee, Quiet neighborhood")
                .cancellationPolicy("MODERATE")
                .build();

        listing.getAmenities().addAll(Arrays.asList(
                "WiFi", "TV", "Kitchen", "Heating", "Fireplace",
                "Hot Tub", "BBQ Grill", "Parking", "Washer", "Pets Allowed"));

        listing.getImages().addAll(Arrays.asList(
                createImage(listing, "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800", 0, true),
                createImage(listing, "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800", 1, false),
                createImage(listing, "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800", 2, false),
                createImage(listing, "https://images.unsplash.com/photo-1470165634997-e4ca30e43dda?w=800", 3, false)));

        return listing;
    }

    private Listing createListing5(User landlord) {
        Listing listing = Listing.builder()
                .landlordPublicId(landlord.getPublicId())
                .title("Historic Townhouse in Georgetown")
                .description(
                        "Step into history with this beautifully restored Federal-style townhouse in Georgetown. Original hardwood floors, crown moldings, and period details have been carefully preserved while adding modern amenities. The home features a chef's kitchen, private garden, and rooftop deck with views of the city. Walk to upscale shops, restaurants, and the waterfront.")
                .propertyType("Townhouse")
                .category("Historic")
                .address("234 Historic Lane NW")
                .location("Washington, DC, United States")
                .city("Washington")
                .country("United States")
                .latitude(new BigDecimal("38.9072"))
                .longitude(new BigDecimal("-77.0369"))
                .bedrooms(3)
                .beds(4)
                .bathrooms(new BigDecimal("2.5"))
                .maxGuests(6)
                .pricePerNight(new BigDecimal("380.00"))
                .currency("USD")
                .minimumStay(2)
                .maximumStay(45)
                .status(Listing.ListingStatus.ACTIVE)
                .instantBook(true)
                .houseRules("No smoking, No parties, Respect historical property")
                .cancellationPolicy("MODERATE")
                .build();

        listing.getAmenities().addAll(Arrays.asList(
                "WiFi", "TV", "Kitchen", "Air Conditioning", "Heating",
                "Washer", "Workspace", "Garden", "Balcony", "Fireplace"));

        listing.getImages().addAll(Arrays.asList(
                createImage(listing, "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800", 0, true),
                createImage(listing, "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", 1, false),
                createImage(listing, "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800", 2, false),
                createImage(listing, "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800", 3, false)));

        return listing;
    }

    private Listing createListing6(User landlord) {
        Listing listing = Listing.builder()
                .landlordPublicId(landlord.getPublicId())
                .title("Waterfront Condo with Marina Views")
                .description(
                        "Enjoy resort-style living in this luxurious waterfront condo. Floor-to-ceiling windows showcase stunning marina and sunset views. The building offers world-class amenities including infinity pool, fitness center, spa, and concierge service. The unit features high-end finishes, gourmet kitchen, and spacious balcony. Perfect for both short stays and extended visits.")
                .propertyType("Condo")
                .category("Waterfront")
                .address("888 Marina Boulevard, Unit 1205")
                .location("San Diego, CA, United States")
                .city("San Diego")
                .country("United States")
                .latitude(new BigDecimal("32.7157"))
                .longitude(new BigDecimal("-117.1611"))
                .bedrooms(2)
                .beds(2)
                .bathrooms(new BigDecimal("2.0"))
                .maxGuests(4)
                .pricePerNight(new BigDecimal("320.00"))
                .currency("USD")
                .minimumStay(2)
                .maximumStay(90)
                .status(Listing.ListingStatus.ACTIVE)
                .instantBook(true)
                .houseRules("No smoking, No pets, Building quiet hours 10pm-8am")
                .cancellationPolicy("FLEXIBLE")
                .build();

        listing.getAmenities().addAll(Arrays.asList(
                "WiFi", "TV", "Kitchen", "Air Conditioning", "Pool",
                "Gym", "Parking", "Elevator", "Washer", "Workspace", "Balcony"));

        listing.getImages().addAll(Arrays.asList(
                createImage(listing, "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800", 0, true),
                createImage(listing, "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800", 1, false),
                createImage(listing, "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800", 2, false),
                createImage(listing, "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", 3, false)));

        return listing;
    }

    private ListingImage createImage(Listing listing, String url, int sortOrder, boolean isCover) {
        ListingImage image = new ListingImage();
        image.setListing(listing);
        image.setUrl(url);
        image.setSortOrder(sortOrder);
        image.setIsCover(isCover);
        return image;
    }
}
