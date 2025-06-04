# GameBazaar - Game E-commerce Platform

A full-stack e-commerce platform for game sales, built with the MERN stack (MongoDB, Express, React with TypeScript, Node.js).

## Features

- **User Management**: Authentication, profile management, and role-based access control
- **Game Catalog**: Browse games with detailed information, system requirements, and installation tutorials
- **Shopping Experience**: Cart functionality, wishlist, and order processing with PDF receipts
- **Review System**: Customer reviews and ratings for games
- **Blog System**: Gaming news, tips, reviews, and guides with multiple categories
- **Admin Dashboard**: Complete inventory management, order processing, and blog management
- **Email System**: Order confirmations, status updates, and support communications
- **Support System**: Contact forms and support ticket management
- **Responsive Design**: Optimized for all devices with modern UI

## Development Setup

### Prerequisites

- Node.js 14.0 or higher
- MongoDB (local or Atlas)
- Git

### Setup Instructions

#### 1. Clone the repository

```bash
git clone <your-repository-url>
cd GameBazaar
```

#### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 3. Set up environment variables

Create a `.env` file in the backend directory with your development values:

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb+srv://<your_username>:<your_password>@<your-cluster>.mongodb.net/gamebazaar

# JWT Settings
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Email Configuration (for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

#### 4. Seed the database (optional)

```bash
cd backend
node seeder.js -i
```

#### 5. Start development servers

**Backend (from backend directory):**
```bash
npm run dev
```

**Frontend (from frontend directory):**
```bash
npm run dev
```

The backend will run on `http://localhost:5000` and frontend on `http://localhost:5173`.

## Production Deployment Guide

Follow these steps to deploy GameBazaar to a production environment.

### Prerequisites

- Node.js 14.0 or higher
- MongoDB Atlas account (or other MongoDB provider)
- Production server (Heroku, DigitalOcean, AWS, etc.)

### Setup Instructions

#### 1. Clone the repository

```bash
git clone <your-repository-url>
cd GameBazaar
```

#### 2. Install dependencies

```bash
npm run install-all
```

This will install dependencies for the root project, frontend, and backend.

#### 3. Set up environment variables

Create a `.env` file in the backend directory with your production values:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb+srv://<your_username>:<your_password>@<your-cluster>.mongodb.net/gamebazaar

# JWT Settings
JWT_SECRET=<your_production_jwt_secret>
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Email Configuration (for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your_production_email@gmail.com
EMAIL_PASSWORD=your_production_app_password

# Frontend URL (for CORS)
FRONTEND_URL=https://<your-production-domain.com>
```

Replace the placeholder values with your actual production values.

#### 4. Build the frontend

```bash
npm run build
```

This will create an optimized production build of the frontend in the `frontend/dist` directory.

#### 5. Start the production server

```bash
npm start
```

#### 6. Deploy to hosting service

For Heroku:
```bash
heroku create
git push heroku main
```

For other platforms, follow their specific deployment instructions.

## Project Structure

```
GameBazaar/
├── backend/                    # Express.js API server
│   ├── controllers/           # Route controllers
│   │   ├── auth.js           # Authentication logic
│   │   ├── blogs.js          # Blog management
│   │   ├── cart.js           # Shopping cart
│   │   ├── games.js          # Game catalog
│   │   ├── orders.js         # Order processing
│   │   ├── reviews.js        # Review system
│   │   ├── support.js        # Support tickets
│   │   └── wishlist.js       # Wishlist functionality
│   ├── middleware/           # Custom middleware
│   │   └── auth.js          # JWT authentication
│   ├── models/              # Mongoose schemas
│   │   ├── Blog.js          # Blog model
│   │   ├── Cart.js          # Cart model
│   │   ├── Game.js          # Game model
│   │   ├── Order.js         # Order model
│   │   ├── Review.js        # Review model
│   │   ├── User.js          # User model
│   │   └── Wishlist.js      # Wishlist model
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   │   ├── emailService.js  # Email notifications
│   │   ├── notification.js  # Push notifications
│   │   └── pdfGenerator.js  # PDF receipt generation
│   ├── _data/               # Seed data
│   │   ├── games.json       # Sample games
│   │   └── users.json       # Sample users
│   ├── seeder.js            # Database seeder
│   └── server.js            # Server entry point
├── frontend/                   # React TypeScript client
│   ├── public/                # Static assets
│   │   ├── admin-test.html        # Admin testing page
│   │   ├── contact-form-test.html # Contact form testing
│   │   ├── support-form-test.html # Support form testing
│   │   └── logo.webp             # App logo
│   └── src/
│       ├── components/       # Reusable components
│       │   ├── layout/      # Layout components
│       │   ├── AdminRoute.tsx   # Admin route protection
│       │   ├── AuthRoute.tsx    # Auth route protection
│       │   └── ErrorBoundary.tsx # Error handling
│       ├── context/          # React Context providers
│       │   ├── AuthContext.tsx     # Authentication state
│       │   ├── CartContext.tsx     # Shopping cart state
│       │   └── WishlistContext.tsx # Wishlist state
│       ├── pages/           # Application pages
│       │   ├── AdminDashboard.tsx    # Admin management
│       │   ├── BlogPage.tsx          # Blog listing
│       │   ├── BlogDetailsPage.tsx   # Blog post details
│       │   ├── CartPage.tsx          # Shopping cart
│       │   ├── ContactPage.tsx       # Contact form
│       │   ├── GameDetailsPage.tsx   # Game details
│       │   ├── HomePage.tsx          # Landing page
│       │   ├── OrderHistoryPage.tsx  # Order history
│       │   ├── ProfilePage.tsx       # User profile
│       │   ├── ShippingInfoPage.tsx  # Shipping information
│       │   ├── SupportPage.tsx       # Support tickets
│       │   └── WishlistPage.tsx      # User wishlist
│       └── services/        # API services
│           └── events.ts    # Event handling
├── test-blog-system.js        # Blog system testing
└── package.json              # Root package configuration
```

## Database Seeding

To seed the database with initial data:

```bash
npm run data:import
```

To clear all data:

```bash
npm run data:destroy
```

## Technologies Used

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **State Management**: React Context API

## API Testing

Test files available in `frontend/public/`:
- `admin-test.html` - Admin order management testing
- `contact-form-test.html` - Contact form testing  
- `support-form-test.html` - Support ticket testing

## Available Scripts

```bash
# Development
npm run dev          # Start both frontend and backend
npm run client       # Start frontend only
npm run server       # Start backend only

# Production
npm run build        # Build frontend for production
npm start           # Start production server

# Database
npm run data:import  # Import seed data
npm run data:destroy # Clear all data
```

## Production Monitoring and Maintenance

- Check application logs regularly
- Set up monitoring with tools like PM2 or a service like New Relic
- Schedule regular database backups
- Keep dependencies updated for security patches
