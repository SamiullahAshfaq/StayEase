# StayEase

StayEase is a full-stack web application designed to be a comprehensive platform for property rentals, similar to Airbnb. It allows users to list properties, search for accommodations, book stays, and manage their profiles. The platform also includes features for payments, reviews, real-time chat, and an admin dashboard for site management.

## Key Features

### User and Authentication
- **User Registration & Login**: Secure user account creation and authentication.
- **Role-based Access Control**: Differentiates between regular users, property owners (landlords), and administrators.
- **Profile Management**: Users can view and edit their profiles.

### Property Listings
- **Create & Manage Listings**: Property owners can create, update, and manage their property listings with images and details.
- **Search & Filter**: Users can search for listings with various filters.
- **View Listing Details**: Detailed view for each property including images, description, price, and availability.

### Bookings
- **Booking System**: Users can book available properties for specific dates.
- **Booking Management**: Users can view their booking history and details.

### Payments
- **Secure Payments**: Integration with Stripe for handling payments for bookings.
- **Payouts**: System for property owners to receive payouts.

### Communication
- **Real-time Chat**: A messaging system for users to communicate with property owners.
- **Notifications**: A notification system to keep users updated on bookings and other activities.

### Reviews and Ratings
- **Property Reviews**: Users can leave reviews and ratings for properties they have stayed at.

### Administration
- **Admin Dashboard**: A dedicated interface for administrators to manage the platform.
- **User Management**: Admins can manage user accounts.
- **Audit Logs**: Tracks administrative actions for security and monitoring.

## Technical Stack

### Backend
- **Language**: Java
- **Framework**: Spring Boot
- **Database**: SQL database with Liquibase for schema management.
- **Authentication**: Spring Security with JWT and OAuth2.
- **API**: RESTful API for communication with the frontend.

### Frontend
- **Framework**: Angular
- **Language**: TypeScript
- **Styling**: CSS
- **State Management**: Angular services.
- **API Communication**: RESTful API consumption via Angular's HttpClient.

### DevOps
- **Containerization**: Docker with `docker-compose.yml` for local development setup.
- **Build Tool**: Maven for the backend, npm for the frontend.
- **CI/CD**: The project is structured to support CI/CD pipelines.
