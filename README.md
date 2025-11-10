# 🚴 Bike Marketplace Platform

## Project Overview
A specialized marketplace platform for buying and selling bicycles, components, and spare parts in Estonia. The platform connects buyers with sellers (both individuals and businesses) and aims to become the go-to destination for cycling enthusiasts.

## Key Features

### For Buyers
- 🔍 Advanced search with detailed filters (brand, model, year, type, price, location)
- 📸 High-quality photos with standardized angles
- 🌍 Multi-language support (Estonian, Russian, English)
- 💬 Direct communication with sellers
- ⭐ Seller ratings and reviews
- 🚚 Delivery options (pickup or shipping)

### For Sellers
- 📝 Easy listing creation with guided photo instructions
- 🏷️ Structured forms (select brand → model → year)
- 💼 Business accounts (FIE/OÜ/AS) with invoicing
- 📊 Analytics and statistics
- 💰 Flexible payment options (direct or through platform)

### Monetization
- **Option A**: Free listing + commission on sale (3-5%) - payment through platform
- **Option B**: Paid listing (€2-5) + no commission - direct payment to seller

### Categories
1. **Complete Bicycles**
   - Road bikes (Race, Endurance, Aero, Climbing)
   - Mountain bikes (XC, Trail, Enduro, Downhill)
   - Gravel bikes
   - Hybrid/City bikes
   - E-bikes

2. **Components**
   - Groupsets (Shimano, SRAM, Campagnolo)
   - Wheels & Tires
   - Brakes
   - Fork & Shock
   - Handlebars & Stem
   - Saddle & Seatpost
   - Pedals

3. **Spare Parts**
   - Drivetrain parts
   - Brake system parts
   - Wheels & tire accessories
   - Cockpit parts
   - Suspension parts
   - Fasteners
   - Accessories

## Tech Stack

### Frontend
- React.js / Next.js
- TailwindCSS for styling
- i18next for translations
- React Query for data fetching

### Backend
- Node.js + Express.js
- PostgreSQL database
- JWT authentication
- Cloudinary for image storage

### Deployment
- Frontend: Vercel / Netlify
- Backend: Railway / Render
- Database: Railway / Supabase

## Database Structure

### Main Tables
1. **users**
   - id, email, password_hash, name, phone
   - user_type (individual/business)
   - business_details (FIE/OÜ/AS registration)
   - created_at, updated_at

2. **listings**
   - id, user_id, category (bicycle/component/part)
   - brand_id, model_id, year
   - condition (new/used), price, currency
   - description, location
   - payment_type (direct/platform)
   - photos (array of URLs)
   - status (active/sold/archived)
   - created_at, updated_at

3. **brands**
   - id, name, country, logo_url

4. **models**
   - id, brand_id, name, type
   - frame_materials, years_available

5. **components**
   - id, category, subcategory
   - brand, model, compatibility

6. **transactions**
   - id, listing_id, buyer_id, seller_id
   - amount, commission, payment_method
   - invoice_number (for business accounts)
   - status, created_at

7. **reviews**
   - id, transaction_id, reviewer_id, reviewee_id
   - rating, comment, created_at

## Photo Requirements

Standardized photo angles for bicycles:
1. Full bike - left side (drivetrain visible)
2. Full bike - right side
3. Close-up of drivetrain/groupset
4. Close-up of cockpit (handlebars/stem)
5. Frame/brand decals
6. Serial number
7. Any damage or wear (if used)
8. Components close-ups (if upgraded)

## Development Phases

### Phase 1: MVP (Demo)
- Basic UI with homepage, listing page, search
- Database with 10 brands and models
- Simple listing creation form
- Static demo data

### Phase 2: Full Version
- User authentication (login/register)
- Full CRUD for listings
- Payment integration
- Business accounts with invoicing
- Advanced filters and search
- Multi-language support
- Photo upload with instructions
- Messaging system

### Phase 3: Scale
- Mobile app (React Native)
- Advanced analytics
- Recommender system
- Integration with delivery services (Omniva, SmartPOST)
- SEO optimization
- Marketing tools for sellers

## Getting Started

```bash
# Clone repository
git clone <repo-url>

# Install dependencies
cd bike-marketplace
npm install

# Set up environment variables
cp .env.example .env

# Run development server
npm run dev
```

## Contributing
This is a private project. Contact the owner for contribution guidelines.

## License
Proprietary - All rights reserved

## Contact
For questions or business inquiries, contact: [Your Email]

---

**Built with ❤️ for Estonian cycling community**
