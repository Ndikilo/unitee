# Volunteer Community Platform - Deployment Guide

## Overview
This guide covers deploying both the frontend and backend of the Volunteer Community Platform to production.

## Prerequisites
- Node.js 18+ installed
- MongoDB database (local or cloud)
- Domain name (optional but recommended)
- SSL certificate (recommended for production)

## Backend Deployment

### Option 1: Vercel (Serverless)
1. Push your backend to GitHub
2. Connect your GitHub repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Deploy automatically on push

### Option 2: DigitalOcean/AWS/Traditional VPS

1. **Server Setup:**
```bash
# Update server
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx (for reverse proxy)
sudo apt install nginx -y
```

2. **Deploy Application:**
```bash
# Clone your repository
git clone <your-repo-url>
cd volunteer-community-action/backend

# Install dependencies
npm install --production

# Create environment file
cp .env.example .env
# Edit .env with production values

# Start with PM2
pm2 start src/server.js --name "volunteer-api"
pm2 startup
pm2 save
```

3. **Configure Nginx:**
```nginx
# /etc/nginx/sites-available/volunteer-api
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **Enable Site:**
```bash
sudo ln -s /etc/nginx/sites-available/volunteer-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Frontend Deployment

### Option 1: Vercel (Recommended)
1. Push your frontend to GitHub
2. Connect to Vercel
3. Set environment variable:
   - `VITE_API_BASE_URL=https://your-backend-domain.com/api
4. Deploy automatically

### Option 2: Netlify
1. Build the application:
```bash
cd frontend_volunteer
npm run build
```

2. Deploy the `dist` folder to Netlify
3. Set environment variable in Netlify dashboard
4. Configure redirects in `netlify.toml`:
```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-backend-domain.com/api/:splat"
  status = 200
```

### Option 3: Same VPS as Backend
1. Build the application:
```bash
cd frontend_volunteer
npm run build
```

2. Serve with Nginx:
```nginx
# Add to your Nginx config
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/frontend_volunteer/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/volunteer_app
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters
NODE_ENV=production
```

### Frontend (.env)
```env
VITE_API_BASE_URL=https://your-domain.com/api
VITE_APP_NAME=Volunteer Community Platform
VITE_APP_VERSION=1.0.0
```

## Database Setup

### MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create database user
4. Get connection string
5. Add your IP to whitelist
6. Use connection string in `MONGODB_URI`

### Local MongoDB
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Monitoring and Logging

### PM2 Monitoring
```bash
# View logs
pm2 logs volunteer-api

# Monitor
pm2 monit

# Restart
pm2 restart volunteer-api
```

### Application Logs
Consider implementing a logging solution like:
- Winston for structured logging
- Log aggregation with ELK stack
- Cloud logging services

## Security Considerations

1. **Environment Variables:** Never commit `.env` files
2. **JWT Secret:** Use a strong, random secret
3. **Database Security:** Use MongoDB Atlas with proper authentication
4. **HTTPS:** Always use SSL in production
5. **Rate Limiting:** Implement rate limiting on API endpoints
6. **Input Validation:** Validate all user inputs
7. **CORS:** Configure CORS properly for your domain

## Testing Before Going Live

1. **API Testing:**
```bash
# Test all endpoints
curl -X GET https://your-domain.com/api/test
```

2. **Frontend Testing:**
- Check all pages load correctly
- Test authentication flow
- Verify API calls work

3. **Performance Testing:**
- Use tools like Lighthouse
- Test API response times
- Check mobile responsiveness

## Backup Strategy

1. **Database Backups:**
   - MongoDB Atlas: Enable automated backups
   - Self-hosted: Set up cron jobs for backups

2. **Code Backups:**
   - Use Git with proper branching
   - Tag releases

## Troubleshooting

### Common Issues:
1. **CORS Errors:** Check backend CORS configuration
2. **Database Connection:** Verify MongoDB URI and network access
3. **Environment Variables:** Ensure all required variables are set
4. **Build Failures:** Check Node.js version compatibility

### Debug Commands:
```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check logs
sudo journalctl -u nginx -f
pm2 logs volunteer-api --lines 100
```

## Post-Deployment Checklist

- [ ] All environment variables set
- [ ] SSL certificate installed
- [ ] Database connected
- [ ] API endpoints responding
- [ ] Frontend loads correctly
- [ ] Authentication flow works
- [ ] Error pages configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Security audit completed
