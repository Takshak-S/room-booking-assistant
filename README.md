# Room Booking Assistant

A comprehensive, event-oriented room booking system designed for university environments. This application allows students and faculty to book classrooms, laboratories, auditoriums, and sports facilities with an integrated admin override system for high-priority bookings.

## 🚀 Features

- **Department-based Authentication**: Secure login via Clerk, restricting access to university domains.
- **Smart Resource Searching**: Filter rooms by type, capacity, amenities, and real-time availability.
- **Advanced Booking System**: 
  - Real-time availability checks.
  - Conflict detection.
  - **Admin Override**: Faculty can request overrides for already booked slots, subject to admin approval.
- **Role-based Dashboards**:
  - **Student/Faculty**: Book rooms, view history, and manage profiles.
  - **Admin**: Approve new users, manage resource occupancy, and handle override requests.
- **Modern UI**: Dark-themed, responsive interface built with Framer Motion and Lucide icons.

## 🛠 Tech Stack

- **Frontend**: React, Vite, Framer Motion, Tailwind CSS, Lucide React, Clerk (Auth).
- **Backend**: Node.js, Express, MongoDB (Mongoose), Clerk Express SDK.

## 📦 Project Structure

```text
room-booking-assistant/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page-level components (Dashboard, Home, etc.)
│   │   ├── lib/         # Configuration and utilities
│   │   └── context/     # Auth and Theme contexts
├── server/              # Express backend
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── models/      # Mongoose schemas
│   │   ├── middleware/  # Auth and validation middleware
│   │   └── index.js     # Server entry point
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Clerk account

### 1. Backend Setup
1. Navigate to the `server` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with:
   ```env
   MONGODB_URI=your_mongodb_uri
   CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   ```
4. Seed initial resources (optional):
   ```bash
   npm run seed
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the `client` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key
   VITE_API_BASE_URL=http://localhost:5000
   ```
4. Start the app:
   ```bash
   npm run dev
   ```

## 🛡 Security Note
- The application uses Clerk for secure authentication.
- All API routes are protected by a middleware that verifies the Clerk session and fetches the associated database user.
- **Environment Variables**: Never commit your `.env` files. Ensure they are correctly set in your production host.
- **CORS**: You can restrict access to your production frontend by setting the `ALLOWED_ORIGIN` environment variable in your backend (e.g., `ALLOWED_ORIGIN=https://your-app.vercel.app`). If not set, it defaults to `*` for development.