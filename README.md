# GameBazaar - Game E-commerce Platform

A full-stack e-commerce platform for game sales, built with the MERN stack (MongoDB, Express, React with TypeScript, Node.js).

## Features

- User authentication and profile management
- Game browsing and detailed game information
- Shopping cart functionality
- Wishlist for saving games for later
- Order processing and history
- Game reviews and ratings
- Admin dashboard for inventory management
- Responsive design for all devices

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
npm run install-all
```

This will install dependencies for the root project, frontend, and backend.

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

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

#### 4. Start the development server

```bash
npm run dev
```

This will start both the backend server (Express) and the frontend development server (Vite) concurrently.

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
├── backend/               # Express server
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── _data/             # Seed data
│   ├── utils/             # Utility functions
│   └── server.js          # Server entry point
└── frontend/              # React with TypeScript client
    ├── public/            # Static assets
    └── src/
        ├── components/    # Reusable components
        ├── context/       # React context providers
        ├── pages/         # Application pages
        └── services/      # API services
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

## Production Monitoring and Maintenance

- Check application logs regularly
- Set up monitoring with tools like PM2 or a service like New Relic
- Schedule regular database backups
- Keep dependencies updated for security patches
