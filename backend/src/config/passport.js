const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const callbackURL = process.env.NODE_ENV === 'production'
    ? `${process.env.BACKEND_URL || 'https://unitee.onrender.com'}/api/auth/google/callback`
    : 'http://localhost:5000/api/auth/google/callback';

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;

      // Check if user already exists
      let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

      if (user) {
        if (!user.googleId) {
          user.googleId = profile.id;
          user.emailVerified = true;
          await user.save({ validateBeforeSave: false });
        }
        return done(null, user);
      }

      // Create new user via Google OAuth
      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email,
        emailVerified: true,
        role: 'user',
        profile: {
          avatar: profile.photos?.[0]?.value || '',
        },
      });

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
}

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
