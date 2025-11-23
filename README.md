# Restaurant Menu App

A modern, responsive restaurant menu website built with Next.js, Tailwind CSS, and shadcn/ui.

## Features

- 🏪 **Multi-Restaurant Support**: Each restaurant gets its own QR code and dedicated menu page
- 📱 **Fully Responsive**: Works perfectly on mobile, iPad, and desktop devices
- 🎨 **Modern Design**: Beautiful, clean UI with smooth animations
- ⚡ **High Performance**: SSR rendering, lazy-loading images, optimized for speed
- ⭐ **Rating System**: Customers can rate dishes
- 🖼️ **Image Slider**: Product images displayed in a beautiful slider
- 🔐 **Admin CMS**: Full admin panel for managing restaurants, categories, and menu items

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **TypeScript**: Full type safety

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up your database:
   - Create a PostgreSQL database
   - Copy `.env.example` to `.env` and update `DATABASE_URL`

3. Run database migrations:
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
restaurant-menu-app/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/             # Utilities and helpers
├── prisma/          # Database schema
└── public/          # Static assets
```

## Admin Access

Access the admin panel at `/admin` to manage restaurants, categories, and menu items.

## Deployment

The app is ready for deployment on Vercel, Netlify, or any platform that supports Next.js.

