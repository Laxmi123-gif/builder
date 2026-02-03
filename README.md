# Recipe Builder - Full Stack Application

A modern web application that helps users create personalized recipes based on available ingredients.

## Features

- **Authentication System**: Email/password + Google OAuth
- **Ingredient Matching**: Smart algorithm for recipe suggestions
- **Recipe Management**: CRUD operations with detailed views
- **User Features**: Favorites, ratings, cooking history
- **Admin Panel**: Recipe and user management
- **Responsive Design**: Mobile-first with dark/light mode

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT, bcrypt, Google OAuth
- **Deployment**: Vercel (frontend) + Render (backend)

## Quick Start

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Environment Setup**:
   - Copy `.env.example` to `.env` in both client and server directories
   - Add your MongoDB URI, JWT secret, and Google OAuth credentials

3. **Run development servers**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
recipe-builder/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS files
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── utils/            # Server utilities
└── docs/                 # Documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth

### Recipes
- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:id` - Get recipe by ID
- `POST /api/recipes` - Create recipe (admin)
- `PUT /api/recipes/:id` - Update recipe (admin)
- `DELETE /api/recipes/:id` - Delete recipe (admin)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/favorites` - Add to favorites
- `DELETE /api/users/favorites/:id` - Remove from favorites

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd client && npm run build`
3. Set output directory: `client/build`

### Backend (Render)
1. Create new Web Service on Render
2. Set build command: `cd server && npm install`
3. Set start command: `cd server && npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details