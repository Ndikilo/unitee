const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Volunteer = require('../models/Volunteer');

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

      // Check if volunteer already exists with this email
      let volunteer = await Volunteer.findOne({ email });

      if (volunteer) {
        // Link Google ID if not already linked
        if (!volunteer.googleId) {
          volunteer.googleId = profile.id;
          volunteer.verification.emailVerified = true;
          await volunteer.save({ validateBeforeSave: false });
        }
        return done(null, { doc: volunteer, userType: 'volunteer' });
      }

      // Create new volunteer via Google
      volunteer = await Volunteer.create({
        googleId: profile.id,
        name: profile.displayName,
        email,
        profile: {
          avatar: profile.photos?.[0]?.value || '',
        },
        verification: {
          emailVerified: true, // Google emails are pre-verified
        },
      });

      done(null, { doc: volunteer, userType: 'volunteer' });
    } catch (error) {
      done(error, null);
    }
  }));
}

passport.serializeUser((payload, done) => {
  done(null, { id: payload.doc._id, userType: payload.userType });
});

passport.deserializeUser(async ({ id, userType }, done) => {
  try {
    let doc = null;
    if (userType === 'volunteer') {
      doc = await Volunteer.findById(id);
    }
    done(null, doc ? { doc, userType } : null);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;