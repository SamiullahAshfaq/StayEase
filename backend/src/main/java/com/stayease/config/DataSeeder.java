package com.stayease.config;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.stayease.domain.booking.entity.Booking;
import com.stayease.domain.booking.entity.Booking.BookingStatus;
import com.stayease.domain.booking.entity.Booking.PaymentStatus;
import com.stayease.domain.booking.repository.BookingRepository;
import com.stayease.domain.listing.entity.Listing;
import com.stayease.domain.listing.entity.ListingImage;
import com.stayease.domain.listing.repository.ListingRepository;
import com.stayease.domain.serviceoffering.entity.ServiceImage;
import com.stayease.domain.serviceoffering.entity.ServiceOffering;
import com.stayease.domain.serviceoffering.entity.ServiceOffering.PricingType;
import com.stayease.domain.serviceoffering.entity.ServiceOffering.ServiceCategory;
import com.stayease.domain.serviceoffering.entity.ServiceOffering.ServiceStatus;
import com.stayease.domain.serviceoffering.repository.ServiceImageRepository;
import com.stayease.domain.serviceoffering.repository.ServiceOfferingRepository;
import com.stayease.domain.user.entity.Authority;
import com.stayease.domain.user.entity.User;
import com.stayease.domain.user.entity.UserAuthority;
import com.stayease.domain.user.repository.AuthorityRepository;
import com.stayease.domain.user.repository.UserAuthorityRepository;
import com.stayease.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Comprehensive Data Seeder - Populates database with ALL 40 listings from mock data
 * Only runs in 'dev' profile
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;
    private final UserAuthorityRepository userAuthorityRepository;
    private final ListingRepository listingRepository;
    private final BookingRepository bookingRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final ServiceImageRepository serviceImageRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("🚀 Starting comprehensive data seeding with 40 listings...");

        // Check if data already exists
        if (userRepository.count() > 0) {
            log.info("📊 Database already contains data. Skipping seeding.");
            return;
        }

        try {
            seedAuthorities();
            Map<String, User> users = seedUsers();
            Map<String, Listing> listings = seedAllListings(users);
            seedBookings(users, listings);
            Map<String, ServiceOffering> services = seedServiceOfferings(users);

            log.info("✅ Comprehensive data seeding completed successfully!");
            log.info("📈 Created {} users, {} listings, {} bookings, {} service offerings", 
                users.size(), listings.size(), bookingRepository.count(), services.size());
            log.info("🎯 Database is ready with complete data: Users, Listings, Services & Bookings");
            log.info("=".repeat(80));
        } catch (Exception e) {
            log.error("❌ Error during data seeding: ", e);
        }
    }

    private void seedAuthorities() {
        log.info("🔐 Seeding authorities...");
        
        List<String> roles = Arrays.asList("ROLE_USER", "ROLE_LANDLORD", "ROLE_ADMIN");
        
        for (String roleName : roles) {
            if (authorityRepository.findByName(roleName).isEmpty()) {
                Authority authority = Authority.builder()
                        .name(roleName)
                        .build();
                authorityRepository.save(authority);
                log.info("Created authority: {}", roleName);
            }
        }
    }

    private Map<String, User> seedUsers() {
        log.info("👥 Seeding users (40 landlords + admins + guests)...");
        
        Map<String, User> users = new HashMap<>();
        
        // Admin user
        User admin = createUser(
                "admin@stayease.com",
                "Admin",
                "User",
                "+1234567890",
                "/images/profiles/admin.jpg",
                "System administrator with full access.",
                true
        );
        admin = userRepository.save(admin);
        assignAuthorities(admin, "ROLE_ADMIN", "ROLE_USER");
        users.put("admin", admin);

        // Regular users (guests) - 5 users
        String[] guestEmails = {"john.doe@example.com", "jane.smith@example.com", "bob.wilson@example.com", "alice.brown@example.com", "charlie.davis@example.com"};
        String[] guestFirstNames = {"John", "Jane", "Bob", "Alice", "Charlie"};
        String[] guestLastNames = {"Doe", "Smith", "Wilson", "Brown", "Davis"};
        
        for (int i = 0; i < 5; i++) {
            User guest = createUser(
                    guestEmails[i],
                    guestFirstNames[i],
                    guestLastNames[i],
                    "+155500000" + (i + 1),
                    "/images/profiles/user-" + (10 + i) + ".jpg",
                    "Travel enthusiast and adventure seeker.",
                    true
            );
            guest = userRepository.save(guest);
            assignAuthorities(guest, "ROLE_USER");
            users.put("guest" + (i + 1), guest);
        }

        // Landlords - 40 landlords for 40 listings
        String[] landlordFirstNames = {"Michael", "Sarah", "David", "Emma", "James", "Olivia", "Robert", "Sophia", "William", "Ava",
            "Richard", "Isabella", "Charles", "Mia", "Thomas", "Charlotte", "Daniel", "Amelia", "Matthew", "Harper",
            "Christopher", "Evelyn", "Andrew", "Abigail", "Joshua", "Emily", "Kevin", "Elizabeth", "Brian", "Sofia",
            "George", "Avery", "Kenneth", "Ella", "Steven", "Scarlett", "Edward", "Grace", "Ronald", "Chloe"};
        
        for (int i = 0; i < 40; i++) {
            User landlord = createUser(
                    "landlord" + (i + 1) + "@stayease.com",
                    landlordFirstNames[i],
                    "Property Owner",
                    "+1555010" + String.format("%03d", i + 1),
                    "/images/profiles/landlord-" + (i + 1) + ".jpg",
                    "Experienced property owner with unique listings.",
                    true
            );
            landlord = userRepository.save(landlord);
            assignAuthorities(landlord, "ROLE_LANDLORD", "ROLE_USER");
            users.put("landlord" + (i + 1), landlord);
        }

        log.info("Created {} users ({} landlords, {} guests, 1 admin)", users.size(), 40, 5);
        return users;
    }

    private User createUser(String email, String firstName, String lastName, 
                           String phone, String imageUrl, String bio, boolean verified) {
        return User.builder()
                .publicId(UUID.randomUUID())
                .email(email)
                .password(passwordEncoder.encode("Password123!"))
                .firstName(firstName)
                .lastName(lastName)
                .phoneNumber(phone)
                .profileImageUrl(imageUrl)
                .bio(bio)
                .isEmailVerified(verified)
                .isPhoneVerified(verified)
                .isActive(true)
                .build();
    }

    private void assignAuthorities(User user, String... roleNames) {
        for (String roleName : roleNames) {
            Authority authority = authorityRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException("Authority not found: " + roleName));
            
            UserAuthority userAuthority = UserAuthority.builder()
                    .user(user)
                    .authority(authority)
                    .build();
            userAuthorityRepository.save(userAuthority);
        }
    }

    private Map<String, Listing> seedAllListings(Map<String, User> users) {
        log.info("🏠 Seeding ALL 40 listings from mock data...");
        
        Map<String, Listing> listings = new HashMap<>();

        // All listing data from mock-listing.service.ts
        Object[][] listingData = {
            // {landlordKey, title, description, location, city, country, lat, lng, address, price, maxGuests, bedrooms, beds, bathrooms, propertyType, category, amenities, rules, cancelPolicy, minStay, maxStay, instantBook, imageNum}
            {"landlord1", "Luxury Beachfront Villa in Malibu", "Experience the ultimate coastal living in this stunning beachfront villa. Wake up to breathtaking ocean views, enjoy private beach access, and relax in the infinity pool overlooking the Pacific.", "Malibu", "Malibu", "United States", 34.0259, -118.7798, "123 Pacific Coast Highway, Malibu, CA 90265", 850, 8, 4, 5, 4.5, "Villa", "Beachfront", "WiFi,Pool,Kitchen,Air conditioning,Beach access,Parking,Ocean view,Hot tub,BBQ grill,Gym", "No smoking, No parties, Check-in after 3 PM, Check-out before 11 AM", "FLEXIBLE", 2, 30, true, 1},
            {"landlord2", "Cozy Mountain Cabin in Aspen", "Escape to this charming mountain retreat nestled in the heart of Aspen. This rustic yet modern cabin offers the perfect blend of comfort and adventure.", "Aspen", "Aspen", "United States", 39.1911, -106.8175, "456 Mountain Trail, Aspen, CO 81611", 425, 6, 3, 4, 2, "Cabin", "Countryside", "WiFi,Fireplace,Kitchen,Heating,Mountain view,Parking,Hot tub,Ski storage,Washer,Dryer", "No smoking, Pets allowed with fee, Quiet hours 10 PM - 8 AM", "MODERATE", 3, 14, false, 2},
            {"landlord3", "Modern Downtown Loft in NYC", "Stay in the heart of Manhattan in this sleek, contemporary loft. Perfect for business travelers and urban explorers.", "Manhattan", "New York", "United States", 40.7580, -73.9855, "789 Broadway, New York, NY 10003", 295, 4, 2, 2, 2, "Loft", "City", "WiFi,Kitchen,Air conditioning,Elevator,City view,Workspace,Smart TV,Coffee maker,Keyless entry", "No smoking, No pets, No parties", "STRICT", 1, 30, true, 3},
            {"landlord4", "Tropical Paradise Villa in Bali", "Immerse yourself in luxury at this stunning tropical villa surrounded by lush rice paddies and jungle views.", "Ubud", "Ubud", "Indonesia", -8.5069, 115.2625, "Jl. Raya Ubud No. 88, Ubud, Bali 80571", 185, 4, 2, 2, 2, "Villa", "Tropical", "WiFi,Pool,Kitchen,Air conditioning,Garden view,Parking,Outdoor shower,Yoga space,Daily cleaning", "No smoking indoors, Respectful of local culture", "FLEXIBLE", 2, 30, true, 4},
            {"landlord5", "Historic Parisian Apartment with Eiffel Tower View", "Experience authentic Parisian living in this beautifully renovated 19th-century apartment.", "Paris 7th", "Paris", "France", 48.8566, 2.3522, "12 Avenue de la Bourdonnais, 75007 Paris", 385, 5, 2, 3, 1, "Apartment", "City", "WiFi,Kitchen,Heating,Eiffel Tower view,Balcony,Washer,Elevator,Coffee maker,Wine glasses", "No smoking, No parties, Quiet hours 10 PM - 8 AM", "MODERATE", 3, 30, false, 5},
            {"landlord6", "Seaside Cottage in Santorini", "Discover the magic of Santorini in this traditional Cycladic cottage perched on the caldera cliff.", "Oia", "Santorini", "Greece", 36.4618, 25.3753, "Oia Main Street, Santorini 84702", 320, 2, 1, 1, 1, "Cottage", "Beachfront", "WiFi,Kitchen,Air conditioning,Sea view,Terrace,Outdoor dining,Sunset view,Wine cellar", "No smoking, No pets, Romantic retreat - adults only", "FLEXIBLE", 2, 14, true, 6},
            {"landlord7", "Safari Lodge in Serengeti National Park", "Experience the African wilderness in this luxury safari lodge overlooking the vast Serengeti plains.", "Serengeti", "Serengeti", "Tanzania", -2.3333, 34.8333, "Serengeti National Park, Tanzania", 550, 2, 1, 1, 1, "Lodge", "Countryside", "WiFi,Restaurant,Bar,Wildlife view,Safari tours,Fire pit,Outdoor shower,Laundry service,All meals included", "Follow safari guide instructions, Wildlife safety protocols apply", "MODERATE", 3, 10, false, 7},
            {"landlord8", "Lake House Retreat in Lake Como", "Relax in this elegant lakefront property on the shores of Lake Como, Italy.", "Bellagio", "Como", "Italy", 45.9771, 9.2577, "Via Regina 100, 22021 Bellagio CO", 675, 10, 5, 6, 4, "Villa", "Lakefront", "WiFi,Kitchen,Air conditioning,Lake view,Parking,Garden,Private dock,Boat rental,BBQ grill,Wine cellar", "No smoking indoors, Events allowed with prior approval", "STRICT", 4, 30, false, 8},
            {"landlord9", "Cliffside Villa with Panoramic Mountain Views", "Perched on a dramatic cliff edge, this architectural masterpiece offers breathtaking 360-degree views.", "Big Sur", "Big Sur", "United States", 36.2704, -121.8081, "1 Cliffside Drive, Big Sur, CA 93920", 950, 6, 3, 3, 3, "Villa", "Amazing views", "WiFi,Pool,Kitchen,Air conditioning,Mountain view,Ocean view,Hot tub,Fireplace,Parking,BBQ grill", "No smoking, No parties, Quiet hours 10 PM - 8 AM", "MODERATE", 2, 30, true, 9},
            {"landlord10", "Glass House in the Alps", "Experience unparalleled views of the Swiss Alps from this stunning glass-walled residence.", "Zermatt", "Zermatt", "Switzerland", 46.0207, 7.7491, "Alpine Road 42, 3920 Zermatt", 1250, 8, 4, 5, 4, "House", "Amazing views", "WiFi,Kitchen,Heating,Mountain view,Sauna,Fireplace,Parking,Ski storage,Hot tub,Smart home", "No smoking, No pets, Mountain safety guidelines apply", "STRICT", 3, 21, false, 10},
            {"landlord11", "Luxury Dome with Aurora Views in Iceland", "Stay in this Instagram-famous geodesic dome and witness the Northern Lights from your bed.", "Reykjavik", "Reykjavik", "Iceland", 64.1466, -21.9426, "Northern Lights Road 15, Reykjavik 101", 495, 2, 1, 1, 1, "House", "Trending", "WiFi,Heating,Hot tub,Northern Lights view,Stargazing,Eco-friendly,Kitchen,Parking", "No smoking, No pets, Respect nature", "FLEXIBLE", 2, 7, true, 11},
            {"landlord12", "Floating Villa in the Maldives", "Experience the ultimate luxury in this overwater villa that's taken social media by storm.", "Male Atoll", "Male", "Maldives", 4.1755, 73.5093, "Overwater Villa 7, Male Atoll", 1850, 4, 2, 2, 2, "Villa", "Trending", "WiFi,Pool,Air conditioning,Ocean view,Private beach,Snorkeling gear,Kayaks,Butler service,Spa", "No smoking, Marine conservation rules apply", "STRICT", 3, 14, false, 12},
            {"landlord13", "Rustic Log Cabin in the Smokies", "Escape to this authentic log cabin nestled in the Great Smoky Mountains.", "Gatlinburg", "Gatlinburg", "United States", 35.7143, -83.5102, "Mountain Trail Road 88, Gatlinburg, TN 37738", 285, 6, 3, 4, 2, "Cabin", "Cabins", "WiFi,Fireplace,Kitchen,Heating,Mountain view,Parking,Hot tub,BBQ grill,Washer,Dryer", "No smoking, Pets allowed with fee, Quiet hours 10 PM - 7 AM", "FLEXIBLE", 2, 14, true, 13},
            {"landlord14", "Modern Cabin Retreat in the Canadian Rockies", "This contemporary cabin blends modern luxury with wilderness charm.", "Banff", "Banff", "Canada", 51.1784, -115.5708, "Rocky Mountain Road 234, Banff, AB T1L 1A1", 525, 8, 4, 5, 3, "Cabin", "Cabins", "WiFi,Fireplace,Kitchen,Heating,Mountain view,Parking,Hot tub,Sauna,Ski storage,Smart home", "No smoking, No pets, Bear-safe food storage required", "MODERATE", 3, 21, false, 14},
            {"landlord15", "Beverly Hills Mega Mansion", "Live like a celebrity in this 15,000 sq ft mansion in the heart of Beverly Hills.", "Beverly Hills", "Los Angeles", "United States", 34.0736, -118.4004, "90210 Sunset Boulevard, Beverly Hills, CA 90210", 3500, 16, 8, 10, 10, "House", "Mansions", "WiFi,Pool,Kitchen,Air conditioning,City view,Parking,Gym,Home theater,Wine cellar,Smart home,Security system,Chef kitchen", "No smoking, Events allowed with approval, Security deposit required", "STRICT", 3, 30, false, 15},
            {"landlord16", "Historic French Chateau Estate", "Own a piece of history in this magnificent 18th-century chateau set on 50 acres.", "Loire Valley", "Tours", "France", 47.3941, 0.6848, "Château Route 1, 37000 Tours", 4200, 20, 10, 12, 8, "House", "Mansions", "WiFi,Kitchen,Heating,Garden view,Parking,Wine cellar,Library,Formal gardens,Piano,Staff quarters,Event space", "No smoking indoors, Events welcome, Respectful of historic property", "STRICT", 4, 30, false, 16},
            {"landlord17", "Award-Winning Minimalist House in Tokyo", "Experience Japanese design excellence in this award-winning minimalist residence.", "Shibuya", "Tokyo", "Japan", 35.6595, 139.7004, "2-21-1 Shibuya, Tokyo 150-0002", 625, 4, 2, 2, 2, "House", "Design", "WiFi,Kitchen,Air conditioning,City view,Zen garden,Smart home,Minimalist design,Eco-friendly,Workspace", "No smoking, No shoes indoors, Respect minimalist aesthetic", "MODERATE", 2, 14, true, 17},
            {"landlord18", "Bauhaus-Inspired Desert Residence", "Stay in this stunning example of modern desert architecture.", "Palm Springs", "Palm Springs", "United States", 33.8303, -116.5453, "456 Modernist Way, Palm Springs, CA 92262", 725, 6, 3, 3, 3, "House", "Design", "WiFi,Pool,Kitchen,Air conditioning,Mountain view,Parking,Outdoor shower,Fire pit,Solar power,Modern art", "No smoking, No pets, Respect architectural features", "FLEXIBLE", 2, 21, true, 18},
            {"landlord19", "Villa with Olympic-Size Pool in Ibiza", "Make a splash in this luxurious villa featuring an Olympic-size swimming pool.", "San Antonio", "Ibiza", "Spain", 38.9807, 1.3023, "Cala Bassa Road 77, 07820 Ibiza", 1150, 12, 6, 8, 6, "Villa", "Pools", "WiFi,Pool,Kitchen,Air conditioning,Sea view,Parking,Outdoor bar,BBQ grill,Sun loungers,Pool toys,Sound system", "No smoking indoors, Events allowed with approval, Pool safety rules apply", "STRICT", 4, 30, false, 19},
            {"landlord20", "Tropical Estate with Natural Pool and Waterfall", "Immerse yourself in paradise at this unique estate featuring a natural rock pool fed by a stunning waterfall.", "Phuket", "Phuket", "Thailand", 7.8804, 98.3923, "Kamala Beach Road 123, Phuket 83150", 875, 10, 5, 6, 5, "Villa", "Pools", "WiFi,Pool,Kitchen,Air conditioning,Ocean view,Parking,Waterfall,Swim-up bar,Tropical garden,Outdoor dining,Pool service", "No smoking, Children welcome, Pool supervision required", "MODERATE", 3, 28, true, 20},
            {"landlord21", "Private Island Villa in the Caribbean", "Experience ultimate privacy on your own Caribbean island.", "Exuma", "Nassau", "Bahamas", 23.5625, -75.9394, "Private Island, Exuma Cays", 5500, 12, 6, 8, 6, "Villa", "Islands", "WiFi,Pool,Kitchen,Air conditioning,Ocean view,Private beach,Boat,Snorkeling gear,Kayaks,Full staff,Private chef,Helicopter pad", "No smoking indoors, Respect marine life, Island rules apply", "STRICT", 5, 21, false, 21},
            {"landlord22", "Secluded Beach House in Seychelles", "Discover paradise in this exclusive beach house on a pristine Seychelles island.", "Praslin", "Praslin", "Seychelles", -4.3197, 55.7449, "Anse Lazio Beach, Praslin", 2200, 8, 4, 5, 4, "House", "Islands", "WiFi,Kitchen,Air conditioning,Ocean view,Private beach,Snorkeling gear,Fishing equipment,Kayaks,Outdoor shower,Hammocks,BBQ grill", "No smoking, Eco-friendly practices required, Respect wildlife", "STRICT", 4, 21, false, 22},
            {"landlord23", "Luxury Cave Dwelling in Cappadocia", "Stay in an authentic cave hotel carved into the fairy chimneys of Cappadocia.", "Göreme", "Cappadocia", "Turkey", 38.6431, 34.8286, "Göreme Valley Road 45, 50180 Cappadocia", 295, 4, 2, 2, 2, "House", "Caves", "WiFi,Kitchen,Heating,Air conditioning,Valley view,Terrace,Hot air balloon view,Turkish bath,Fireplace", "No smoking, Respect historic structure, Quiet hours 10 PM - 8 AM", "FLEXIBLE", 2, 14, true, 23},
            {"landlord24", "Modern Cave House in Southern Spain", "Experience unique troglodyte living in this renovated cave house in Andalusia.", "Guadix", "Granada", "Spain", 37.2998, -3.1371, "Barrio de Cuevas 12, 18500 Guadix", 175, 6, 3, 3, 2, "House", "Caves", "WiFi,Kitchen,Heating,Air conditioning,Mountain view,Courtyard,Parking,Eco-friendly,Authentic architecture", "No smoking, No pets, Respectful of neighbors", "FLEXIBLE", 2, 21, true, 24},
            {"landlord25", "Medieval Castle in the Scottish Highlands", "Live like royalty in this authentic 12th-century castle complete with turrets, great halls, and sweeping Highland views.", "Inverness", "Inverness", "Scotland", 57.4778, -4.2247, "Castle Road, Inverness IV2 3HG", 2800, 18, 9, 12, 7, "House", "Castles", "WiFi,Kitchen,Heating,Fireplace,Highland view,Parking,Library,Great hall,Historic grounds,Event space,Staff available", "No smoking, Respect historic property, Events allowed with approval", "STRICT", 3, 30, false, 25},
            {"landlord26", "Romantic Castle Tower in Germany", "Stay in a fairy-tale castle tower along the Rhine River.", "Rhine Valley", "Koblenz", "Germany", 50.3569, 7.5890, "Rheinuferstrasse 100, 56068 Koblenz", 485, 2, 1, 1, 1, "House", "Castles", "WiFi,Heating,River view,Wine cellar,Historic grounds,Four-poster bed,Fireplace,Medieval architecture", "No smoking, Romantic retreat - adults only, Respect historic property", "MODERATE", 2, 7, true, 26},
            {"landlord27", "Ski-In/Ski-Out Chalet in Whistler", "Hit the slopes directly from this luxury ski chalet in Whistler.", "Whistler", "Whistler", "Canada", 50.1163, -122.9574, "Blackcomb Way 200, Whistler, BC V8E 0X1", 1450, 10, 5, 6, 5, "Chalet", "Skiing", "WiFi,Kitchen,Heating,Mountain view,Hot tub,Sauna,Ski storage,Boot warmers,Fireplace,Parking,Ski-in/Ski-out", "No smoking, Ski equipment care required, Quiet hours 10 PM - 8 AM", "STRICT", 4, 30, false, 27},
            {"landlord28", "Alpine Ski Lodge in the French Alps", "Experience authentic Alpine living in this traditional ski lodge in Chamonix.", "Chamonix", "Chamonix", "France", 45.9237, 6.8694, "Route des Pèlerins 88, 74400 Chamonix", 825, 8, 4, 5, 3, "Chalet", "Skiing", "WiFi,Kitchen,Heating,Mountain view,Fireplace,Ski storage,Parking,Terrace,Sauna,Boot warmers", "No smoking, Mountaineering equipment care required, Bear-safe food storage", "MODERATE", 3, 21, true, 28},
            {"landlord29", "Luxury Safari Tent in Yosemite", "Glamp in style at this luxury safari tent with stunning views of Yosemite Valley.", "Yosemite", "Yosemite", "United States", 37.8651, -119.5383, "Yosemite Valley Road, Yosemite, CA 95389", 375, 2, 1, 1, 1, "House", "Camping", "WiFi,Heating,Valley view,Private deck,Outdoor shower,Campfire pit,Hiking access,Eco-friendly,Stargazing", "No smoking, Wildlife safety protocols, Leave no trace principles", "FLEXIBLE", 2, 7, true, 29},
            {"landlord30", "Glamping Dome in New Zealand", "Sleep under the stars in this transparent glamping dome surrounded by New Zealand's pristine wilderness.", "Queenstown", "Queenstown", "New Zealand", -45.0312, 168.6626, "Mountain Road 234, Queenstown 9300", 295, 2, 1, 1, 1, "House", "Camping", "WiFi,Heating,Mountain view,Stargazing,Hiking access,Kitchenette,Eco-friendly,Outdoor seating,Campfire pit", "No smoking, Eco-friendly practices required, Wildlife respect", "FLEXIBLE", 1, 7, true, 30},
            {"landlord31", "Penthouse Suite with Burj Khalifa View", "Experience the height of luxury in this ultra-modern penthouse with panoramic views of the Burj Khalifa and Dubai skyline.", "Downtown Dubai", "Dubai", "United Arab Emirates", 25.1972, 55.2744, "Sheikh Mohammed bin Rashid Blvd, Dubai", 3200, 6, 3, 3, 4, "Apartment", "Luxe", "WiFi,Pool,Kitchen,Air conditioning,Burj Khalifa view,Concierge,Gym,Spa,Valet parking,Smart home,Butler service,Wine cellar", "No smoking, No parties, Dubai regulations apply", "STRICT", 3, 30, false, 31},
            {"landlord32", "Monaco Yacht Club Residence", "Live the Monaco lifestyle in this prestigious apartment overlooking the yacht club and Mediterranean.", "Monte Carlo", "Monaco", "Monaco", 43.7384, 7.4246, "Avenue Princesse Grace, 98000 Monaco", 2850, 4, 2, 2, 3, "Apartment", "Luxe", "WiFi,Kitchen,Air conditioning,Sea view,Concierge,Parking,Gym,Pool,Security,Marble finishes,Designer furniture", "No smoking, Dress code for building amenities, Monaco regulations", "STRICT", 5, 30, false, 32},
            {"landlord33", "Minimalist Tiny House on Wheels", "Experience tiny living in this beautifully designed mobile tiny house.", "Portland", "Portland", "United States", 45.5152, -122.6784, "Tiny House Village, Portland, OR 97214", 125, 2, 1, 1, 1, "House", "Tiny homes", "WiFi,Kitchen,Heating,Air conditioning,Workspace,Eco-friendly,Solar power,Composting toilet,Smart storage", "No smoking, Minimalist living principles, Eco-friendly practices", "FLEXIBLE", 2, 14, true, 33},
            {"landlord34", "Off-Grid Tiny Cabin in the Woods", "Disconnect and recharge in this charming off-grid tiny cabin surrounded by forest.", "Asheville", "Asheville", "United States", 35.5951, -82.5515, "Forest Road 456, Asheville, NC 28801", 145, 2, 1, 1, 1, "Cabin", "Tiny homes", "Forest view,Wood stove,Outdoor shower,Deck,Solar power,Eco-friendly,Hiking access,Off-grid,Stargazing", "No smoking, Off-grid living practices, Wildlife safety, Pack it in/pack it out", "FLEXIBLE", 2, 7, true, 34},
            {"landlord35", "Luxury Treehouse in Costa Rica Rainforest", "Sleep among the treetops in this spectacular treehouse suspended in the Costa Rican rainforest canopy.", "Monteverde", "Monteverde", "Costa Rica", 10.3046, -84.8250, "Cloud Forest Road, Monteverde 60109", 385, 4, 2, 2, 1, "House", "Treehouses", "WiFi,Kitchen,Rainforest view,Wildlife viewing,Outdoor shower,Rope bridge,Eco-friendly,Hiking access,Stargazing", "No smoking, Respect wildlife, Treehouse safety guidelines", "FLEXIBLE", 2, 14, true, 35},
            {"landlord36", "Modern Treehouse Retreat in the Pacific Northwest", "Experience treehouse living reimagined in this contemporary design.", "Olympic Peninsula", "Seattle", "United States", 47.8021, -123.5269, "Forest Drive 789, Olympic Peninsula, WA 98363", 425, 2, 1, 1, 1, "House", "Treehouses", "WiFi,Kitchen,Heating,Forest view,Hot tub,Fireplace,Eco-friendly,Modern design,Hiking access", "No smoking, No pets, Respect forest environment", "MODERATE", 2, 7, true, 36},
            {"landlord37", "Working Vineyard Estate in Tuscany", "Live the Italian dream at this authentic working vineyard in the heart of Tuscany.", "Chianti", "Florence", "Italy", 43.5465, 11.2605, "Via del Vino 50, 50022 Chianti", 625, 8, 4, 5, 3, "House", "Farms", "WiFi,Kitchen,Pool,Vineyard view,Wine cellar,Cooking classes,Wine tasting,Olive grove,Farm animals,Parking", "No smoking indoors, Respect working farm, Participation welcome", "MODERATE", 3, 21, false, 37},
            {"landlord38", "Organic Farm Cottage in Vermont", "Experience sustainable farm living in this charming cottage on a certified organic farm.", "Stowe", "Stowe", "United States", 44.4654, -72.6874, "Farm Road 234, Stowe, VT 05672", 235, 6, 3, 4, 2, "Cottage", "Farms", "WiFi,Kitchen,Heating,Mountain view,Farm animals,Organic garden,Fresh eggs,Wood stove,Hiking access,Parking", "No smoking, Farm safety rules, Children must be supervised around animals", "FLEXIBLE", 2, 14, true, 38},
            {"landlord39", "Colonial-Era Mansion in Charleston", "Step back in time in this meticulously restored 1780s mansion in Charleston's historic district.", "Historic District", "Charleston", "United States", 32.7765, -79.9311, "Meeting Street 100, Charleston, SC 29401", 875, 10, 5, 6, 4, "House", "Historical homes", "WiFi,Kitchen,Air conditioning,Historic district,Formal garden,Library,Period furnishings,Fireplace,Parking,Event space", "No smoking, Respect historic property, Events allowed with approval", "STRICT", 3, 21, false, 39},
            {"landlord40", "Victorian Manor in San Francisco", "Experience the grandeur of the Gilded Age in this stunning 1890s Victorian manor.", "Pacific Heights", "San Francisco", "United States", 37.7913, -122.4363, "Broadway 2000, San Francisco, CA 94115", 725, 8, 4, 5, 3, "House", "Historical homes", "WiFi,Kitchen,Heating,City view,Turret room,Stained glass,Historic district,Garden,Parking,Period furnishings", "No smoking, No parties, Respect Victorian features", "MODERATE", 2, 14, true, 40}
        };

        for (int i = 0; i < listingData.length; i++) {
            Object[] data = listingData[i];
            String landlordKey = (String) data[0];
            User landlord = users.get(landlordKey);
            
            Listing listing = Listing.builder()
                    .publicId(UUID.randomUUID())
                    .landlordPublicId(landlord.getPublicId())
                    .title((String) data[1])
                    .description((String) data[2])
                    .location((String) data[3])
                    .city((String) data[4])
                    .country((String) data[5])
                    .latitude(new BigDecimal((double) data[6]))
                    .longitude(new BigDecimal((double) data[7]))
                    .address((String) data[8])
                    .pricePerNight(new BigDecimal((int) data[9]))
                    .currency("USD")
                    .maxGuests((int) data[10])
                    .bedrooms((int) data[11])
                    .beds((int) data[12])
                    .bathrooms(new BigDecimal(data[13].toString()))
                    .propertyType((String) data[14])
                    .category((String) data[15])
                    .amenities(Arrays.asList(((String) data[16]).split(",")))
                    .houseRules((String) data[17])
                    .cancellationPolicy((String) data[18])
                    .minimumStay((int) data[19])
                    .maximumStay((int) data[20])
                    .instantBook((boolean) data[21])
                    .status(Listing.ListingStatus.ACTIVE)
                    .build();

            // Add images - use local images copied from frontend
            int imageNum = (int) data[22];
            listing.addImage(createImage("/images/listings/listing-" + imageNum + ".jpg", "Main View", true, 0));
            
            listing = listingRepository.save(listing);
            listings.put("lst-" + String.format("%03d", i + 1), listing);
        }

        log.info("✅ Created {} listings with images from local storage", listings.size());
        return listings;
    }

    private ListingImage createImage(String url, String caption, boolean isCover, int order) {
        return ListingImage.builder()
                .url(url)
                .caption(caption)
                .isCover(isCover)
                .sortOrder(order)
                .build();
    }

    private void seedBookings(Map<String, User> users, Map<String, Listing> listings) {
        log.info("📅 Seeding bookings...");
        
        User guest1 = users.get("guest1");
        User guest2 = users.get("guest2");

        // Sample bookings
        Booking booking1 = createBooking(
                listings.get("lst-001"),
                guest1,
                LocalDate.of(2025, 12, 15),
                LocalDate.of(2025, 12, 20),
                4,
                new BigDecimal("4250.00"),
                BookingStatus.CONFIRMED,
                PaymentStatus.PAID,
                "Late check-in around 10 PM. Need parking for 2 cars."
        );
        bookingRepository.save(booking1);

        Booking booking2 = createBooking(
                listings.get("lst-005"),
                guest1,
                LocalDate.of(2026, 2, 10),
                LocalDate.of(2026, 2, 17),
                2,
                new BigDecimal("2695.00"),
                BookingStatus.CONFIRMED,
                PaymentStatus.PAID,
                "Anniversary trip!"
        );
        bookingRepository.save(booking2);

        Booking booking3 = createBooking(
                listings.get("lst-011"),
                guest2,
                LocalDate.of(2024, 11, 20),
                LocalDate.of(2024, 11, 25),
                2,
                new BigDecimal("2475.00"),
                BookingStatus.CHECKED_OUT,
                PaymentStatus.PAID,
                null
        );
        bookingRepository.save(booking3);

        log.info("Created {} bookings", bookingRepository.count());
    }

    private Booking createBooking(Listing listing, User guest, LocalDate checkIn, 
                                 LocalDate checkOut, int guests, BigDecimal totalPrice,
                                 BookingStatus bookingStatus, PaymentStatus paymentStatus,
                                 String specialRequests) {
        int nights = (int) java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
        
        return Booking.builder()
                .publicId(UUID.randomUUID())
                .listingPublicId(listing.getPublicId())
                .guestPublicId(guest.getPublicId())
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .numberOfGuests(guests)
                .numberOfNights(nights)
                .totalPrice(totalPrice)
                .currency("USD")
                .bookingStatus(bookingStatus)
                .paymentStatus(paymentStatus)
                .specialRequests(specialRequests)
                .build();
    }

    private Map<String, ServiceOffering> seedServiceOfferings(Map<String, User> users) {
        log.info("=".repeat(80));
        log.info("🛎️ Starting Service Offerings Seeding Process...");
        log.info("📦 Creating 46 service offerings across 17 categories with images");
        log.info("=".repeat(80));
        
        Map<String, ServiceOffering> services = new HashMap<>();
        
        // Service data: category, title, description, pricingType, basePrice, city, country, provider
        Object[][] serviceData = {
            {ServiceCategory.HOME_CHEF, "Professional Home Chef Service", "Enjoy gourmet meals prepared in your home by experienced chefs. Perfect for dinner parties, meal prep, or special occasions.", PricingType.PER_SESSION, 150.0, "Malibu", "United States", "landlord1"},
            {ServiceCategory.HOME_CHEF, "Italian Cuisine Expert", "Authentic Italian cooking with fresh ingredients. Specializing in pasta, risotto, and traditional Italian desserts.", PricingType.PER_SESSION, 180.0, "New York", "United States", "landlord3"},
            {ServiceCategory.HOME_CHEF, "Asian Fusion Chef", "Modern Asian fusion cuisine combining traditional flavors with contemporary techniques.", PricingType.PER_SESSION, 165.0, "San Francisco", "United States", "landlord40"},
            
            {ServiceCategory.TOUR_GUIDE, "Local City Explorer", "Discover hidden gems and local favorites with an experienced tour guide. Customized tours based on your interests.", PricingType.PER_HOUR, 45.0, "Paris", "France", "landlord5"},
            {ServiceCategory.TOUR_GUIDE, "Historical Walking Tours", "Expert-led walking tours through historic districts with fascinating stories and insider knowledge.", PricingType.PER_PERSON, 35.0, "Charleston", "United States", "landlord39"},
            {ServiceCategory.TOUR_GUIDE, "Adventure Tour Guide", "Exciting outdoor adventures including hiking, kayaking, and wildlife spotting with certified guides.", PricingType.PER_DAY, 200.0, "Queenstown", "New Zealand", "landlord30"},
            
            {ServiceCategory.CAR_RENTAL, "Luxury Vehicle Rental", "Premium car rental service featuring high-end vehicles for special occasions or business needs.", PricingType.PER_DAY, 150.0, "Beverly Hills", "United States", "landlord15"},
            {ServiceCategory.CAR_RENTAL, "SUV and Family Vehicles", "Spacious SUVs perfect for family trips and group travel. Clean, well-maintained vehicles.", PricingType.PER_DAY, 85.0, "Aspen", "United States", "landlord2"},
            {ServiceCategory.CAR_RENTAL, "Eco-Friendly Car Rental", "Electric and hybrid vehicles for environmentally conscious travelers.", PricingType.PER_DAY, 95.0, "Portland", "United States", "landlord33"},
            
            {ServiceCategory.AIRPORT_TRANSFER, "Premium Airport Transfer", "Professional airport pickup and drop-off service with comfortable vehicles and experienced drivers.", PricingType.CUSTOM, 75.0, "Dubai", "United Arab Emirates", "landlord31"},
            {ServiceCategory.AIRPORT_TRANSFER, "Group Airport Shuttle", "Reliable airport transfer service for groups. Spacious vehicles with luggage space.", PricingType.PER_PERSON, 25.0, "Monaco", "Monaco", "landlord32"},
            
            {ServiceCategory.LAUNDRY_SERVICE, "Express Laundry & Dry Cleaning", "Professional laundry and dry cleaning service with same-day delivery available.", PricingType.PER_ITEM, 8.0, "Manhattan", "United States", "landlord3"},
            {ServiceCategory.LAUNDRY_SERVICE, "Eco-Friendly Laundry Service", "Green laundry service using environmentally friendly detergents and processes.", PricingType.PER_ITEM, 10.0, "Ubud", "Indonesia", "landlord4"},
            
            {ServiceCategory.HOUSE_CLEANING, "Professional Deep Cleaning", "Thorough house cleaning service with attention to detail. Licensed and insured cleaners.", PricingType.PER_SESSION, 120.0, "Los Angeles", "United States", "landlord15"},
            {ServiceCategory.HOUSE_CLEANING, "Regular Maintenance Cleaning", "Weekly or bi-weekly cleaning service to keep your space spotless.", PricingType.PER_SESSION, 85.0, "San Francisco", "United States", "landlord40"},
            
            {ServiceCategory.MASSAGE_SPA, "Luxury In-Home Spa Experience", "Premium massage and spa treatments in the comfort of your accommodation. Certified therapists.", PricingType.PER_SESSION, 180.0, "Maldives", "Maldives", "landlord12"},
            {ServiceCategory.MASSAGE_SPA, "Therapeutic Massage Service", "Professional therapeutic massage for relaxation and muscle recovery.", PricingType.PER_HOUR, 95.0, "Santorini", "Greece", "landlord6"},
            {ServiceCategory.MASSAGE_SPA, "Couples Spa Package", "Romantic couples massage and spa treatments. Perfect for special occasions.", PricingType.PER_SESSION, 300.0, "Bali", "Indonesia", "landlord4"},
            
            {ServiceCategory.PHOTOGRAPHY, "Professional Event Photography", "Capture your special moments with professional photography services.", PricingType.PER_HOUR, 125.0, "Paris", "France", "landlord5"},
            {ServiceCategory.PHOTOGRAPHY, "Portrait & Family Photography", "Beautiful portrait sessions for individuals, couples, and families.", PricingType.PER_SESSION, 250.0, "Ibiza", "Spain", "landlord19"},
            {ServiceCategory.PHOTOGRAPHY, "Travel & Adventure Photography", "Document your adventures with professional travel photography.", PricingType.PER_DAY, 450.0, "Iceland", "Iceland", "landlord11"},
            
            {ServiceCategory.EVENT_PLANNING, "Full-Service Event Planning", "Complete event planning and coordination for parties, weddings, and corporate events.", PricingType.CUSTOM, 800.0, "Monaco", "Monaco", "landlord32"},
            {ServiceCategory.EVENT_PLANNING, "Party Decoration & Setup", "Professional party decoration and setup service for all occasions.", PricingType.PER_SESSION, 350.0, "Dubai", "United Arab Emirates", "landlord31"},
            
            {ServiceCategory.BABY_SITTING, "Certified Childcare Provider", "Experienced and certified babysitters for your peace of mind. Background checked.", PricingType.PER_HOUR, 25.0, "New York", "United States", "landlord3"},
            {ServiceCategory.BABY_SITTING, "Evening Babysitting Service", "Reliable evening babysitting so you can enjoy a night out.", PricingType.PER_HOUR, 22.0, "Charleston", "United States", "landlord39"},
            
            {ServiceCategory.PET_CARE, "Professional Pet Sitting", "Loving pet care in your home while you're away. All pets welcome.", PricingType.PER_DAY, 45.0, "Stowe", "United States", "landlord38"},
            {ServiceCategory.PET_CARE, "Dog Walking Service", "Daily dog walking service with flexible schedules. Active and engaging walks.", PricingType.PER_SESSION, 20.0, "Portland", "United States", "landlord33"},
            {ServiceCategory.PET_CARE, "Pet Grooming Service", "Professional pet grooming in your home. Stress-free for your pets.", PricingType.PER_SESSION, 65.0, "San Francisco", "United States", "landlord40"},
            
            {ServiceCategory.GROCERY_DELIVERY, "Fresh Grocery Delivery", "Personal grocery shopping and delivery service. Fresh produce and quality products.", PricingType.CUSTOM, 30.0, "Manhattan", "United States", "landlord3"},
            {ServiceCategory.GROCERY_DELIVERY, "Organic & Local Produce Delivery", "Delivery of organic and locally sourced groceries to your door.", PricingType.CUSTOM, 35.0, "Stowe", "United States", "landlord38"},
            
            {ServiceCategory.PERSONAL_TRAINER, "Personal Fitness Training", "One-on-one fitness training sessions customized to your goals.", PricingType.PER_SESSION, 75.0, "Los Angeles", "United States", "landlord15"},
            {ServiceCategory.PERSONAL_TRAINER, "Group Fitness Classes", "Energetic group fitness classes for all fitness levels.", PricingType.PER_PERSON, 25.0, "Dubai", "United Arab Emirates", "landlord31"},
            {ServiceCategory.PERSONAL_TRAINER, "Outdoor Boot Camp", "High-intensity outdoor training sessions in beautiful locations.", PricingType.PER_SESSION, 65.0, "Big Sur", "United States", "landlord9"},
            
            {ServiceCategory.YOGA_MEDITATION, "Private Yoga Sessions", "Personalized yoga instruction for all levels in your accommodation.", PricingType.PER_SESSION, 80.0, "Bali", "Indonesia", "landlord4"},
            {ServiceCategory.YOGA_MEDITATION, "Meditation & Mindfulness Classes", "Guided meditation and mindfulness practices for relaxation and stress relief.", PricingType.PER_SESSION, 60.0, "Ubud", "Indonesia", "landlord4"},
            {ServiceCategory.YOGA_MEDITATION, "Sunrise Beach Yoga", "Refreshing yoga sessions on the beach at sunrise.", PricingType.PER_SESSION, 70.0, "Phuket", "Thailand", "landlord20"},
            
            {ServiceCategory.LANGUAGE_TUTOR, "English Language Tutoring", "Professional English language instruction for all levels.", PricingType.PER_HOUR, 45.0, "Tokyo", "Japan", "landlord17"},
            {ServiceCategory.LANGUAGE_TUTOR, "French Language Lessons", "Learn French from native speakers with customized lessons.", PricingType.PER_HOUR, 50.0, "Paris", "France", "landlord5"},
            {ServiceCategory.LANGUAGE_TUTOR, "Spanish Conversation Practice", "Improve your Spanish through conversation with experienced tutors.", PricingType.PER_HOUR, 40.0, "Ibiza", "Spain", "landlord19"},
            
            {ServiceCategory.BIKE_RENTAL, "City Bike Rental", "Quality bicycles for exploring the city. Daily and weekly rentals available.", PricingType.PER_DAY, 25.0, "Paris", "France", "landlord5"},
            {ServiceCategory.BIKE_RENTAL, "Mountain Bike Adventures", "High-performance mountain bikes for trail riding and adventures.", PricingType.PER_DAY, 45.0, "Whistler", "Canada", "landlord27"},
            {ServiceCategory.BIKE_RENTAL, "E-Bike Tours", "Electric bicycle rentals for effortless exploration of scenic areas.", PricingType.PER_DAY, 55.0, "Santorini", "Greece", "landlord6"},
            
            {ServiceCategory.EQUIPMENT_RENTAL, "Camping Equipment Rental", "Complete camping gear rental including tents, sleeping bags, and cooking equipment.", PricingType.PER_DAY, 35.0, "Yosemite", "United States", "landlord29"},
            {ServiceCategory.EQUIPMENT_RENTAL, "Water Sports Equipment", "Kayaks, paddleboards, and snorkeling gear for water adventures.", PricingType.PER_DAY, 40.0, "Bahamas", "Bahamas", "landlord21"},
            {ServiceCategory.EQUIPMENT_RENTAL, "Winter Sports Equipment", "Ski and snowboard rentals with latest equipment.", PricingType.PER_DAY, 50.0, "Chamonix", "France", "landlord28"}
        };
        
        int serviceCounter = 1;
        ServiceCategory lastCategory = null;
        for (Object[] data : serviceData) {
            ServiceCategory category = (ServiceCategory) data[0];
            String title = (String) data[1];
            String description = (String) data[2];
            PricingType pricingType = (PricingType) data[3];
            Double basePrice = (Double) data[4];
            String city = (String) data[5];
            String country = (String) data[6];
            String providerKey = (String) data[7];
            
            // Log category change
            if (lastCategory != category) {
                log.info("📝 Creating {} services...", category);
                lastCategory = category;
            }
            
            User provider = users.get(providerKey);
            
            ServiceOffering service = ServiceOffering.builder()
                    .publicId(UUID.randomUUID().toString())
                    .category(category)
                    .status(ServiceStatus.ACTIVE)
                    .providerPublicId(provider.getPublicId().toString())
                    .title(title)
                    .description(description)
                    .pricingType(pricingType)
                    .basePrice(new BigDecimal(basePrice))
                    .city(city)
                    .country(country)
                    .isActive(true)
                    .isInstantBooking(true)
                    .availableDays(Arrays.asList("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"))
                    .build();
            
            service = serviceOfferingRepository.save(service);
            
            // Add service images based on category
            String categoryPrefix = category.name().toLowerCase().replace("_", "-");
            for (int i = 1; i <= 3; i++) {
                ServiceImage image = ServiceImage.builder()
                        .serviceOffering(service)
                        .imageUrl("/images/services/" + categoryPrefix + "-" + i + ".jpg")
                        .caption(title + " - Image " + i)
                        .isPrimary(i == 1)
                        .displayOrder(i)
                        .build();
                serviceImageRepository.save(image);
            }
            
            services.put("service-" + serviceCounter++, service);
            
            // Log progress every 10 services
            if (serviceCounter % 10 == 1 && serviceCounter > 1) {
                log.info("⏳ Progress: {} services created so far...", serviceCounter - 1);
            }
        }
        
        log.info("=".repeat(80));
        log.info("✅ SERVICE OFFERINGS SEEDING COMPLETED!");
        log.info("📊 Summary: {} service offerings created with {} service images", services.size(), services.size() * 3);
        log.info("🎉 All service offerings are now ACTIVE and available for booking!");
        log.info("=".repeat(80));
        return services;
    }
}
