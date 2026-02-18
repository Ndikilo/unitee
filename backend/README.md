# Volunteer Community Platform - Backend

## Overview
A Node.js/Express REST API for managing volunteer communities and opportunities, with MongoDB database and JWT authentication.

## Features
- User authentication with JWT
- Community management (create, join, list)
- Volunteer opportunity management (create, list, sign up)
- MongoDB database integration
- Protected routes with middleware
- RESTful API design

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/volunteer_app
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

4. Start development server:
```bash
npm run dev
```

## Available Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (when implemented)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (protected)

### Communities
- `GET /api/communities` - Get all communities
- `POST /api/communities` - Create new community (protected)
- `POST /api/communities/:id/join` - Join community (protected)

### Opportunities
- `GET /api/opportunities` - Get all opportunities (supports filtering)
- `POST /api/opportunities` - Create new opportunity (protected)
- `POST /api/opportunities/:id/signup` - Sign up for opportunity (protected)

## API Usage Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Community
```bash
curl -X POST http://localhost:5000/api/communities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Beach Cleanup Group",
    "description": "Dedicated to keeping our beaches clean"
  }'
```

## Project Structure
```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # Route definitions
└── server.js       # Server entry point
```

## Database Models

### User
- name (String, required)
- email (String, required, unique)
- password (String, required, hashed)
- role (String, enum: 'user', 'admin', default: 'user')
- createdAt (Date, default: Date.now)

### Community
- name (String, required)
- description (String, required)
- createdBy (ObjectId, ref: 'User', required)
- members (Array of ObjectId, ref: 'User')
- createdAt (Date, default: Date.now)

### Opportunity
- title (String, required)
- description (String, required)
- location (String)
- date (Date, required)
- requiredVolunteers (Number, required)
- community (ObjectId, ref: 'Community', required)
- volunteers (Array of ObjectId, ref: 'User')
- createdBy (ObjectId, ref: 'User', required)
- status (String, enum: 'open', 'closed', 'completed', default: 'open')
- createdAt (Date, default: Date.now)

## Security Features
- Password hashing with bcryptjs
- JWT token authentication
- Protected routes with middleware
- Input validation and sanitization
- CORS enabled

## Deployment

For production deployment:

1. Set production environment variables
2. Build and start the application:
```bash
npm start
```

3. Use a process manager like PM2 for production:
```bash
npm install -g pm2
pm2 start src/server.js --name "volunteer-api"
```

## Technologies Used
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (jsonwebtoken)
- bcryptjs for password hashing
- CORS
- dotenv for environment variables
