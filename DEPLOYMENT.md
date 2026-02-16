# Deployment Guide

## Prerequisites

1. **Database Setup**
   - For production, use PostgreSQL (recommended: Supabase, Neon, or Railway)
   - For local development, you can use SQLite by changing the Prisma schema

2. **Environment Variables**
   - Create a `.env.local` file with your database URL
   - Set `NEXT_PUBLIC_APP_URL` (or `NEXT_PUBLIC_URL`) to your production URL — **required for QR codes** so customers can scan menus in restaurants

## Local Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Database**
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Push schema to database (creates tables)
   npx prisma db push
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Home: http://localhost:3000
   - Admin: http://localhost:3000/admin
   - Restaurants: http://localhost:3000/restaurants

## Production Deployment

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `NEXT_PUBLIC_APP_URL` (or `NEXT_PUBLIC_URL`): Your production URL (e.g., https://your-app.vercel.app) — **QR codes on menus will point to this URL**
   - Deploy!

3. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

### Option 2: Other Platforms

The app can be deployed on:
- **Netlify**: Similar to Vercel, supports Next.js
- **Railway**: Includes PostgreSQL database
- **Render**: Full-stack deployment
- **AWS/Azure/GCP**: Using Docker containers

## Database Migration

For production, use migrations instead of `db push`:

```bash
# Create a migration
npx prisma migrate dev --name init

# Apply migrations in production
npx prisma migrate deploy
```

## Environment Variables

Create `.env.local` for local development:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/restaurant_menu?schema=public"
NEXT_PUBLIC_URL="http://localhost:3000"
# For production: NEXT_PUBLIC_APP_URL="https://yourmenu.com"
```

For production, set these in your hosting platform's environment variables.

## Performance Optimizations

The app includes:
- ✅ Server-Side Rendering (SSR)
- ✅ Image lazy-loading
- ✅ Optimized Next.js Image component
- ✅ Database indexing
- ✅ Efficient queries with Prisma

## Troubleshooting

1. **Database Connection Issues**
   - Verify your `DATABASE_URL` is correct
   - Ensure your database is accessible
   - Check firewall settings

2. **Build Errors**
   - Run `npx prisma generate` before building
   - Ensure all environment variables are set

3. **QR Code Not Showing**
   - Verify `NEXT_PUBLIC_URL` is set correctly
   - Check browser console for errors

## Next Steps

1. Set up authentication (optional, for admin panel)
2. Add image upload functionality
3. Set up analytics
4. Configure custom domain
5. Set up SSL certificate (usually automatic on Vercel)

