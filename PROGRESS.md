# 🚌 Bus Booking System — Comprehensive Progress Notes

This document provides a detailed, phase-by-phase summary of all architectural decisions, backend logic, and frontend UI completed in the project so far.

---

## 📌 Phase 1: Setup & UI Foundation
**Goal:** Establish the repository, define the architecture, and create the visual shell.
- **Tech Stack Initialized:** React 18 (Vite), Tailwind CSS v3, Express, Sequelize (MySQL).
- **Architecture Defined:** MVC (Model-View-Controller) pattern with a dedicated `services/` layer for business logic.
- **Frontend Foundations:**
  - Configured React Router.
  - Built core layouts: `Navbar` (dynamic based on login state) and `Footer`.
  - Built the initial static screens for `Home`, `Login`, and `Register`.

---

## 🔐 Phase 2: Core Authentication
**Goal:** Connect the frontend to a secure backend user management system.
- **Database & Models:** Created the `User` model utilizing Sequelize. Implemented `bcrypt` for secure password hashing before saving to the DB.
- **Backend API:** Built `auth.controller.js` and `auth.service.js` for Registration, Login, and fetching the Current User profile (`/me`).
- **Frontend Integration:** 
  - Created `AuthContext.jsx` to manage global user state.
  - Configured an `axios` instance (`api.js`) to automatically attach authorization tokens to API requests.

---

## 🚌 Phase 3: Admin Dashboard & Bus Management
**Goal:** Allow administrators to add and manage the physical buses and their routes.
- **Standardization:** Introduced `ApiError` and `ApiResponse` utilities alongside a global `error.middleware.js` to ensure all API responses follow a strict, predictable JSON format.
- **Bus Model:** Created the `Bus` model. **Crucial Design Choice:** We opted to store the multi-city route as a dynamic JSON array directly on the Bus table (e.g., `["Mumbai", "Pune", "Bangalore"]`) to keep the database schema clean and avoid overly complex junction tables.
- **Backend API:** Built full CRUD operations (Create, Read, Delete) for Buses, protected by an `authorize('admin')` middleware.
- **Frontend UI:** Built the `AdminDashboard` page where admins can view a table of active buses and use a form to add new ones.

---

## 🔍 Phase 4: Trip Scheduling & Search Engine
**Goal:** Allow admins to schedule buses for specific dates/times, and allow users to search for them.
- **Trip Model:** Created the `Trip` model (Foreign Key to `Bus`) which holds the `date`, `departureTime`, `estimatedArrivalTime`, and `basePrice`.
- **The Search Algorithm:** 
  - Implemented an intelligent search function in `trip.service.js`. 
  - It fetches all trips for a specific date, pulls in the attached Bus, and scans the JSON `route` array.
  - **Directional Logic:** It strictly ensures that both the `origin` and `destination` exist on the route, AND that the `origin` appears *before* the `destination` in the array (so a bus going from Mumbai to Pune cannot be booked for a Pune to Mumbai search).
- **Frontend UI:** 
  - Upgraded the Admin Dashboard to include a Trip Scheduling form.
  - Built the `SearchBar` on the Home page.
  - Built the `SearchResults` page to dynamically map over the API response and display beautiful, interactive **Trip Cards**.

---

## 🛡️ Special Architectural Overhaul: Access & Refresh Tokens
**Goal:** Upgrade the authentication system to enterprise-level security.
- **Token Rotation:** We replaced the basic JWT system with a dual-token architecture.
  - **Access Token:** Short-lived (15 mins), stored in React memory/localStorage, used for rapid API authorization.
  - **Refresh Token:** Long-lived (7 days), strictly securely as an `httpOnly`, `sameSite` cookie. Impervious to XSS attacks.
- **Database Tracking:** Added a `refreshToken` column to the `User` model. This allows us to track active sessions and instantly revoke access (logout) server-side.
- **Silent Refresh Interceptor:** Upgraded the frontend `axios` interceptor. If a user's Access Token expires and the API throws a `401 Unauthorized`, the interceptor catches it, pauses the request, silently hits the `/api/auth/refresh-token` endpoint using the secure cookie to get a *new* Access Token, and seamlessly retries the original request without the user ever noticing.

---

## 💺 Phase 5: Interactive Seat Selection & Availability
**Goal:** Allow users to view a real-time layout of the bus seats and select their desired spots, preventing double-bookings.
- **Booking Model:** Created a `Booking` model to act as the ultimate source of truth for seat reservations. It links a `User` to a `Trip` and stores `seatNumbers` as a JSON array alongside a `status` (pending, confirmed, cancelled).
- **Availability Algorithm:** 
  - Created a highly optimized `GET /api/trips/:id/seats` API endpoint.
  - When a user views a trip, the backend fetches the `Trip`, determines the total `Bus` capacity, and aggregates the `seatNumbers` from *all* confirmed bookings into a single array of unavailable seats.
  - This architecture completely prevents race conditions where two users might try to book the exact same seat simultaneously.
- **Frontend UI & Premium Redesign (`SeatSelection.jsx`):** 
  - Added a "View Seats" button to the Trip Cards.
  - Built a dynamic seat map simulating a real bus layout with a sophisticated multi-deck UI.
  - **Lower Deck (Seater):** Ordered left-to-right rows (`Seat 1, Seat 2, Aisle, Seat 3, Seat 4`), complete with realistic CSS armrests, headrest shadows, and vibrant gradients.
  - **Upper Deck (Sleeper):** Distinguished wide beds with pillow indicators and a purple color theme.
  - Added a **Booking Cart** panel that dynamically recalculates the total price in real-time, charging a 1.5x premium rate for sleeper seats.

---

## 🎟️ Phase 6: The Booking Flow & User Dashboard
**Goal:** Lock in the user's seat selection, generate the final invoice, process the reservation, and allow users to view their booking history.
- **The Booking Intent Lifecycle:**
  - When a user clicks *Proceed to Checkout* on the seat map, the application saves their `selectedSeats`, `origin`, and `destination` in the browser's `localStorage`.
  - **Why?** If the user is unauthenticated, they are redirected to `/login`. By saving the "intent", they can seamlessly resume their checkout flow immediately after logging in without losing their selected seats.
- **Checkout Flow (`BookingPage.jsx`):**
  - Reads the stored intent, fetches the trip details, and renders a final summary/invoice of the journey.
- **Backend Transaction Engine (`POST /api/bookings`):**
  - **Race Condition Protection:** Before finalizing the booking, the backend makes a real-time query to fetch all existing confirmed bookings for that trip. It flattens the arrays and double-checks if the requested seats were snatched up milliseconds prior. If there's a collision, it throws a `409 Conflict`.
  - If clear, the booking is instantly saved with a `confirmed` status.
- **User Dashboard (`MyBookings.jsx`):**
  - A dedicated page allowing users to view their past and upcoming trips.
  - Displays beautiful booking cards showing bus details, dates, selected seats, total amount paid, and visual status badges.
  - Powered by a new `GET /api/bookings/my-bookings` endpoint that joins `Booking` data with `Trip` and `Bus` models.

---

### **Current Status:**
All infrastructure for Users, Buses, Trips, real-time Seat Availability, UI rendering, and the complete Booking Flow is fully operational.

**Next Immediate Goal (Phase 7):** Razorpay Payment Integration! 
We will shift the booking flow from instantly "confirmed" to "pending". When a user clicks checkout, a Razorpay modal will open. The backend will use secure Webhooks to listen for payment success, and only then will the booking status be switched to `confirmed` and the seats officially locked.
