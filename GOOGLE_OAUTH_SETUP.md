# Google OAuth Setup Guide

## ✅ What's Already Done

Your UNITEE platform now has:
1. ✅ Modern login page with Google Sign-In button
2. ✅ Backend Google OAuth routes configured
3. ✅ Header navigation updated to use `/login` page
4. ✅ Social login UI with Google and Facebook buttons

## 🔧 Setup Google OAuth

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "UNITEE Volunteer Platform"
   
5. Add Authorized redirect URIs:
   ```
   http://localhost:5000/api/auth/google/callback
   http://localhost:5000/api/auth/google/callback
   ```
   
6. For production, add:
   ```
   https://yourdomain.com/api/auth/google/callback
   ```

7. Copy your:
   - Client ID
   - Client Secret

### Step 2: Update Backend Environment Variables

Edit `backend/.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here

# Make sure these are also set
FRONTEND_URL=http://localhost:8082
SESSION_SECRET=your_random_session_secret_here
```

### Step 3: Restart Backend Server

```bash
cd backend
npm start
```

### Step 4: Test Google Sign-In

1. Go to http://localhost:8082/login
2. Click "Google" button
3. You'll be redirected to Google login
4. After authentication, you'll be redirected back to your app

## 🎨 Current Features

### Login Page Features:
- ✅ Email/Password login
- ✅ Google Sign-In button (ready to use)
- ✅ Facebook button (placeholder - needs setup)
- ✅ Show/hide password toggle
- ✅ Forgot password link
- ✅ Beautiful gradient design
- ✅ Mobile responsive
- ✅ Stats showcase on desktop

### Navigation:
- ✅ Header "Sign In" button → `/login` page
- ✅ Header "Sign Up" button → `/register` page
- ✅ No more modal popups

## 🔐 Security Notes

1. **Never commit** your `.env` file to Git
2. Use different credentials for development and production
3. Keep your Client Secret secure
4. Regularly rotate your secrets

## 📱 Optional: Facebook Login Setup

To enable Facebook login:

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create an app
3. Add "Facebook Login" product
4. Get App ID and App Secret
5. Add to `.env`:
   ```env
   FACEBOOK_APP_ID=your_app_id
   FACEBOOK_APP_SECRET=your_app_secret
   ```
6. Update backend routes (similar to Google OAuth)

## 🚀 Production Deployment

When deploying to production:

1. Update `FRONTEND_URL` in backend `.env`
2. Add production redirect URI to Google Console
3. Use environment variables in your hosting platform
4. Enable HTTPS (required for OAuth)

## ✅ Testing Checklist

- [ ] Google Sign-In button appears on login page
- [ ] Clicking Google button redirects to Google login
- [ ] After Google auth, user is logged in
- [ ] User data is saved to database
- [ ] JWT token is generated
- [ ] User is redirected to dashboard

## 🆘 Troubleshooting

**Error: "redirect_uri_mismatch"**
- Check that redirect URI in Google Console matches exactly
- Include the protocol (http:// or https://)
- Check for trailing slashes

**Error: "Google+ API not enabled"**
- Enable Google+ API in Google Cloud Console

**Button doesn't work**
- Check backend is running
- Check `.env` variables are set
- Check browser console for errors

## 📞 Support

If you need help:
1. Check backend logs
2. Check browser console
3. Verify all environment variables are set
4. Ensure Google OAuth credentials are correct
