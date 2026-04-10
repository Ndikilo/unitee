# UNITEE - Volunteer Community Action Platform
## Complete Project Documentation

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Features & Modules](#features--modules)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Frontend Pages](#frontend-pages)
9. [Backend Services](#backend-services)
10. [Security Features](#security-features)
11. [Installation & Setup](#installation--setup)
12. [Deployment Guide](#deployment-guide)
13. [Testing](#testing)
14. [Future Enhancements](#future-enhancements)

---

## 1. Project Overview

### 1.1 Purpose
UNITEE is a comprehensive volunteer management platform designed to connect volunteers with community organizations and opportunities across Cameroon. The platform facilitates volunteer recruitment, event management, impact tracking, and community building.

### 1.2 Target Audience
- **Volunteers**: Individuals seeking meaningful volunteer opportunities
- **Organizers**: NGOs and community organizations managing volunteer programs
- **Administrators**: Platform managers overseeing system operations

### 1.3 Key Objectives
- Simplify volunteer opportunity discovery and registration
- Enable organizations to efficiently manage volunteer programs
- Track and recognize volunteer contributions
- Build engaged volunteer communities
- Provide data-driven insights on community impact

### 1.4 Project Scope
- Web-based platform (desktop and mobile responsive)
- Real-time notifications and updates
- Certificate generation and verification
- Badge and achievement system
- Multi-role dashboard interfaces
- Community management features
- Emergency alert system

---

## 2. System Architecture

### 2.1 Architecture Pattern
**MERN Stack with MVC Pattern**

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React 18 + TypeScript + Vite                        │   │
│  │  - Pages (30+ routes)                                │   │
│  │  - Components (shadcn/ui)                            │   │
│  │  - Context API (Auth, Language, App)                 │   │
│  │  - React Router                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                     SERVER LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Node.js + Express.js                                │   │
│  │  - Routes (11 route files)                           │   │
│  │  - Controllers (9 controllers)                       │   │
│  │  - Middleware (Auth, Validation, Error Handling)     │   │
│  │  - Services (Badge System, PDF Generation)           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ Mongoose ODM
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MongoDB                                             │   │
│  │  - 9 Collections (Users, Opportunities, etc.)        │   │
│  │  - Indexes for performance                           │   │
│  │  - Relationships via ObjectId references             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Component Breakdown

**Frontend Architecture:**
- **Pages**: 30+ page components for different routes
- **Components**: Reusable UI components (100+ components)
- **Contexts**: Global state management (Auth, Language, App)
- **Hooks**: Custom React hooks for common functionality
- **Utils**: Helper functions and utilities
- **API Client**: Centralized API communication layer

**Backend Architecture:**
- **Routes**: API endpoint definitions (11 route files)
- **Controllers**: Business logic handlers (9 controllers)
- **Models**: MongoDB schemas (9 models)
- **Middleware**: Authentication, validation, error handling
- **Utils**: Helper functions (badge system, error responses)
- **Config**: Database and passport configuration

---

## 3. Technology Stack

### 3.1 Frontend Technologies


| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI library for building user interfaces |
| TypeScript | 5.5.3 | Type-safe JavaScript |
| Vite | 5.4.1 | Build tool and dev server |
| React Router | 6.26.2 | Client-side routing |
| Tailwind CSS | 3.4.11 | Utility-first CSS framework |
| shadcn/ui | Latest | Pre-built accessible components |
| Radix UI | Various | Headless UI primitives |
| React Hook Form | 7.53.0 | Form management |
| Zod | 3.23.8 | Schema validation |
| Recharts | 2.12.7 | Data visualization |
| date-fns | 3.6.0 | Date manipulation |
| Lucide React | 0.462.0 | Icon library |

### 3.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.18.0 | JavaScript runtime |
| Express.js | 4.18.2 | Web application framework |
| MongoDB | 7.3.0 | NoSQL database |
| Mongoose | 7.3.0 | MongoDB ODM |
| JWT | 9.0.0 | Authentication tokens |
| Passport.js | 0.7.0 | Authentication middleware |
| bcryptjs | 2.4.3 | Password hashing |
| PDFKit | 0.17.2 | PDF generation |
| QRCode | 1.5.4 | QR code generation |
| Nodemailer | 7.0.12 | Email sending |
| Helmet | 7.1.0 | Security headers |
| Express Rate Limit | 7.1.5 | Rate limiting |

### 3.3 Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Nodemon | Auto-restart dev server |
| dotenv | Environment variables |
| Postman | API testing |
| Git | Version control |

---

## 4. Features & Modules

### 4.1 Authentication & Authorization

**Features:**
- Email/password registration and login
- JWT-based authentication
- Role-based access control (Volunteer, Organizer, Admin)
- Email verification
- Password reset functionality
- Google OAuth integration (configured)
- Session management
- Protected routes

**User Roles:**
1. **Volunteer**: Browse opportunities, register for events, track hours
2. **Organizer**: Create opportunities, manage applications, issue certificates
3. **Admin**: Full platform control, user management, system oversight

### 4.2 Volunteer Opportunities

**Features:**
- Browse opportunities with filters (category, location, date)
- Search functionality
- Detailed opportunity pages
- Sign up for opportunities
- Track registered opportunities
- View opportunity history
- Emergency opportunity flagging
- Capacity management
- Application status tracking

**Opportunity Categories:**
- Education
- Healthcare
- Environment
- Community Development
- Disaster Relief
- Youth Programs
- Elderly Care
- Animal Welfare

### 4.3 Community Management

**Features:**
- Create and join communities
- Community profiles with details
- Member management
- Community-specific opportunities
- Discussion forums (planned)
- Community events
- Member directory

### 4.4 Badge & Achievement System

**Features:**
- 16 predefined badges across 6 categories
- Admin badge management (create, edit, delete, toggle)
- Automatic badge awarding based on criteria
- Progress tracking for available badges
- 4 achievement tiers (Bronze, Silver, Gold, Platinum)
- Points system
- Badge statistics and analytics

**Badge Categories:**
1. **Participation**: Events completed
2. **Hours**: Volunteer hours logged
3. **Impact**: People helped
4. **Community**: Communities joined
5. **Skills**: Skills acquired
6. **Leadership**: Events created

**Badge Criteria Types:**
- events_completed
- hours_logged
- people_helped
- communities_joined
- skills_added
- events_created

### 4.5 Certificate System

**Features:**
- Professional PDF certificate generation
- QR code verification
- 5 certificate types
- Digital signatures and hashing
- Tamper-proof design
- Certificate verification page
- Download and share functionality
- Certificate statistics tracking

**Certificate Types:**
1. Volunteer Completion
2. Volunteer Passport
3. Achievement Badge
4. Hours Milestone
5. Skill Certification

**Certificate Features:**
- Unique certificate ID
- SHA-256 verification hash
- QR code for instant verification
- Professional design with gradients
- Decorative elements and borders
- Security watermarks
- Issuer signature
- Skills and metrics display

### 4.6 Admin Dashboard

**10 Comprehensive Tabs:**
1. **Overview**: Quick stats and recent activity
2. **Users**: User management (suspend, activate, verify, promote)
3. **Opportunities**: Opportunity moderation
4. **Communities**: Community management
5. **Applications**: Application review
6. **Certificates**: Certificate management
7. **Badges**: Badge system administration
8. **Reports**: Content moderation
9. **System Health**: Performance monitoring
10. **Settings**: Platform configuration

**Admin Capabilities:**
- User management (CRUD operations)
- Content moderation
- Emergency alert creation
- Platform analytics
- Badge management
- Certificate oversight
- Report handling
- System monitoring

### 4.7 Organizer Dashboard

**Features:**
- Opportunity management
- Application review and approval
- Volunteer tracking
- Certificate generation
- Statistics and analytics
- Event calendar
- Volunteer communication

### 4.8 Volunteer Dashboard

**Features:**
- Personal impact statistics
- Registered opportunities
- Earned badges and progress
- Certificates collection
- Volunteer passport
- Activity history
- Profile management

### 4.9 Notification System

**Features:**
- Real-time notifications
- Notification types (application status, new opportunities, badges earned)
- Mark as read functionality
- Notification preferences
- Email notifications (configured)

### 4.10 Reporting System

**Features:**
- Report inappropriate content
- Report types (user, opportunity, community)
- Admin review workflow
- Resolution tracking
- Reporter anonymity option

### 4.11 Emergency Alert System

**Features:**
- Create emergency alerts
- Severity levels (low, medium, high, critical)
- Target by location
- Banner display on platform
- Alert management
- Deactivation functionality

---

## 5. Database Schema

### 5.1 Collections Overview

The platform uses 9 MongoDB collections:

1. **Users** - User accounts and profiles
2. **Opportunities** - Volunteer opportunities
3. **Communities** - Community organizations
4. **Applications** - Volunteer applications
5. **Certificates** - Generated certificates
6. **Badges** - Achievement badges
7. **Notifications** - User notifications
8. **Reports** - Content reports
9. **EmergencyAlerts** - Emergency announcements

### 5.2 User Model


```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['user', 'organizer', 'admin']),
  emailVerified: Boolean,
  isActive: Boolean,
  profile: {
    bio: String,
    skills: [String],
    interests: [String],
    location: {
      city: String,
      region: String,
      country: String
    },
    phone: String,
    dateOfBirth: Date,
    gender: String,
    avatar_url: String
  },
  stats: {
    totalHours: Number,
    totalEvents: Number,
    peopleHelped: Number,
    badges: [{
      badgeId: ObjectId (ref: 'Badge'),
      name: String,
      earnedAt: Date
    }]
  },
  communities: [ObjectId (ref: 'Community')],
  organizationName: String (for organizers),
  organizationDescription: String,
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 5.3 Opportunity Model

```javascript
{
  title: String (required),
  description: String (required),
  category: String (required),
  organizer: ObjectId (ref: 'User', required),
  community: ObjectId (ref: 'Community'),
  location: {
    address: String,
    city: String,
    region: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  dateTime: {
    start: Date (required),
    end: Date (required)
  },
  capacity: {
    total: Number (required),
    filled: Number (default: 0)
  },
  requirements: {
    minAge: Number,
    skills: [String],
    experience: String
  },
  status: String (enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled']),
  isEmergency: Boolean,
  tags: [String],
  impact: {
    peopleHelped: Number,
    description: String
  },
  volunteers: [ObjectId (ref: 'User')],
  images: [String],
  contactInfo: {
    email: String,
    phone: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 5.4 Community Model

```javascript
{
  name: String (required),
  description: String (required),
  category: String (required),
  creator: ObjectId (ref: 'User', required),
  location: {
    city: String,
    region: String,
    country: String
  },
  members: [ObjectId (ref: 'User')],
  admins: [ObjectId (ref: 'User')],
  logo: String,
  coverImage: String,
  contactEmail: String,
  website: String,
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String
  },
  isVerified: Boolean,
  isActive: Boolean,
  stats: {
    totalMembers: Number,
    totalOpportunities: Number,
    totalHours: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 5.5 Badge Model

```javascript
{
  name: String (required, unique),
  description: String (required),
  icon: String (emoji),
  category: String (enum: ['participation', 'hours', 'impact', 'community', 'skills', 'leadership']),
  criteria: {
    type: String (enum: ['events_completed', 'hours_logged', 'people_helped', 'communities_joined', 'skills_added', 'events_created']),
    threshold: Number (required)
  },
  tier: String (enum: ['bronze', 'silver', 'gold', 'platinum']),
  points: Number (default: 10),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 5.6 Certificate Model

```javascript
{
  certificateId: String (unique, required),
  verificationHash: String (unique, required),
  type: String (enum: ['volunteer_completion', 'volunteer_passport', 'achievement_badge', 'hours_milestone', 'skill_certification']),
  title: String (required),
  description: String (required),
  recipientId: ObjectId (ref: 'User', required),
  recipientName: String (required),
  recipientEmail: String (required),
  issuerId: ObjectId (ref: 'User', required),
  issuerName: String (required),
  issuerType: String (enum: ['ngo', 'admin', 'system']),
  opportunityId: ObjectId (ref: 'Opportunity'),
  opportunityTitle: String,
  hoursCompleted: Number,
  skillsAcquired: [String],
  achievementLevel: String (enum: ['bronze', 'silver', 'gold', 'platinum']),
  issuedDate: Date (required),
  expiryDate: Date,
  status: String (enum: ['active', 'revoked', 'expired']),
  digitalSignature: String (required),
  verificationUrl: String (required),
  pdfGenerated: Boolean,
  pdfPath: String,
  downloadCount: Number,
  verificationCount: Number,
  lastVerified: Date,
  metadata: Mixed,
  createdAt: Date,
  updatedAt: Date
}
```

### 5.7 Application Model

```javascript
{
  opportunity: ObjectId (ref: 'Opportunity', required),
  volunteer: ObjectId (ref: 'User', required),
  status: String (enum: ['pending', 'accepted', 'rejected', 'completed']),
  message: String,
  skills: [String],
  availability: String,
  hoursLogged: Number,
  feedback: {
    rating: Number,
    comment: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 5.8 Notification Model

```javascript
{
  recipient: ObjectId (ref: 'User', required),
  type: String (enum: ['application_status', 'new_opportunity', 'badge_earned', 'certificate_issued', 'community_update', 'emergency_alert']),
  title: String (required),
  message: String (required),
  relatedId: ObjectId,
  relatedModel: String,
  isRead: Boolean (default: false),
  createdAt: Date
}
```

### 5.9 Report Model

```javascript
{
  reporter: ObjectId (ref: 'User', required),
  type: String (enum: ['user', 'opportunity', 'community', 'other']),
  targetId: ObjectId (required),
  targetModel: String (required),
  reason: String (required),
  description: String,
  status: String (enum: ['pending', 'reviewed', 'resolved', 'dismissed']),
  resolution: String,
  reviewedBy: ObjectId (ref: 'User'),
  reviewedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 5.10 EmergencyAlert Model

```javascript
{
  title: String (required),
  message: String (required),
  severity: String (enum: ['low', 'medium', 'high', 'critical']),
  targetCity: String,
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: 'User', required),
  createdAt: Date,
  deactivatedAt: Date
}
```

---

## 6. API Endpoints

### 6.1 Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| GET | `/me` | Get current user | Yes |
| PUT | `/profile` | Update profile | Yes |
| POST | `/forgot-password` | Request password reset | No |
| PUT | `/reset-password/:token` | Reset password | No |
| PUT | `/change-password` | Change password | Yes |
| GET | `/verify-email/:token` | Verify email | No |
| POST | `/google` | Google OAuth login | No |

### 6.2 Opportunity Routes (`/api/opportunities`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all opportunities | No |
| GET | `/:id` | Get opportunity by ID | No |
| POST | `/` | Create opportunity | Yes (Organizer/Admin) |
| PUT | `/:id` | Update opportunity | Yes (Owner/Admin) |
| DELETE | `/:id` | Delete opportunity | Yes (Owner/Admin) |
| POST | `/:id/signup` | Sign up for opportunity | Yes |
| DELETE | `/:id/signup` | Cancel signup | Yes |
| GET | `/my-opportunities` | Get user's opportunities | Yes |
| POST | `/:id/review` | Add review | Yes |
| GET | `/testimonials` | Get testimonials | No |

### 6.3 Community Routes (`/api/communities`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all communities | No |
| GET | `/:id` | Get community by ID | No |
| POST | `/` | Create community | Yes |
| PUT | `/:id` | Update community | Yes (Admin) |
| DELETE | `/:id` | Delete community | Yes (Admin) |
| POST | `/:id/join` | Join community | Yes |
| POST | `/:id/leave` | Leave community | Yes |
| GET | `/my-communities` | Get user's communities | Yes |

### 6.4 Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/stats` | Get dashboard stats | Yes (Admin) |
| GET | `/analytics` | Get analytics data | Yes (Admin) |
| GET | `/recent-activity` | Get recent activity | Yes (Admin) |
| GET | `/users` | Get all users | Yes (Admin) |
| PUT | `/users/:id/status` | Update user status | Yes (Admin) |
| GET | `/reports` | Get all reports | Yes (Admin) |
| PUT | `/reports/:id` | Update report | Yes (Admin) |
| GET | `/verifications` | Get verification queue | Yes (Admin) |
| PUT | `/verifications/:id` | Update verification | Yes (Admin) |
| GET | `/emergency-alerts` | Get emergency alerts | Yes (Admin) |
| POST | `/emergency-alerts` | Create emergency alert | Yes (Admin) |
| PUT | `/emergency-alerts/:id/deactivate` | Deactivate alert | Yes (Admin) |
| GET | `/badges` | Get all badges | Yes (Admin) |
| POST | `/badges` | Create badge | Yes (Admin) |
| PUT | `/badges/:id` | Update badge | Yes (Admin) |
| DELETE | `/badges/:id` | Delete badge | Yes (Admin) |
| PATCH | `/badges/:id/toggle` | Toggle badge status | Yes (Admin) |
| GET | `/badges/:id/stats` | Get badge statistics | Yes (Admin) |
| POST | `/badges/:id/duplicate` | Duplicate badge | Yes (Admin) |

### 6.5 Organizer Routes (`/api/organizer`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/stats` | Get organizer stats | Yes (Organizer) |
| GET | `/opportunities` | Get organizer opportunities | Yes (Organizer) |
| GET | `/applications` | Get applications | Yes (Organizer) |
| PATCH | `/applications/:id` | Update application status | Yes (Organizer) |
| PATCH | `/opportunities/:id/status` | Update opportunity status | Yes (Organizer) |
| POST | `/ai-assist` | Generate content with AI | Yes (Organizer) |
| GET | `/profile` | Get organizer profile | Yes (Organizer) |

### 6.6 Certificate Routes (`/api/certificates`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/generate` | Generate certificate | Yes (Organizer/Admin) |
| GET | `/verify/:certificateId` | Verify certificate | No |
| GET | `/user/:userId` | Get user certificates | Yes |
| GET | `/download/:certificateId` | Download certificate PDF | Yes |
| PUT | `/revoke/:certificateId` | Revoke certificate | Yes (Admin/Issuer) |
| GET | `/stats` | Get certificate statistics | Yes (Admin) |

### 6.7 Badge Routes (`/api/badges`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all active badges | No |
| GET | `/my-badges` | Get user's badges with progress | Yes |
| POST | `/check` | Check and award new badges | Yes |

### 6.8 Notification Routes (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user notifications | Yes |
| PUT | `/:id/read` | Mark notification as read | Yes |
| PUT | `/mark-all-read` | Mark all as read | Yes |
| DELETE | `/:id` | Delete notification | Yes |

### 6.9 Report Routes (`/api/reports`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create report | Yes |
| GET | `/my-reports` | Get user's reports | Yes |

### 6.10 Setup Routes (`/api/setup`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/admin` | Create initial admin | No (One-time) |
| GET | `/admin-exists` | Check if admin exists | No |

---

## 7. User Roles & Permissions


### 7.1 Role Hierarchy

```
Admin (Highest Authority)
  ↓
Organizer (Organization Management)
  ↓
Volunteer (Basic User)
```

### 7.2 Permission Matrix

| Feature | Volunteer | Organizer | Admin |
|---------|-----------|-----------|-------|
| Browse Opportunities | ✅ | ✅ | ✅ |
| Sign Up for Opportunities | ✅ | ✅ | ✅ |
| Create Opportunities | ❌ | ✅ | ✅ |
| Edit Own Opportunities | ❌ | ✅ | ✅ |
| Delete Any Opportunity | ❌ | ❌ | ✅ |
| Join Communities | ✅ | ✅ | ✅ |
| Create Communities | ✅ | ✅ | ✅ |
| Manage Communities | ❌ | ❌ | ✅ |
| View Own Certificates | ✅ | ✅ | ✅ |
| Generate Certificates | ❌ | ✅ | ✅ |
| Manage Badges | ❌ | ❌ | ✅ |
| View Badge Progress | ✅ | ✅ | ✅ |
| Submit Reports | ✅ | ✅ | ✅ |
| Review Reports | ❌ | ❌ | ✅ |
| User Management | ❌ | ❌ | ✅ |
| Create Emergency Alerts | ❌ | ❌ | ✅ |
| View Analytics | ❌ | ✅ (Own) | ✅ (All) |
| System Settings | ❌ | ❌ | ✅ |

### 7.3 Access Control Implementation

**Middleware Chain:**
```javascript
protect → authorize(roles) → controller
```

**Example:**
```javascript
router.post('/opportunities', 
  protect,  // Verify JWT token
  authorize('organizer', 'admin'),  // Check role
  createOpportunity  // Execute controller
);
```

---

## 8. Frontend Pages

### 8.1 Public Pages (No Authentication Required)

1. **Home (`/`)** - Landing page with featured opportunities
2. **About (`/about`)** - Platform information
3. **Opportunities (`/opportunities`)** - Browse all opportunities
4. **Communities (`/communities`)** - Browse communities
5. **Login (`/login`)** - User login
6. **Register (`/register`)** - User registration
7. **Forgot Password (`/forgot-password`)** - Password reset request
8. **Reset Password (`/reset-password/:token`)** - Password reset form
9. **Email Verification (`/verify-email/:token`)** - Email verification
10. **Certificate Verification (`/verify/:certificateId`)** - Public certificate verification
11. **Help Center (`/help`)** - Help and FAQs
12. **Privacy Policy (`/privacy`)** - Privacy policy
13. **Terms of Service (`/terms`)** - Terms and conditions
14. **Community Standards (`/community-standards`)** - Community guidelines
15. **Safety Guidelines (`/safety`)** - Safety information

### 8.2 Protected Pages (Authentication Required)

16. **Dashboard (`/dashboard`)** - Role-based dashboard
17. **Profile (`/profile`)** - User profile management
18. **Settings (`/settings`)** - Account settings
19. **My Opportunities (`/my-opportunities`)** - User's registered opportunities
20. **Notifications (`/notifications`)** - User notifications
21. **Community Detail (`/communities/:id`)** - Detailed community page

### 8.3 Volunteer-Specific Pages

22. **Volunteer Dashboard** - Personal stats, badges, certificates

### 8.4 Organizer-Specific Pages

23. **Organizer Dashboard (`/organizer-dashboard`)** - Opportunity management, applications

### 8.5 Admin-Only Pages

24. **Admin Dashboard (`/admin-dashboard`)** - Complete platform management
25. **Admin Register (`/admin-register`)** - Initial admin setup

### 8.6 Special Pages

26. **Auth Success (`/auth-success`)** - OAuth callback
27. **Not Found (`/404`)** - 404 error page

---

## 9. Backend Services

### 9.1 Authentication Service

**Features:**
- JWT token generation and validation
- Password hashing with bcrypt (10 rounds)
- Email verification tokens
- Password reset tokens with expiry
- Session management
- Google OAuth integration

**Security Measures:**
- Passwords hashed before storage
- JWT tokens with expiration
- Secure token generation
- Rate limiting on auth endpoints

### 9.2 Badge System Service

**File:** `backend/src/utils/badgeSystem.js`

**Functions:**
- `initializeBadges()` - Seeds database with 16 default badges
- `checkAndAwardBadges(userId)` - Evaluates user stats and awards eligible badges
- `getUserBadgeProgress(userId)` - Returns earned badges and progress on available badges

**Automatic Badge Awarding:**
- Triggered after user actions (complete event, log hours)
- Checks all active badges
- Compares user stats against criteria
- Awards badge if threshold met
- Prevents duplicate awards

### 9.3 Certificate Generation Service

**File:** `backend/src/controllers/certificateController.js`

**Features:**
- Professional PDF generation with PDFKit
- QR code integration
- Digital signatures (SHA-256)
- Verification hash generation
- Tamper-proof design
- Certificate ID generation (UNITEE-XXXXX-XXXXX)

**PDF Design Elements:**
- A4 landscape layout
- Multi-layer decorative borders
- Gradient backgrounds
- Typography hierarchy
- QR code for verification
- Security watermarks
- Signature lines
- Metrics display

### 9.4 Email Service

**File:** `backend/src/utils/emailService.js` (configured)

**Email Types:**
- Welcome emails
- Email verification
- Password reset
- Application status updates
- Badge earned notifications
- Certificate issued notifications

### 9.5 Notification Service

**Features:**
- Real-time notification creation
- Notification types (6 types)
- Bulk notifications
- Notification preferences
- Mark as read functionality
- Notification cleanup

---

## 10. Security Features

### 10.1 Authentication Security

- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with 10 salt rounds
- **Token Expiration**: 30-day expiry for JWT tokens
- **Secure Cookies**: HTTP-only cookies for sessions
- **Email Verification**: Required for account activation
- **Password Reset**: Time-limited reset tokens

### 10.2 API Security

- **Helmet**: Security headers
- **CORS**: Configured allowed origins
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Sanitization**: MongoDB injection prevention
- **HPP**: HTTP Parameter Pollution protection
- **Express Validator**: Input validation

### 10.3 Data Security

- **Password Encryption**: Never store plain text passwords
- **Sensitive Data**: Environment variables for secrets
- **Database Security**: MongoDB authentication
- **Certificate Verification**: SHA-256 hashing
- **Digital Signatures**: Tamper-proof certificates

### 10.4 Authorization

- **Role-Based Access Control (RBAC)**: Three user roles
- **Protected Routes**: Middleware authentication
- **Resource Ownership**: Users can only modify own resources
- **Admin Privileges**: Elevated permissions for admins

### 10.5 Network Security

- **HTTPS Ready**: Production deployment with SSL
- **Network Access**: Dynamic API URL detection
- **CORS Configuration**: Whitelist allowed origins
- **Security Headers**: Helmet middleware

---

## 11. Installation & Setup

### 11.1 Prerequisites

- Node.js v16+ (v22.18.0 recommended)
- MongoDB (local or Atlas)
- npm or yarn
- Git

### 11.2 Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Environment Variables:**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/volunteer-platform

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=30d

# Certificate
CERTIFICATE_SECRET=your-certificate-secret-key

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@unitee.cm
FROM_NAME=UNITEE Platform

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:8082

# Session
SESSION_SECRET=your-session-secret-key
```

```bash
# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

### 11.3 Frontend Setup

```bash
# Navigate to frontend directory
cd frontend_volunteer

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env
nano .env
```

**Environment Variables:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 11.4 Database Setup

**Option 1: Local MongoDB**
```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Start MongoDB
mongod
```

**Option 2: MongoDB Atlas**
1. Create account at mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Add to MONGODB_URI in .env

### 11.5 Initial Admin Setup

```bash
# Run admin creation script
cd backend
node scripts/createAdmin.js

# Or use the setup endpoint
# POST http://localhost:5000/api/setup/admin
# Body: { name, email, password, setupKey }
```

### 11.6 Quick Start Script

Create `start.bat` (Windows) or `start.sh` (Linux/Mac):

```bash
#!/bin/bash
# Start backend
cd backend && npm start &

# Start frontend
cd frontend_volunteer && npm run dev &

echo "Servers starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:8082"
```

---

## 12. Deployment Guide

### 12.1 Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET
- [ ] Configure HTTPS
- [ ] Set up MongoDB Atlas or production database
- [ ] Configure email service
- [ ] Set up domain and DNS
- [ ] Enable CORS for production domain
- [ ] Set secure cookie flags
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test all features

### 12.2 Backend Deployment (Heroku Example)

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create unitee-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-atlas-uri
heroku config:set JWT_SECRET=your-secret
# ... set all other env vars

# Deploy
git push heroku main

# Open app
heroku open
```

### 12.3 Frontend Deployment (Vercel Example)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend_volunteer
vercel

# Set environment variables in Vercel dashboard
# VITE_API_BASE_URL=https://your-backend-url.herokuapp.com/api
```

### 12.4 Alternative Deployment Options

**Backend:**
- AWS EC2
- DigitalOcean Droplet
- Google Cloud Platform
- Azure App Service
- Railway
- Render

**Frontend:**
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages
- Firebase Hosting

### 12.5 Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/volunteer
    depends_on:
      - mongo
  
  frontend:
    build: ./frontend_volunteer
    ports:
      - "80:80"
    depends_on:
      - backend
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

## 13. Testing

### 13.1 Backend Testing Scripts

Located in `backend/scripts/`:

1. **createAdmin.js** - Create admin user
2. **testAuth.js** - Test authentication flow
3. **testLogin.js** - Test login endpoint
4. **testAdminLogin.js** - Test admin login
5. **testCompleteAdminFlow.js** - Complete admin workflow test
6. **testDashboardDataFlow.js** - Test dashboard data
7. **testRegistration.js** - Test user registration
8. **checkUsers.js** - List all users
9. **showActualData.js** - Display database data
10. **showDatabaseInfo.js** - Database statistics
11. **clearDatabase.js** - Clear all data (use with caution)
12. **createTestCertificate.js** - Generate test certificate

### 13.2 Manual Testing

**Test User Accounts:**
```
Admin:
Email: admin@unitee.cm
Password: Admin@2024

Organizer:
Email: organizer@test.com
Password: Test@123

Volunteer:
Email: volunteer@test.com
Password: Test@123
```

### 13.3 API Testing with Postman

Import the API collection:
1. Create Postman collection
2. Add environment variables (baseUrl, token)
3. Test all endpoints
4. Verify responses

### 13.4 Frontend Testing

```bash
# Run linter
npm run lint

# Build test
npm run build

# Preview build
npm run preview
```

---

## 14. Future Enhancements

### 14.1 Planned Features

**Phase 1: Core Enhancements**
- [ ] Real-time chat for communities
- [ ] Video conferencing integration
- [ ] Mobile app (React Native)
- [ ] Advanced search with filters
- [ ] Map view for opportunities
- [ ] Calendar integration

**Phase 2: Gamification**
- [ ] Leaderboards
- [ ] Team challenges
- [ ] Seasonal events
- [ ] Referral system
- [ ] Social sharing
- [ ] Achievement showcases

**Phase 3: Analytics & Insights**
- [ ] Advanced analytics dashboard
- [ ] Impact reports
- [ ] Data visualization
- [ ] Export functionality
- [ ] Custom reports
- [ ] Predictive analytics

**Phase 4: Integration & Automation**
- [ ] Payment gateway (donations)
- [ ] SMS notifications
- [ ] Social media integration
- [ ] Calendar sync (Google, Outlook)
- [ ] Automated matching
- [ ] AI-powered recommendations

**Phase 5: Enterprise Features**
- [ ] Multi-language support
- [ ] White-label solution
- [ ] API for third-party integrations
- [ ] Advanced permissions
- [ ] Custom branding
- [ ] SLA monitoring

### 14.2 Technical Improvements

- [ ] GraphQL API
- [ ] WebSocket for real-time updates
- [ ] Redis caching
- [ ] Elasticsearch for search
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline
- [ ] Automated testing suite
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)

### 14.3 Security Enhancements

- [ ] Two-factor authentication
- [ ] Biometric authentication
- [ ] Advanced fraud detection
- [ ] Blockchain verification
- [ ] Audit logging
- [ ] GDPR compliance tools
- [ ] Data encryption at rest
- [ ] Security audits

---

## 15. Project Statistics

### 15.1 Codebase Metrics

**Backend:**
- Routes: 11 files
- Controllers: 9 files
- Models: 9 collections
- Middleware: 3 files
- Utilities: 2 files
- Scripts: 20+ test scripts

**Frontend:**
- Pages: 30+ components
- Components: 100+ reusable components
- Contexts: 3 global contexts
- Hooks: Custom hooks
- API Client: Centralized API layer

### 15.2 Feature Count

- User Roles: 3
- Badge Categories: 6
- Badge Tiers: 4
- Certificate Types: 5
- Opportunity Categories: 8+
- Admin Dashboard Tabs: 10
- API Endpoints: 80+
- Database Collections: 9

### 15.3 Technology Count

- Frontend Dependencies: 50+
- Backend Dependencies: 20+
- UI Components: 40+ (shadcn/ui)
- Icons: 50+ (Lucide React)

---

## 16. Support & Maintenance

### 16.1 Documentation

- README.md - Project overview
- PROJECT_DOCUMENTATION.md - This comprehensive guide
- BADGE_SYSTEM_IMPLEMENTATION.md - Badge system details
- CERTIFICATE_ENHANCEMENTS.md - Certificate system details
- ADMIN_LOGIN_FIXES.md - Admin authentication fixes
- NETWORK_ACCESS_FIX.md - Network configuration
- GOOGLE_OAUTH_SETUP.md - OAuth setup guide

### 16.2 Contact & Support

- Email: support@unitee.cm
- GitHub Issues: For bug reports and feature requests
- Documentation: In-code comments and markdown files

### 16.3 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Write tests
5. Submit pull request

### 16.4 License

MIT License - See LICENSE file for details

---

## 17. Conclusion

UNITEE is a comprehensive, production-ready volunteer management platform built with modern technologies and best practices. The platform successfully connects volunteers with meaningful opportunities while providing powerful tools for organizers and administrators.

**Key Achievements:**
✅ Complete authentication and authorization system
✅ Role-based dashboards for all user types
✅ Professional certificate generation with QR codes
✅ Comprehensive badge and achievement system
✅ Real-time notifications
✅ Admin panel with 10 management tabs
✅ Mobile-responsive design
✅ Security-first architecture
✅ Scalable codebase
✅ Extensive documentation

The platform is ready for deployment and can serve as a foundation for community-driven volunteer initiatives across Cameroon and beyond.

---

**Document Version:** 1.0  
**Last Updated:** February 27, 2026  
**Author:** UNITEE Development Team  
**Status:** Production Ready
