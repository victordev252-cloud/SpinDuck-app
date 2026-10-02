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
#5. Deploy to Vercel
​Push this repository to GitHub.
​Import project into Vercel Dashboard.
​Configure DATABASE_URL and AUTH_SECRET under Vercel Project Settings -> Environment Variables.
4​Hit Deploy.
#---

### Step-by-Step GitHub Upload Guide

Run these commands in your local project terminal to push the complete **SpinDuck** project to your GitHub repository:

1. **Initialize Git Repository:**
   ```bash
   git init
Add all generated files:
git add .
# Commit the changes:
git commit -m "Initial commit: SpinDuck complete production application"
# Link your GitHub Repository & Push:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/spinduck.git
git push -u origin main
