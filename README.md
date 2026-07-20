# SkillSphere — Intelligent Hyperlocal Freelance Ecosystem

A full-stack MERN freelance marketplace connecting clients with freelancers. Built as part of the Nayoda Full Stack Development Internship.

🌐 **Live Demo**: [skillsphere-red.vercel.app](https://skillsphere-red.vercel.app)
🔧 **API**: [skillsphere-api-f9e5.onrender.com](https://skillsphere-api-f9e5.onrender.com)
📦 **Repository**: [github.com/prataparyan/skillsphere](https://github.com/prataparyan/skillsphere)

---

## Features

### Authentication
- JWT-based authentication with role-based access control
- Three roles: Client, Freelancer, Admin
- Secure password hashing with bcrypt
- Protected routes on both frontend and backend

### Gig Marketplace
- Clients can post gigs with budget ranges, deadlines, and required skills
- Freelancers can browse and filter gigs by category
- Full-text search with MongoDB indexes
- Pagination support

### Proposal System
- Freelancers submit proposals with cover letter, bid amount, and timeline
- Clients review proposals and accept/reject with one click
- Accepted proposals automatically update gig status to "in-progress"
- Duplicate proposal prevention

### Real-Time Chat
- Instant messaging using Socket.IO
- Persistent message history stored in MongoDB
- Clients and freelancers can communicate directly from gig pages

### Payment Integration
- Razorpay payment gateway integration
- Secure payment verification using HMAC SHA256 signature
- Automatic gig completion after successful payment
- Payment history tracking per user

### Notifications
- Real-time notification bell with unread count badge
- Notifications for proposal received, accepted, and rejected
- Payment received notifications for freelancers
- Click-to-navigate from notification to relevant gig

### Admin Dashboard
- Platform statistics (total users, gigs, proposals)
- User management with suspend/activate functionality
- Gig overview with status tracking
- Role-based access (admin only)

### Reviews & Ratings
- Clients can review freelancers after project completion
- Average rating calculation
- Verified reviews tied to completed gigs

---

## Tech Stack

### Frontend
- React 19 + Vite
- Tailwind CSS v4
- React Router v6
- Axios (with request interceptors for JWT)
- Socket.IO Client
- React Context API for global state

### Backend
- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Socket.IO for real-time features
- express-validator for input validation
- Razorpay payment gateway

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas (M0 Free Tier)

---

## Project Structure

SkillSphere/
├── client/                  # React frontend
│   ├── src/
│   │   ├── api/             # Axios configuration
│   │   ├── components/      # Reusable UI components
│   │   │   ├── common/      # ProtectedRoute
│   │   │   └── layout/      # Shared Navbar
│   │   ├── context/         # AuthContext (global auth state)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components by feature
│   │   │   ├── auth/        # Login, Register
│   │   │   ├── dashboard/   # Client/Freelancer dashboard
│   │   │   ├── gigs/        # GigList, GigDetail, CreateGig
│   │   │   ├── chat/        # Real-time chat
│   │   │   └── admin/       # Admin dashboard
│   │   └── utils/           # Helper functions
│   └── vercel.json          # Vercel routing config
│
└── server/                  # Express backend
├── config/              # Database connection
├── controllers/         # Route handlers
├── middleware/          # Auth middleware, role checks
├── models/              # Mongoose schemas
└── routes/              # API route definitions

---

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login user | No |
| GET | /api/auth/me | Get current user | Yes |

### Gigs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/gigs | Get all gigs (with filters) | No |
| POST | /api/gigs | Create a gig | Client |
| GET | /api/gigs/:id | Get single gig | No |
| PUT | /api/gigs/:id | Update gig | Client (owner) |
| DELETE | /api/gigs/:id | Delete gig | Client (owner) |
| GET | /api/gigs/my-gigs | Get my gigs | Client |

### Proposals
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/proposals | Submit proposal | Freelancer |
| GET | /api/proposals/gig/:gigId | Get gig proposals | Client |
| PUT | /api/proposals/:id/status | Accept/Reject | Client |
| GET | /api/proposals/my-proposals | Get my proposals | Freelancer |

### Messages
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/messages/:userId | Get conversation | Yes |
| GET | /api/messages/conversations | Get all conversations | Yes |

### Payments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/payments/create-order | Create Razorpay order | Client |
| POST | /api/payments/verify | Verify payment signature | Client |
| GET | /api/payments/my-payments | Payment history | Yes |

### Notifications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/notifications | Get all notifications | Yes |
| GET | /api/notifications/unread-count | Get unread count | Yes |
| PUT | /api/notifications/mark-read | Mark all as read | Yes |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/stats | Platform statistics | Admin |
| GET | /api/admin/users | All users | Admin |
| PUT | /api/admin/users/:id/toggle-status | Suspend/Activate | Admin |
| GET | /api/admin/gigs | All gigs | Admin |

---

## Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Razorpay account (test mode)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/prataparyan/skillsphere.git
cd skillsphere

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

Create `server/.env`:

PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

Create `client/.env`:

VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

### Running Locally

```bash
# Start backend (from /server)
npm run dev

# Start frontend (from /client)
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@skillsphere.com | admin123 |
| Client | rahul@demo.com | Demo@1234 |
| Client | client@demo.com | Demo@1234 |
| Freelancer | priya@demo.com | Demo@1234 |
| Freelancer | rohan@demo.com | Demo@1234 |

> ⚠️ Note: The backend is hosted on Render free tier and may take 30-50 seconds to wake up after inactivity. Please wait for the first request to complete.

---

## Test Payment

Use these Razorpay test card details to simulate a payment:

Card Number: 5104 0155 5555 5558
Expiry: 12/26
CVV: 123
OTP: 1234 (if prompted)

---

## Developer

**Aryan Pratap Singh**  
Full Stack Development Intern — Nayoda  
GitHub: [@prataparyan](https://github.com/prataparyan)