# SpinDuck-app
# SpinDuck — Create. Spin. Decide.

SpinDuck is a professional SaaS web application designed for creating, spinning, and managing custom wheel pickers with server-verified randomness.

## Quick Setup & Deployment Instructions

### 1. Requirements
- Node.js 18+
- PostgreSQL database

### 2. Environment Variables Configuration
Copy `.env.example` to `.env` and fill in your DB credentials:
```bash
cp .env.example .env

#3. Install Dependencies & Seed Database
#npm install
npx prisma migrate dev --name init
npm run db:seed
#4. Local Development Server
npm run dev
