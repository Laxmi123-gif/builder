# Recipe Builder - Deployment Guide

## Prerequisites

- Node.js 16+ and npm
- MongoDB database (local or cloud)
- Google OAuth credentials (optional)

## Local Development Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
npm run install-server

# Install client dependencies
npm run install-client
```

### 2. Environment Configuration

#### Server Environment (.env in server folder)
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recipe-builder
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
CLIENT_URL=http://localhost:3000
```

#### Client Environment (.env in client folder)
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Database Setup

```bash
# Start MongoDB locally or use MongoDB Atlas
# Seed the database with sample data
cd server
npm run seed
```

### 4. Run Development Servers

```bash
# Run both frontend and backend
npm run dev

# Or run separately:
npm run server  # Backend only
npm run client  # Frontend only
```

## Production Deployment

### Frontend Deployment (Vercel)

1. **Connect Repository to Vercel**
   - Import your GitHub repository
   - Set framework preset to "Create React App"

2. **Build Settings**
   - Build Command: `cd client && npm run build`
   - Output Directory: `client/build`
   - Install Command: `npm run install-client`

3. **Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
   ```

### Backend Deployment (Render)

1. **Create Web Service**
   - Connect your GitHub repository
   - Set runtime to Node.js

2. **Build Settings**
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`

3. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-production-jwt-secret
   JWT_EXPIRE=7d
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

### Alternative Backend Deployment (Heroku)

1. **Heroku CLI Setup**
   ```bash
   heroku create your-app-name
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   # ... other environment variables
   ```

2. **Deploy**
   ```bash
   git subtree push --prefix server heroku main
   ```

## Database Setup (MongoDB Atlas)

1. **Create Cluster**
   - Sign up at MongoDB Atlas
   - Create a new cluster
   - Create database user
   - Whitelist IP addresses

2. **Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/recipe-builder?retryWrites=true&w=majority
   ```

3. **Seed Production Database**
   ```bash
   # Set MONGODB_URI to production database
   cd server
   npm run seed
   ```

## Google OAuth Setup (Optional)

1. **Google Cloud Console**
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials

2. **Authorized Redirect URIs**
   ```
   http://localhost:5000/api/auth/google/callback  # Development
   https://your-backend-url.com/api/auth/google/callback  # Production
   ```

3. **Authorized JavaScript Origins**
   ```
   http://localhost:3000  # Development
   https://your-frontend-url.vercel.app  # Production
   ```

## Performance Optimization

### Frontend Optimizations
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Bundle analysis with webpack-bundle-analyzer
- Service worker for caching

### Backend Optimizations
- Database indexing for search queries
- Redis caching for frequently accessed data
- Image compression and CDN integration
- API rate limiting

## Monitoring and Analytics

### Error Tracking
- Sentry for error monitoring
- LogRocket for user session recording

### Performance Monitoring
- Google Analytics for user tracking
- New Relic for application performance

### Database Monitoring
- MongoDB Atlas monitoring
- Query performance optimization

## Security Considerations

### Authentication
- JWT token expiration and refresh
- Password hashing with bcrypt
- Rate limiting on auth endpoints

### Data Protection
- Input validation and sanitization
- CORS configuration
- HTTPS enforcement in production

### API Security
- Request size limits
- SQL injection prevention
- XSS protection headers

## Backup and Recovery

### Database Backups
- Automated daily backups with MongoDB Atlas
- Point-in-time recovery setup

### Code Backups
- Git repository with multiple remotes
- Automated deployment rollback procedures

## Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Multiple server instances
- Database replica sets

### Vertical Scaling
- Server resource monitoring
- Auto-scaling policies
- Performance bottleneck identification

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CLIENT_URL environment variable
   - Verify CORS configuration in server

2. **Database Connection Issues**
   - Verify MongoDB URI format
   - Check network connectivity
   - Validate database credentials

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

4. **Authentication Issues**
   - Verify JWT secret consistency
   - Check Google OAuth configuration
   - Validate redirect URIs

### Debug Commands

```bash
# Check server logs
heroku logs --tail  # Heroku
# or check Render logs in dashboard

# Test API endpoints
curl https://your-backend-url.com/api/health

# Check database connection
mongo "your-mongodb-uri"
```

## Support

For deployment issues or questions:
1. Check the troubleshooting section above
2. Review application logs
3. Verify environment variables
4. Test API endpoints individually

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Backend API responds to health check
- [ ] Database connection established
- [ ] User registration/login works
- [ ] Recipe search functionality works
- [ ] Ingredient matching algorithm works
- [ ] Admin panel accessible
- [ ] Google OAuth working (if enabled)
- [ ] Email notifications working (if enabled)
- [ ] Performance monitoring active
- [ ] Error tracking configured
- [ ] Backup systems operational