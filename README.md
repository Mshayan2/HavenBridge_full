# HavenBridge

HavenBridge is a full-stack real estate marketplace built for property sales, reservations, rentals, and admin operations. The project combines a React + Vite frontend with an Express + MongoDB backend and includes customer flows, seller tools, admin management, messaging, favorites, saved searches, notifications, and payment integrations.

## Project Overview

This repository is split into two main apps:

- `HavenBridge/` - React frontend
- `backend/` - Express API server

The platform supports:

- Public property browsing with filters, facets, featured listings, and geo-aware data
- Property detail pages with reservation policy support
- Customer property submission with photo/document uploads
- User authentication with email verification and password reset
- Favorites, saved searches, notifications, profile editing, and messaging
- Booking, reservation, lease, and payment flows
- Seller Stripe Connect onboarding
- Admin dashboards for properties, bookings, users, payments, reports, activity, and settings
- Background jobs for reservation expiry and saved-search alerts

## Tech Stack

### Frontend

- React 19
- Vite 7
- React Router 7
- Tailwind CSS 4
- Leaflet + React Leaflet

### Backend

- Node.js
- Express 5
- MongoDB + Mongoose
- JWT authentication
- Multer uploads
- Nodemailer
- Stripe
- EasyPaisa and JazzCash integrations

## Repository Structure

```text
.
|-- README.md
|-- HavenBridge/
|   |-- src/
|   |   |-- api/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- contexts/
|   |   `-- pages/
|   |-- public/
|   `-- package.json
`-- backend/
    |-- config/
    |-- controllers/
    |-- jobs/
    |-- middlewares/
    |-- models/
    |-- routes/
    |-- scripts/
    |-- tests/
    `-- package.json
```

## Main Frontend Pages

- Home, About, Contact
- Properties listing and property detail
- Sell Property submission flow
- Sign in, Sign up, email verification, forgot/reset password
- Profile and profile edit
- My Listings, My Bookings, My Reservations, Favorites, Saved Searches
- Messages, Notifications, Leases
- Seller bookings and seller Stripe onboarding screens
- Payment success/cancel flows
- Admin dashboard, properties, bookings, payments, users, reports, activity, settings

## Main Backend Modules

- `auth` - registration, login, profile, email verification, password reset
- `properties` - listing CRUD, public filtering, facets, approval workflow, reservation/rental policy
- `bookings` - booking lifecycle
- `reservations` - reservation holds and timing windows
- `payments` - Stripe checkout, Stripe webhooks, seller payouts, manual payments, EasyPaisa, JazzCash
- `leases` - rental agreement and installment support
- `messages` - user conversations
- `favorites` - saved property wishlist
- `saved-searches` - persisted searches with alert jobs
- `notifications` - in-app notification feed
- `contact` - contact form endpoint
- `news` - news feed proxy support

## Local Setup

### 1. Install dependencies

Frontend:

```bash
cd HavenBridge
npm install
```

Backend:

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create `backend/.env` from `backend/.env.example`.

Common backend variables:

```env
PORT=5000
HOST=0.0.0.0
NODE_ENV=development
JWT_SECRET=change_me
FRONTEND_BASE_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
```

Useful optional variables:

```env
MONGO_USE_MEMORY=true
MONGO_USE_FALLBACK=true
MONGO_FALLBACK_URI=mongodb://127.0.0.1:27017/realestate

MAIL_MODE=
SMTP_SERVICE=gmail
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your_app_password
SMTP_SECURE=true
SMTP_FROM="HavenBridge <yourgmail@gmail.com>"

REQUIRE_PROPERTY_APPROVAL=false
ENABLE_LISTING_CACHE=false

PAYMENT_CURRENCY=pkr
BOOKING_TOKEN_AMOUNT=500000
PLATFORM_FEE_BPS=500
RESERVATION_DURATION_HOURS=48
PAYMENT_PROVIDERS_ENABLED=stripe,easypaisa,jazzcash

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_CONNECT_REFRESH_URL=http://localhost:5173/seller/stripe/refresh
STRIPE_CONNECT_RETURN_URL=http://localhost:5173/seller/stripe/return
STRIPE_DEFAULT_COUNTRY=PK

EASYPAYSA_ENV=sandbox
EASYPAYSA_MERCHANT_ID=your_id
EASYPAYSA_MERCHANT_KEY=your_key
EASYPAYSA_CALLBACK_SECRET=your_secret

JAZZCASH_ENV=sandbox
JAZZCASH_MERCHANT_ID=your_id
JAZZCASH_PASSWORD=your_password
JAZZCASH_INTEGRITY_SALT=your_salt
```

Frontend optional variable:

```env
VITE_API_BASE=http://localhost:5000/api
```

### 3. Run the apps

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd HavenBridge
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## Available Scripts

### Frontend

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

### Backend

- `npm run dev`
- `npm start`
- `npm test`
- `npm run seed:admin`
- `npm run migrate:reservation-indexes`
- `npm run migrate:legacy-email-verified`

## Authentication and Roles

The app uses JWT-based authentication with these roles:

- `customer`
- `staff`
- `admin`

Auth capabilities include registration, login, protected profile endpoints, email verification, resend verification, forgot password, and reset password.

## Property Workflow

HavenBridge supports both sale and rental listings.

- Admin/staff can create and manage listings directly
- Customers can submit listings through the sell flow
- Uploaded photos and documents are stored in `backend/uploads`
- Submitted listings can be approved or rejected by admin/staff
- Public listing pages support filtering, pagination, sorting, map use, and facets
- Geo coordinates are supported for proximity and map-based browsing

## Payments and Reservation Flow

The backend supports:

- Stripe Checkout for booking token payments
- Stripe webhook handling
- Stripe Connect onboarding for sellers
- Admin release of Stripe payments to sellers
- Manual payment recording
- EasyPaisa payment creation and webhook handling
- JazzCash payment creation and webhook handling

Reservation and rental logic includes reservation fees, remaining balances, reservation expiry windows, lease deposit/rent installments, and ledger tracking for money movements.

## Background Jobs

The backend starts:

- reservation expiry job
- saved search alerts job

## Tests

Backend tests are in `backend/tests/` and cover:

- auth email verification and reset
- rental property submission
- lease controller behavior
- EasyPaisa create/webhook flows
- JazzCash payment flow

Run tests with:

```bash
cd backend
npm test
```

## API Base Routes

The backend mounts these route groups under `/api`:

- `/auth`
- `/properties`
- `/bookings`
- `/reservations`
- `/favorites`
- `/saved-searches`
- `/users`
- `/payments`
- `/notifications`
- `/news`
- `/contact`
- `/messages`
- `/leases`
- `/test`

## Notes for Development

- The backend can auto-seed sample data when the database is empty
- In development, missing Stripe config does not crash the server
- Uploaded assets are served from `/uploads`
- The current defaults are Pakistan-oriented for payments and reservation behavior

## License

No license file is currently included in this repository.
