# UNITEE - Project Summary

## Quick Overview

**UNITEE** is a full-stack volunteer management platform connecting volunteers with community organizations across Cameroon.

## Technology Stack

**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui  
**Backend:** Node.js + Express + MongoDB + Mongoose  
**Authentication:** JWT + Passport.js + bcrypt  
**Special Features:** PDF generation (PDFKit) + QR codes

## Key Numbers

- **30+** Frontend pages
- **80+** API endpoints
- **9** Database collections
- **3** User roles (Volunteer, Organizer, Admin)
- **16** Default achievement badges
- **5** Certificate types
- **10** Admin dashboard tabs
- **100+** Reusable UI components

## Core Features

### For Volunteers
✅ Browse and register for opportunities  
✅ Track volunteer hours and impact  
✅ Earn badges and certificates  
✅ Join communities  
✅ Personal dashboard with statistics

### For Organizers
✅ Create and manage opportunities  
✅ Review volunteer applications  
✅ Generate certificates  
✅ Track volunteer participation  
✅ Analytics dashboard

### For Administrators
✅ Complete platform management  
✅ User management (suspend, activate, verify)  
✅ Content moderation  
✅ Badge system management  
✅ Emergency alerts  
✅ System health monitoring  
✅ Analytics and reporting

## Unique Features

1. **Professional Certificates**
   - PDF generation with QR codes
   - Digital signatures
   - Public verification
   - Tamper-proof design

2. **Badge System**
   - 6 categories (Participation, Hours, Impact, Community, Skills, Leadership)
   - 4 tiers (Bronze, Silver, Gold, Platinum)
   - Automatic awarding
   - Progress tracking
   - Admin management

3. **Multi-Role Dashboards**
   - Volunteer: Personal stats, badges, certificates
   - Organizer: Opportunity management, applications
   - Admin: 10-tab comprehensive control panel

4. **Security**
   - JWT authentication
   - Role-based access control
   - Rate limiting
   - Input sanitization
   - Password hashing
   - Email verification

## Project Structure

```
volunteer-community-action/
├── backend/
│   ├── src/
│   │   ├── config/         # Database & Passport config
│   │   ├── controllers/    # 9 controllers
│   │   ├── middleware/     # Auth & validation
│   │   ├── models/         # 9 MongoDB models
│   │   ├── routes/         # 11 route files
│   │   ├── utils/          # Badge system, helpers
│   │   └── server.js       # Entry point
│   ├── scripts/            # 20+ test scripts
│   └── package.json
│
├── frontend_volunteer/
│   ├── src/
│   │   ├── components/     # 100+ components
│   │   ├── contexts/       # Auth, Language, App
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # API client, utils
│   │   ├── pages/          # 30+ pages
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx
│   └── package.json
│
└── Documentation/
    ├── README.md
    ├── PROJECT_DOCUMENTATION.md (Complete guide)
    ├── BADGE_SYSTEM_IMPLEMENTATION.md
    ├── CERTIFICATE_ENHANCEMENTS.md
    └── Other guides...
```

## Database Collections

1. **Users** - User accounts and profiles
2. **Opportunities** - Volunteer opportunities
3. **Communities** - Community organizations
4. **Applications** - Volunteer applications
5. **Certificates** - Generated certificates
6. **Badges** - Achievement badges
7. **Notifications** - User notifications
8. **Reports** - Content reports
9. **EmergencyAlerts** - Emergency announcements

## API Routes Summary

- `/api/auth` - Authentication (9 endpoints)
- `/api/opportunities` - Opportunities (10 endpoints)
- `/api/communities` - Communities (8 endpoints)
- `/api/admin` - Admin operations (20+ endpoints)
- `/api/organizer` - Organizer operations (7 endpoints)
- `/api/certificates` - Certificates (6 endpoints)
- `/api/badges` - Badges (3 public + 7 admin endpoints)
- `/api/notifications` - Notifications (4 endpoints)
- `/api/reports` - Reports (2 endpoints)
- `/api/setup` - Initial setup (2 endpoints)

## Installation Quick Start

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your config
npm start

# Frontend
cd frontend_volunteer
npm install
cp .env.example .env
# Edit .env with your config
npm run dev
```

## Environment Variables

**Backend (.env):**
- PORT, NODE_ENV
- MONGODB_URI
- JWT_SECRET, JWT_EXPIRE
- CERTIFICATE_SECRET
- SMTP settings (optional)
- Google OAuth (optional)
- FRONTEND_URL

**Frontend (.env):**
- VITE_API_BASE_URL

## Default Credentials

**Admin:**
- Email: admin@unitee.cm
- Password: Admin@2024

## Deployment Ready

✅ Production-ready codebase  
✅ Security best practices  
✅ Scalable architecture  
✅ Comprehensive documentation  
✅ Docker support  
✅ Environment configuration  
✅ Error handling  
✅ Rate limiting  
✅ CORS configuration

## Testing

- 20+ backend test scripts
- Manual testing guides
- Postman collection ready
- Test user accounts included

## Documentation Files

1. **PROJECT_DOCUMENTATION.md** - Complete technical documentation (17 sections)
2. **BADGE_SYSTEM_IMPLEMENTATION.md** - Badge system details
3. **CERTIFICATE_ENHANCEMENTS.md** - Certificate system details
4. **ADMIN_LOGIN_FIXES.md** - Authentication fixes
5. **NETWORK_ACCESS_FIX.md** - Network configuration
6. **GOOGLE_OAUTH_SETUP.md** - OAuth setup
7. **README.md** - Project overview

## Status

🟢 **Production Ready**

- All core features implemented
- Security measures in place
- Documentation complete
- Testing scripts available
- Deployment guides included

## Next Steps

1. Deploy to production
2. Set up monitoring
3. Configure email service
4. Enable Google OAuth
5. Add mobile app (future)
6. Implement real-time chat (future)

---

**Version:** 1.0  
**Last Updated:** February 27, 2026  
**License:** MIT
