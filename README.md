# Setuh MVP

Setuh is a progressive web app connecting families with specialized caregivers.
It is built with Next.js (App Router), Prisma, PostgreSQL, and is designed to be
hosted on Vercel.

## Tech Stack

- **Framework:** Next.js (React)
- **Database:** PostgreSQL via Prisma (v7)
- **Styling:** Tailwind CSS
- **PWA:** `@ducanh2912/next-pwa`
- **File Uploads:** Vercel Blob (with local fallback)

---

## Environment Modes

Setuh supports two distinct configuration modes managed dynamically by Next.js and Prisma:
1. **Dev Mode (Local)**: Runs database queries against your local PostgreSQL database, using mock OTP and local filesystem image storage.
2. **Prod Mode (Supabase + Vercel)**: Runs database queries against your hosted Supabase instance, using Vercel Blob for caregiver uploads and Twilio Verify for live WhatsApp OTP delivery.

### How Environment Files are Loaded
Next.js dynamically loads the environment variables based on the active mode:
* **Local Development (`next dev` / `vitest` / local CLI)**: Loads **[.env](file:///Users/rahulv/sw/setuh/.env)** (contains local postgres strings, and is gitignored).
* **Production Build (`next build` / `next start` / Vercel)**: Loads **[.env.production](file:///Users/rahulv/sw/setuh/.env.production)** first to override settings with Supabase and production credentials, falling back to `.env` only for missing keys.

---

## Local Development (Dev Mode)

### 1. Installation

Clone the repository and install dependencies:
```bash
npm install
```

### 2. Configure Local Environment
Create a `.env` file in the root of the project with your local PostgreSQL connection strings. You can copy the template from [.env.example](file:///Users/rahulv/sw/setuh/.env.example):
```env
DATABASE_URL="postgresql://username@localhost:5432/setuh"
DIRECT_URL="postgresql://username@localhost:5432/setuh"
```

### 3. Database Migration & Seeding
Push the database schema to your local database:
```bash
npx prisma db push
```

Seed the local database with mock caregiver, member, admin, and engagement data:
```bash
npm run db:seed
```

### 4. Run the App
Start the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Production & Supabase Integration (Prod Mode)

To manage or test your production database locally, you can direct Prisma CLI commands to your Supabase instance using `NODE_ENV=production`.

### 1. Configure Production Environment
Open **[.env.production](file:///Users/rahulv/sw/setuh/.env.production)** and set your Supabase database credentials:
* **`DATABASE_URL`**: Your Supabase Transaction Pooler connection string (port `6543`, with `?pgbouncer=true` at the end).
* **`DIRECT_URL`**: Your Supabase Direct Connection string (port `5432`).

### 2. Database Migration & Seeding
Push the database schema directly to your Supabase instance:
```bash
NODE_ENV=production npx prisma db push
```

*(Optional)* Seed your Supabase database with the mock dataset:
```bash
NODE_ENV=production npm run db:seed
```

---

## Vercel Deployment

### 1. Connect Repository
Import your GitHub repository into Vercel as a Next.js project.

### 2. Configure Environment Variables
In your Vercel Project Settings, add the following Environment Variables under the Settings tab:
* `DATABASE_URL`: Your Supabase Transaction Pooler connection string (port 6543).
* `DIRECT_URL`: Your Supabase Direct Connection string (port 5432).
* `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob store token (created via Vercel Storage tab, used for caregiver photo uploads).
* `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`: (Optional) Credentials for live WhatsApp OTP delivery. If left blank, login falls back to developer mode (allowing login with any phone number and OTP `000000`).

### 3. Build & Deploy
Once environment variables are saved, trigger a new deployment. Vercel will automatically:
1. Run the `postinstall` hook to generate the Prisma client.
2. Build and optimize the Next.js application using production configurations.
3. Deploy the application as Vercel Serverless Functions.

---

## Mock Login Data
When running in Dev mode, or when Twilio credentials are unset in production:
* Enter any phone number, and log in using the mock OTP code: **`000000`**.
* **Admin Login**: Log in with phone number **`9000000000`** and OTP **`000000`** to access the Admin dashboard.

