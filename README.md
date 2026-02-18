# UNITEE - Volunteer Community Action Platform

A comprehensive volunteer management platform connecting volunteers with community organizations and opportunities across Cameroon.

## 🌟 Features

### For Volunteers
- Browse and search volunteer opportunities
- Sign up for events and track participation
- Log volunteer hours
- Download certificates for completed activities
- Join communities and connect with other volunteers
- Track personal impact statistics and badges

### For Organizers
- Create and manage volunteer opportunities
- Review and manage volunteer applications
- Track volunteer participation
- Generate certificates for volunteers
- Manage community organizations

### For Administrators
- User management (suspend/activate accounts)
- Content moderation and report handling
- Create emergency alerts
- Platform analytics and oversight
- System-wide management tools

## 🚀 Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui component library
- React Router for navigation
- Context API for state management

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Passport.js for auth strategies
- RESTful API architecture

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend_volunteer
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

## 🎯 Usage

1. Access the application at `http://localhost:8080` (or the port shown in terminal)
2. Register as a volunteer or organizer
3. Browse opportunities and join communities
4. Start making a difference!

## 📱 Key Pages

- **Home** - Landing page with featured opportunities
- **Opportunities** - Browse and search all volunteer opportunities
- **Communities** - Discover and join community organizations
- **My Opportunities** - Track your registered and completed activities
- **Profile** - Manage your profile and view statistics
- **Dashboard** - Role-based dashboard (Volunteer/Organizer/Admin)

## 🔐 Authentication

The platform supports:
- Email/password registration and login
- Email verification
- Password reset functionality
- Role-based access control (Volunteer, Organizer, Admin)

## 🛠️ Development

### Project Structure
```
volunteer-community-action/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
├── frontend_volunteer/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Built for community impact in Cameroon
- Inspired by the need to connect volunteers with meaningful opportunities
- Thanks to all contributors and volunteers

## 📞 Support

For support, email support@unitee.cm or open an issue in the repository.
