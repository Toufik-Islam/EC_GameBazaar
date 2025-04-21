# GameBazaar - Game E-commerce Platform

A full-stack e-commerce platform for game sales, built with the MERN stack (MongoDB, Express, React, Node.js).

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
# On Linux/Mac:
npm start

# On Windows:
npm run prod:windows
```

#### 6. Deploy to hosting service

For Heroku:
```bash
heroku create
git push heroku main
```

For other platforms, follow their specific deployment instructions.

## Production Features

The production build includes:

- Optimized frontend bundle with code splitting
- Compressed static assets
- Security headers with Helmet.js
- Rate limiting to prevent abuse
- Response compression for faster loading
- Centralized error handling
- MongoDB Atlas integration
- JWT-based authentication

## Database Seeding

To seed the database with initial data:

```bash
npm run data:import
```

To clear all data:

```bash
npm run data:destroy
```

## Production Monitoring and Maintenance

- Check application logs regularly
- Set up monitoring with tools like PM2 or a service like New Relic
- Schedule regular database backups
- Keep dependencies updated for security patches