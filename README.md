# Appointy — Clinical Operations & Healthcare Appointment Platform

Appointy is a production-grade, 3-tier healthcare management platform engineered to streamline clinical scheduling, consultation management, and role-segregated healthcare administration. Built on a decoupled MERN architecture, Appointy bridges patient discovery with clinical workflows through a high-concurrency booking engine, multi-role JWT authentication, and atomic payment settlement.

---

## 🌐 Live Deployments & Showcase

| Service | Environment | Live URL | Platform |
| :--- | :--- | :--- | :--- |
| **Patient Portal** | Production | [https://appointymern.vercel.app](https://appointymern.vercel.app) | Vercel Edge Network |
| **Admin & Doctor Portal** | Production | [https://appointymern-admin.vercel.app](https://appointymern-admin.vercel.app) | Vercel Edge Network |
| **Core REST API** | Production | [https://appointy-93nj.onrender.com](https://appointy-93nj.onrender.com) | Render Web Service |
| **Launch Video Showcase** | Product Launch | [Watch Demo Video](#-product-launch-showcase) | `/brag` Automated Pipeline |

---

## 🏗️ System Architecture & Engineering Highlights

```
                       +-----------------------------------+
                       |        Client Interfaces          |
                       |  (React 19 + Vite + Tailwind CSS)  |
                       +-----------------+-----------------+
                                         |
                       +-----------------+-----------------+
                       |                                   |
         +-------------v-------------+       +-------------v-------------+
         |      Patient Frontend     |       |    Admin / Doctor Portal  |
         |  (appointymern.vercel.app)|       |(appointymern-admin.vercel)|
         +-------------+-------------+       +-------------+-------------+
                       |                                   |
                       +-----------------+-----------------+
                                         |  HTTPS / REST / JSON
                                         v
                       +-----------------------------------+
                       |       Node.js / Express API       |
                       |    (appointy-93nj.onrender.com)   |
                       +-----------------+-----------------+
                                         |
     +-------------------+---------------+-------------------+
     |                   |                                   |
+----v-----+       +-----v------+                     +------v-----+
| MongoDB  |       | Cloudinary |                     |  Razorpay  |
|  Atlas   |       |  Media CDN |                     |  Checkout  |
+----------+       +------------+                     +------------+
```

### 1. Decoupled 3-Tier Architecture
- **Distributed Micro-Frontends**: The patient booking application and clinical management console run as completely decoupled Single Page Applications (SPAs) on Vercel. Both communicate over secured CORS boundaries with an Express backend hosted on Render.
- **SPA Rewrite Guardrails**: Pre-configured rewrites (`vercel.json`) ensure deep links across nested routes (`/my-appointments`, `/doctor-dashboard`, `/all-doctors`) resolve directly to `/index.html` without routing collisions or 404s.

### 2. Multi-Role Stateless Access Control (RBAC)
Security boundaries are enforced via separate stateless JSON Web Token (JWT) verification middlewares operating across discrete token spaces:
- **`authUser` (`token`)**: Validates patient sessions, decrypts user claims, and injects `req.body.userId` into downstream appointment and profile handlers.
- **`authDoctor` (`dToken`)**: Authenticates clinical practitioners to manage appointment availability, record consultation outcomes, and inspect earnings analytics.
- **`authAdmin` (`aToken`)**: Gates operational endpoints (adding doctors, overriding schedules, global booking audit) against salted administrator credentials.

### 3. Date-Indexed `slots_booked` Conflict Resolution
- **Atomic Double-Booking Prevention**: Doctors maintain a date-partitioned slot matrix (`slots_booked: { [slotDate]: [slotTime] }`). When an appointment is requested, the booking pipeline performs an atomic availability lookup against the requested 7-day rolling calendar window before locking the slot.
- **Immutable Appointment Snapshots**: Rather than storing volatile foreign keys, each appointment record embeds deep snapshots (`userData` and `docData`) capturing patient identity, medical details, fees, and doctor specialty at the exact timestamp of booking. Cancellation releases the slot lock back into the doctor's available pool immediately.

### 4. Server-Verified Financial Settlement & Media Pipeline
- **Two-Step Razorpay Verification**: Payment flows initiate via backend order generation (`razorpay.orders.create`), returning signed order metadata to the frontend. Upon completion, the backend directly fetches the verified order state (`razorpay.orders.fetch(orderId)`) before committing `payment: true` to the ledger.
- **Multer Memory Buffer to Cloudinary CDN**: Doctor onboarding and profile updates stream multipart form data through Multer memory storage directly to Cloudinary v2, eliminating ephemeral server disk writes and serving responsive WebP assets globally.

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Applications** | React 19, Vite, Tailwind CSS, React Router DOM v6, Axios, React Toastify |
| **Backend API** | Node.js (ES Modules), Express.js 5.x, CORS, Dotenv |
| **Database & ORM** | MongoDB Atlas, Mongoose 8.x |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), Bcrypt password hashing, Validator |
| **Media & Payments** | Cloudinary SDK v2, Multer, Razorpay Node SDK |
| **Deployment & CI** | Vercel (Edge CDN, SPA Rewrites), Render (Container runtime), GitHub |

---

## ⚙️ Environment Variables Reference

All credentials and environment variables must be configured before running the platform. **Never commit actual secrets to version control.**

### Backend (`Appointy/backend/.env`)

```env
# Database
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net"
PORT=4000

# Authentication
JWT_SECRET="<your-secure-random-jwt-secret>"
ADMIN_EMAIL="admin@appointy.com"
ADMIN_PASSWORD="<your-secure-admin-password>"

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID="rzp_test_<your_key_id>"
RAZORPAY_KEY_SECRET="<your_razorpay_secret>"
CURRENCY="INR"

# Cloud Media Storage (Cloudinary)
CLOUDINARY_NAME="<your_cloudinary_cloud_name>"
CLOUDINARY_API_KEY="<your_cloudinary_api_key>"
CLOUDINARY_SECRET_KEY="<your_cloudinary_secret_key>"
```

### Patient Frontend (`Appointy/frontend/.env`)

```env
VITE_BACKEND_URL="https://your-api.onrender.com"
VITE_RAZORPAY_KEY_ID="rzp_test_<your_key_id>"
VITE_CURRENCY="₹"
```

### Admin & Doctor Frontend (`Appointy/admin/.env`)

```env
VITE_BACKEND_URL="https://your-api.onrender.com"
VITE_CURRENCY="₹"
```

---

## 🚀 Local Setup & Deployment Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- MongoDB Atlas cluster (with IP `0.0.0.0/0` whitelisted for dynamic cloud access)
- Cloudinary and Razorpay developer accounts

### 1. Local Development Setup

#### Clone & Install Dependencies
```bash
git clone https://github.com/krishbhanushali1/Appointy.git
cd Appointy

# Install backend dependencies
cd backend && npm install

# Install patient frontend dependencies
cd ../frontend && npm install

# Install admin/doctor frontend dependencies
cd ../admin && npm install
```

#### Run Services Locally
Open three terminal instances:

```bash
# Terminal 1 - Backend Server (runs on http://localhost:4000)
cd Appointy/backend
npm run server

# Terminal 2 - Patient Portal (runs on http://localhost:5173)
cd Appointy/frontend
npm run dev

# Terminal 3 - Admin / Doctor Portal (runs on http://localhost:5174)
cd Appointy/admin
npm run dev
```

---

### 2. Cloud Deployment Guide

#### Backend (Render)
1. Link the repository to a new **Web Service** on Render.
2. Configure service parameters:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
3. Add all backend environment variables under **Environment**.
4. In **MongoDB Atlas > Network Access**, ensure `0.0.0.0/0` (Allow from Anywhere) is active.

#### Frontends (Vercel)
1. Import the repository twice into Vercel:
   - **Project 1 (`appointy-frontend`)**: Root directory set to `frontend`, framework preset `Vite`.
   - **Project 2 (`appointy-admin`)**: Root directory set to `admin`, framework preset `Vite`.
2. Configure project environment variables (`VITE_BACKEND_URL`, `VITE_RAZORPAY_KEY_ID`, `VITE_CURRENCY`).
3. Deploy. Both applications will automatically read their `vercel.json` rewrite configuration.

---

## 🎥 Product Launch Showcase

Appointy includes an automated product showcase and video storyboard generated via `/brag` using Hyperframes and multi-track audio compositing:

- **Launch Video**: `brag-output/brag.mp4` *(1080x1920 portrait launch reel featuring key clinical workflows, double-booking prevention, and instant checkout)*
- **Live Patient Experience**: [https://appointymern.vercel.app](https://appointymern.vercel.app)
- **Live Clinical Dashboard**: [https://appointymern-admin.vercel.app](https://appointymern-admin.vercel.app)

---

## 📄 License & Attribution

This project is licensed under the [ISC License](LICENSE). Built for educational and portfolio demonstration.
