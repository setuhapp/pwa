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

## Getting Started

### 1. Prerequisites

- **Node.js** (v18+ recommended)
- **PostgreSQL** running locally

### 2. Installation

Clone the repository and install the dependencies:

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root of the project. You can copy the structure from
the example below:

```bash
# PostgreSQL Connection URL
# Replace `username` with your local Postgres username. The database `setuh` will be created if it doesn't exist.
DATABASE_URL="postgresql://username@localhost:5432/setuh"

# Optional: Vercel Blob token for file uploads (Caregiver profile photos)
# If omitted, uploads will default to saving locally in `public/uploads`.
# BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

### 4. Database Setup

Initialize your database schema and seed it with the mock data.

Push the schema to Postgres (this will create the tables):

```bash
npx prisma db push
```

Generate the Prisma Client:

```bash
npx prisma generate
```

Seed the database with the initial mock caregivers and admin account:

```bash
npm run db:seed
```

### 5. Run the Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the
application.

---

## Mock Login Data

The MVP uses a mock OTP system for logins. Enter any phone number, and use the
OTP `000000` to log in.

- **Admin Login:** The seed script creates an Admin account with the phone
  number `9000000000`. Login with this number to access the Admin tier.

## Vercel Deployment

1. Connect the repository to Vercel.
2. In Vercel Project Settings, provision a **Supabase** database (or Vercel
   Postgres) and a **Vercel Blob** store.
3. Ensure `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` are set in the Vercel
   Environment Variables.
4. Vercel will automatically build the Next.js app and run the required Prisma
   generations.

npm run build && npx next start -p 3001
