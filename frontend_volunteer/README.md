# Volunteer Community Platform - Frontend

## Overview
A modern React application for managing volunteer communities and opportunities, built with Vite, TypeScript, and Tailwind CSS.

## Features
- User authentication (register/login)
- Community management
- Volunteer opportunity management
- Responsive design
- Modern UI with shadcn/ui components

## Prerequisites
- Node.js (v18 or higher)
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

3. Update `.env` with your backend API URL:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Start development server:
```bash
npm run dev
```

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure
```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts
├── hooks/          # Custom hooks
├── lib/            # Utility functions and API client
├── pages/          # Page components
├── types/          # TypeScript type definitions
└── App.tsx         # Main App component
```

## API Integration
The frontend integrates with a Node.js/Express backend API. All API calls are handled through the `src/lib/api.ts` module.

## Authentication
JWT-based authentication with token storage in localStorage. Protected routes are handled through the AuthContext.

## Deployment
For production deployment:

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting provider.

3. Update environment variables with your production API URL.

## Technologies Used
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- React Query
- Lucide React
