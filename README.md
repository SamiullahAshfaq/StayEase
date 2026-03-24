#STAYEASE

STAYEASE is a full-stack property rental and management platform designed to simplify booking, communication, and service management between users, landlords, and administrators. It provides a seamless experience for property listings, booking management, chat, payments, notifications, reviews, and service offerings.

Features
User Features
User registration, login, and profile management
Browse and search property listings
View detailed property information and images
Make bookings and view booking history
Real-time chat with landlords
Leave and view reviews
Payment integration with Stripe
Receive notifications for bookings, payments, and updates
Landlord Features
Manage property listings (create, edit, delete)
View booking requests and history
Manage additional service offerings
Access dashboard with key statistics
Receive notifications for user actions and bookings
Admin Features
Admin dashboard with analytics and KPIs
User and landlord management
Audit logs for tracking actions
Booking and listing management
Review moderation
Tech Stack

Backend:

Java 11+ with Spring Boot
Spring Security with JWT authentication
Hibernate & JPA for database interaction
PostgreSQL (or any relational database)
Docker for containerization
Flyway for database migrations

Frontend:

Angular 15+
Tailwind CSS for styling
TypeScript and SCSS for component styling
Feature-based modular structure for scalability
Project Structure
Backend
src/main/java/com/stayease/ – Main application code
Domain modules: admin, booking, chat, listing, notification, payment, review, serviceoffering, user
Shared utilities: dto, mapper, util, constants
Security: JWT, filters, authentication
Exception handling: Global and domain-specific exceptions
Frontend
src/app/ – Angular modules organized by features
Core: Auth, API services, guards, interceptors
Shared components: Header, Footer, Date-picker, Image upload
Layouts: Admin layout, Main layout
Public assets: Images and static files
Getting Started
Prerequisites
Java 11+
Node.js 18+ and npm
Angular CLI 15+
Docker (optional, for containerized setup)
Backend Setup
Clone the repository:
git clone <repository-url>
cd backend
Configure your environment variables (env.bat or .env)
Build and run the backend using Maven:
./mvnw clean install
./mvnw spring-boot:run
Database migrations will run automatically via Flyway
Frontend Setup
Navigate to frontend folder:
cd frontend
Install dependencies:
npm install
Run the Angular application:
ng serve
Visit http://localhost:4200 to see the application
License

This project is licensed under the MIT License.
