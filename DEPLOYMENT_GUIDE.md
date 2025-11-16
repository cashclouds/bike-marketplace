# 🚀 Deployment Guide - Render

## Status
✅ **ALL READY FOR DEPLOYMENT**

## What Was Done

### Backend Routes
- ✅ `routes/users.ts` - GET /api/users/:id endpoint for seller profiles
- ✅ `routes/favorites.ts` - POST/GET/DELETE /api/favorites endpoints
- ✅ Both registered in `index.ts`

### Database
- ✅ Migration file: `sql/04_add_favorites.sql`
- ✅ Creates `favorites` table with proper schema
- ✅ Includes indexes for performance

### Frontend Integration
- ✅ API methods: getUser, getFavorites, addToFavorites, removeFromFavorites
- ✅ Seller page uses getUser()
- ✅ Listing page integrates with favorites API

### GitHub
- ✅ Commits pushed: 39293bd, ab79079, 342aa71
- ✅ All code on main branch

## Deployment Steps

### 1. Backend (Render)
```
1. Go to https://dashboard.render.com
2. Find "bike-marketplace-backend" service
3. Click "Deploy latest commit"
4. Wait for deployment to complete (3-5 minutes)
5. Check that service status is "Live"
```

### 2. Verify API Endpoints
After deployment, test these endpoints:

```bash
# Get user profile
curl -X GET https://your-backend.onrender.com/api/users/{user_id}

# Get favorites
curl -X GET https://your-backend.onrender.com/api/favorites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Add to favorites
curl -X POST https://your-backend.onrender.com/api/favorites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"listing_id": "listing-id-here"}'

# Delete from favorites
curl -X DELETE https://your-backend.onrender.com/api/favorites/{listing_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Files Changed

### Backend
- `backend/src/routes/users.ts` - Added GET /:id endpoint
- `backend/src/routes/favorites.ts` - Created with CRUD operations
- `backend/src/index.ts` - Registered favorites route
- `backend/sql/04_add_favorites.sql` - Database migration

### Frontend
- `src/lib/api.ts` - Added API methods for users and favorites
- `src/app/seller/page.tsx` - Created seller profile page
- `src/app/listing/page.tsx` - Fixed button handlers

## Database Schema

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON favorites(listing_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);
```

## Key Commits

1. **39293bd** - Feature: Add seller profile page and user endpoint
2. **ab79079** - Feature: Implement favorites with persistent API storage
3. **342aa71** - Fix: Ensure all button handlers work correctly on listing page

## Notes

- Render will automatically execute the migration SQL on deployment
- Make sure DATABASE_URL environment variable is set
- Frontend on Vercel will auto-deploy when GitHub is updated
- All API endpoints require proper error handling on frontend

---

**Ready to deploy! 🚀**
