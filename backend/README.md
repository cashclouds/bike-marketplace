# BikeMarket Backend API

Express.js REST API для платформы BikeMarket - маркетплейса велосипедов.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd backend
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bike_marketplace
DB_USER=postgres
DB_PASSWORD=your_password
PORT=5000
JWT_SECRET=your_super_secret_key
```

3. **Create database**
```bash
createdb bike_marketplace
```

4. **Initialize database schema**
```bash
psql bike_marketplace < sql/01_init_schema.sql
psql bike_marketplace < sql/02_seed_data.sql
```

5. **Start development server**
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user (requires token)
- `PUT /api/users/me` - Update user profile (requires token)

### Listings
- `GET /api/listings` - Get all listings with filters
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing (requires auth)
- `PUT /api/listings/:id` - Update listing (requires auth, owner only)
- `DELETE /api/listings/:id` - Delete listing (requires auth, owner only)

### Brands
- `GET /api/brands` - Get all brands
- `GET /api/brands/:id` - Get single brand
- `GET /api/brands/:id/models` - Get brand models

### Models
- `GET /api/models` - Get all models with filters
- `GET /api/models/:id` - Get single model

### Components
- `GET /api/components` - Get all components with filters
- `GET /api/components/categories` - Get component categories
- `GET /api/components/:id` - Get single component

## 🔐 Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

Tokens are valid for 7 days by default.

## 📊 Database Schema

### Tables
- `users` - User accounts
- `brands` - Bike brands
- `models` - Bike models
- `listings` - Bike listings
- `components` - Components catalog
- `transactions` - Purchase transactions
- `reviews` - User reviews
- `messages` - Direct messages

See `sql/01_init_schema.sql` for full schema details.

## 🔄 Listing Filters

Query parameters for GET `/api/listings`:
- `brand_id` - Filter by brand
- `type` - Filter by type (Road, Mountain, etc.)
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `year` - Filter by year
- `material` - Filter by material
- `condition` - Filter by condition
- `location` - Filter by location
- `search` - Search in description and model
- `limit` - Results per page (default: 20)
- `offset` - Pagination offset (default: 0)

Example:
```
GET /api/listings?type=Mountain&minPrice=500&maxPrice=2000&limit=10
```

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run built application
- `npm run typecheck` - Check TypeScript types

### Project Structure
```
backend/
├── src/
│   ├── index.ts          # Main server file
│   ├── config/
│   │   └── database.ts   # Database configuration
│   ├── middleware/
│   │   └── auth.ts       # JWT authentication
│   └── routes/
│       ├── users.ts      # User routes
│       ├── listings.ts   # Listing routes
│       ├── brands.ts     # Brand routes
│       ├── models.ts     # Model routes
│       └── components.ts # Component routes
├── sql/
│   ├── 01_init_schema.sql # Database schema
│   └── 02_seed_data.sql   # Sample data
├── package.json
├── tsconfig.json
└── README.md
```

## 📝 Example Requests

### Register
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "user_type": "individual"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Listing
```bash
curl -X POST http://localhost:5000/api/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "brand_id": "trek-id",
    "model_name": "FX 3",
    "type": "Hybrid",
    "year": 2023,
    "material": "Aluminum",
    "condition": "used",
    "price": 450,
    "currency": "EUR",
    "location": "Tallinn",
    "description": "Great bike in good condition",
    "payment_type": "direct"
  }'
```

### Get Listings
```bash
curl http://localhost:5000/api/listings?type=Mountain&minPrice=500&maxPrice=2000
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production` in .env
- [ ] Use strong `JWT_SECRET`
- [ ] Configure PostgreSQL for production
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Configure email notifications
- [ ] Set up error logging
- [ ] Enable database backups
- [ ] Set up monitoring/alerts

### Deploy to Railway/Render
1. Push code to Git
2. Connect to Railway/Render
3. Set environment variables
4. Run migrations: `psql < sql/01_init_schema.sql`
5. Seed data: `psql < sql/02_seed_data.sql`
6. Deploy

## 🐛 Common Issues

### Database connection error
- Ensure PostgreSQL is running
- Check DB_HOST, DB_USER, DB_PASSWORD in .env
- Verify database exists: `psql -l`

### Port already in use
- Change PORT in .env
- Or kill process: `lsof -ti:5000 | xargs kill -9`

### JWT errors
- Ensure JWT_SECRET is set in .env
- Check token format in Authorization header
- Verify token hasn't expired

## 📞 Support

For issues or questions:
1. Check the README
2. Review example requests
3. Check server logs
4. Create an issue on GitHub

## 📄 License

Proprietary - All rights reserved

---

**Built for BikeMarket Estonia 🚴**
