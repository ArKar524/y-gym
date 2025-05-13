# Deploying Y-Gym to Vercel with PostgreSQL

This guide will help you deploy your Y-Gym application to Vercel with a PostgreSQL database.

## Prerequisites

- A Vercel account
- Your Y-Gym repository pushed to GitHub, GitLab, or Bitbucket

## Steps for Deployment

### 1. Create a PostgreSQL Database

You have two options for PostgreSQL hosting:

#### Option A: Use Vercel Postgres

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage → Create → Postgres
3. Follow the setup wizard to create your PostgreSQL database
4. Vercel will automatically add the required environment variables to your project

#### Option B: Use an External PostgreSQL Provider (Supabase, Railway, etc.)

1. Create a PostgreSQL database on your preferred provider
2. Get the connection string in the format: `postgresql://username:password@hostname:port/database?schema=public`

### 2. Deploy Your Application to Vercel

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your repository from GitHub, GitLab, or Bitbucket
4. Configure the project with the following settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build --legacy-peer-deps`
   - Install Command: `npm install --legacy-peer-deps`
   - Output Directory: `.next`

### 3. Configure Environment Variables

If you're not using Vercel Postgres, you'll need to manually add your environment variables:

1. In your project settings, go to the "Environment Variables" tab
2. Add the following variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - Add any other environment variables your application needs

### 4. Deploy Your Application

1. Click "Deploy"
2. Wait for the build and deployment to complete

### 5. Run Database Migrations

After deployment, you need to run your Prisma migrations on the production database:

1. Install the Vercel CLI: `npm install -g vercel`
2. Login to Vercel: `vercel login`
3. Link to your project: `vercel link`
4. Run the migrations using the Vercel CLI:
   ```
   vercel env pull .env.production
   npx prisma migrate deploy --preview-feature
   ```

## Important Notes

- The database connection is configured to use connection pooling via Prisma's driver adapters, which is important for serverless environments like Vercel
- Your application is set up to use Prisma Accelerate for improved performance
- The `postinstall` script in package.json ensures that the Prisma client is generated during deployment

## Troubleshooting

- If you encounter database connection issues, check that your connection string is correct and that your database is accessible from Vercel's servers
- For Prisma errors, ensure that your migrations have been applied correctly
- If you need to seed your production database, you can run: `npx prisma db seed -- --environment production`
