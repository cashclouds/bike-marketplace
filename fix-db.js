const { Client } = require('pg');

async function fixDatabase() {
  const client = new Client({
    user: 'postgres',
    password: 'TahameRaha24',
    host: 'localhost',
    port: 5432,
    database: 'bike_marketplace'
  });

  try {
    await client.connect();
    console.log('🔧 Fixing database schema...\n');

    // Drop old tables
    console.log('Dropping old tables...');
    await client.query('DROP TABLE IF EXISTS orders CASCADE');
    await client.query('DROP TABLE IF EXISTS listings CASCADE');
    await client.query('DROP TABLE IF EXISTS bikes CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('✓ Old tables dropped\n');

    // Create users table
    console.log('Creating users table...');
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        user_type VARCHAR(50) DEFAULT 'individual',
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created\n');

    // Create listings table
    console.log('Creating listings table...');
    await client.query(`
      CREATE TABLE listings (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        brand_id INTEGER,
        model_name VARCHAR(255),
        type VARCHAR(100),
        year INTEGER,
        material VARCHAR(100),
        condition VARCHAR(50),
        price DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'EUR',
        location VARCHAR(255),
        description TEXT,
        photos JSONB DEFAULT '[]',
        payment_type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Listings table created\n');

    // Create bikes table (for reference)
    console.log('Creating bikes table...');
    await client.query(`
      CREATE TABLE bikes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100),
        seller_id INTEGER,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Bikes table created\n');

    // Create orders table
    console.log('Creating orders table...');
    await client.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        buyer_id INTEGER,
        bike_id INTEGER,
        quantity INTEGER DEFAULT 1,
        total_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Orders table created\n');

    console.log('✅ Database schema fixed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixDatabase();
