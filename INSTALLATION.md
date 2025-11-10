# 🚀 BikeMarket - Installation & Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** - [Download](https://git-scm.com/)

Optional (for full version):
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/)
- **Cloudinary Account** (for image uploads) - [Sign up](https://cloudinary.com/)

---

## 📦 Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd bike-marketplace
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables
```bash
# Copy the example env file
cp .env.example .env

# Edit .env file with your credentials
# For demo version, you can leave default values
```

### 4. Run Development Server
```bash
npm run dev
# or
yarn dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database Setup (For Full Version)

### PostgreSQL Setup

1. **Install PostgreSQL**
   - Download from [postgresql.org](https://www.postgresql.org/download/)
   - Or use Docker:
     ```bash
     docker run --name bike-db -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres
     ```

2. **Create Database**
   ```sql
   CREATE DATABASE bike_marketplace;
   ```

3. **Update .env**
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/bike_marketplace
   ```

4. **Run Migrations** (when available)
   ```bash
   npm run db:migrate
   ```

---

## 🖼️ Image Upload Setup (Cloudinary)

1. **Create Cloudinary Account**
   - Sign up at [cloudinary.com](https://cloudinary.com/)
   
2. **Get Credentials**
   - Go to Dashboard
   - Copy: Cloud Name, API Key, API Secret

3. **Update .env**
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

---

## 🚦 Running the Project

### Development Mode
```bash
npm run dev
```
- Hot reload enabled
- Runs on http://localhost:3000

### Production Build
```bash
# Build the project
npm run build

# Start production server
npm start
```

### Linting
```bash
npm run lint
```

---

## 📁 Project Structure

```
bike-marketplace/
├── database/              # JSON databases (demo version)
│   ├── bicycles.json     # Bike brands and models
│   └── components.json   # Components and parts
├── docs/                  # Documentation
│   └── PHOTO_GUIDE.md    # Photo instructions for sellers
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── page.tsx      # Homepage
│   │   ├── catalog/      # Catalog page
│   │   ├── layout.tsx    # Root layout
│   │   └── globals.css   # Global styles
│   ├── components/       # Reusable components (to be added)
│   ├── lib/             # Utility functions (to be added)
│   └── locales/         # Translations
│       └── translations.json
├── public/              # Static files
├── .env.example         # Environment variables template
├── package.json         # Dependencies
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # TailwindCSS configuration
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project overview
```

---

## 🌐 Available Pages (Demo Version)

- **/** - Homepage with search and categories
- **/catalog** - Browse bikes with filters
- **/listing/[id]** - Individual listing page (to be created)
- **/sell** - Create new listing (to be created)

---

## 🧪 Testing the Demo

### Test Data Available:
- **10 Brands:** Trek, Giant, Specialized, Cannondale, Scott, Merida, Cube, Canyon, Orbea, Bianchi
- **~60 Models** across different categories
- **Sample Listings** in catalog (6 demo bikes)

### Features to Test:
1. ✅ Homepage layout and navigation
2. ✅ Search bar (UI only, not functional yet)
3. ✅ Category buttons
4. ✅ Brand grid
5. ✅ Catalog page with filters
6. ✅ Grid/List view toggle
7. ✅ Responsive design (mobile/tablet/desktop)

---

## 🔧 Common Issues & Solutions

### Issue: "Module not found" errors
**Solution:** Run `npm install` to ensure all dependencies are installed

### Issue: Port 3000 already in use
**Solution:** 
```bash
# Kill process on port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# On Mac/Linux:
lsof -ti:3000 | xargs kill
```

### Issue: Styles not loading
**Solution:** Restart development server
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 📝 Next Steps

### For Demo to Full Version:

1. **Backend API**
   - Set up Express.js server
   - Create database schema
   - Implement REST API endpoints

2. **Authentication**
   - User registration/login
   - JWT tokens
   - Protected routes

3. **Listings CRUD**
   - Create listing form
   - Image upload functionality
   - Edit/Delete listings

4. **Search & Filters**
   - Connect filters to API
   - Implement search logic
   - Pagination

5. **Payments**
   - Stripe integration
   - Commission system
   - Invoicing for businesses

---

## 🤝 Contributing

This is currently a private project. For contribution guidelines, contact the project owner.

---

## 📧 Support

For questions or issues:
- Email: [your-email@example.com]
- GitHub Issues: [repository-url]/issues

---

## 📄 License

Proprietary - All rights reserved

---

**Happy coding! 🚴💻**
